import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from '@/hooks/useNotificationSound';

interface ChatMessage {
  id: string;
  room_id: string;
  participant_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  participant?: {
    display_name: string;
    role: string;
  };
}

interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  role: 'client' | 'employee';
  session_id: string | null;
  is_online: boolean;
}

interface ChatRoom {
  id: string;
  name: string | null;
  created_at: string;
}

interface TypingUser {
  participantId: string;
  displayName: string;
  role: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentRoom: ChatRoom | null;
  currentParticipant: ChatParticipant | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  typingUsers: TypingUser[];
  resetUnread: () => void;
  joinOrCreateRoom: (displayName: string, role?: 'client' | 'employee') => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  joinExistingRoom: (roomId: string, displayName: string) => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  sendMessage: (content: string) => Promise<boolean>;
  leaveChat: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  loadParticipants: (roomId: string) => Promise<void>;
  broadcastTyping: () => void;
  notificationSound: ReturnType<typeof useNotificationSound>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ChatParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const notificationSound = useNotificationSound();

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
    setIsChatVisible(true);
  }, []);

  // No more anonymous sessions - all users must be authenticated

  const loadMessages = useCallback(async (roomId: string) => {
    const { data, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*, participant:chat_participants(display_name, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error loading messages:', fetchError);
      return;
    }

    setMessages(data || []);
  }, []);

  const loadParticipants = useCallback(async (roomId: string) => {
    const { data, error: fetchError } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId);

    if (fetchError) {
      console.error('Error loading participants:', fetchError);
      return;
    }

    setParticipants((data || []) as ChatParticipant[]);
  }, []);

  const joinOrCreateRoom = useCallback(async (displayName: string, requestedRole: 'client' | 'employee' = 'client') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error('Vous devez être connecté pour utiliser le chat');
      }

      const roomName = 'Chat avec ' + displayName;

      // Use the SECURITY DEFINER function to create room and join atomically
      const { data, error: rpcError } = await supabase.rpc('create_chat_room_and_join', {
        p_room_name: roomName,
        p_display_name: displayName,
        p_role: requestedRole
      });

      if (rpcError) throw rpcError;

      const result = data as unknown as { room: ChatRoom; participant: ChatParticipant };
      const room = result.room;
      const participant = result.participant;

      setCurrentRoom(room);
      setCurrentParticipant(participant);

      await loadMessages(room.id);
      await loadParticipants(room.id);

      return { room, participant };
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join chat');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadMessages, loadParticipants]);

  const joinExistingRoom = useCallback(async (roomId: string, displayName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error('Authentication required to join as employee');
      }

      // Use the SECURITY DEFINER function to join the room
      const { data, error: rpcError } = await supabase.rpc('join_chat_room', {
        p_room_id: roomId,
        p_display_name: displayName,
        p_role: 'employee'
      });

      if (rpcError) throw rpcError;

      const participant = data as unknown as ChatParticipant;

      // Fetch the room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      setCurrentRoom(room);
      setCurrentParticipant(participant);
      await loadMessages(roomId);
      await loadParticipants(roomId);

      return { room, participant };
    } catch (err) {
      console.error('Error joining existing room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join chat');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadMessages, loadParticipants]);

  const MAX_MESSAGE_LENGTH = 5000;

  const sendMessage = useCallback(async (content: string) => {
    if (!currentRoom || !currentParticipant || !content.trim()) {
      return false;
    }

    const trimmedContent = content.trim();
    
    // Client-side validation for message length
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      setError(`Message trop long (maximum ${MAX_MESSAGE_LENGTH} caractères)`);
      return false;
    }

    try {
      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          participant_id: currentParticipant.id,
          content: trimmedContent
        });

      if (sendError) throw sendError;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  }, [currentRoom, currentParticipant]);

  const leaveChat = useCallback(async () => {
    if (currentParticipant) {
      await supabase
        .from('chat_participants')
        .update({ is_online: false, last_seen_at: new Date().toISOString() })
        .eq('id', currentParticipant.id);
    }
    setCurrentRoom(null);
    setCurrentParticipant(null);
    setMessages([]);
    setParticipants([]);
    setUnreadCount(0);
    setIsChatVisible(false);
  }, [currentParticipant]);

  // Broadcast typing indicator
  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !currentParticipant) return;
    typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        participantId: currentParticipant.id,
        displayName: currentParticipant.display_name,
        role: currentParticipant.role,
      },
    });
  }, [currentParticipant]);

  // Subscribe to typing broadcast + messages + participants
  useEffect(() => {
    if (!currentRoom) return;

    // Typing broadcast channel
    const typingChannel = supabase
      .channel('typing-' + currentRoom.id)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.participantId === currentParticipant?.id) return;

        const user: TypingUser = {
          participantId: payload.participantId,
          displayName: payload.displayName,
          role: payload.role,
        };

        setTypingUsers(prev => {
          const exists = prev.some(u => u.participantId === user.participantId);
          return exists ? prev : [...prev, user];
        });

        // Clear previous timeout for this user
        const prev = typingTimeouts.current.get(user.participantId);
        if (prev) clearTimeout(prev);

        const timeout = setTimeout(() => {
          setTypingUsers(p => p.filter(u => u.participantId !== user.participantId));
          typingTimeouts.current.delete(user.participantId);
        }, 3000);
        typingTimeouts.current.set(user.participantId, timeout);
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    const messagesChannel = supabase
      .channel('messages-' + currentRoom.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'room_id=eq.' + currentRoom.id
        },
        async (payload) => {
          const { data: participantData } = await supabase
            .from('chat_participants')
            .select('display_name, role')
            .eq('id', payload.new.participant_id)
            .single();

          const newMessage = {
            ...payload.new,
            participant: participantData
          } as ChatMessage;

          setMessages(prev => [...prev, newMessage]);

          // Remove sender from typing users
          setTypingUsers(p => p.filter(u => u.participantId !== payload.new.participant_id));

          // Increment unread & play sound if message is from employee and chat is not visible
          if (participantData?.role === 'employee') {
            setUnreadCount(prev => prev + 1);
            notificationSound.playSound();
          }
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('participants-' + currentRoom.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: 'room_id=eq.' + currentRoom.id
        },
        () => {
          loadParticipants(currentRoom.id);
        }
      )
      .subscribe();

    return () => {
      typingChannelRef.current = null;
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
      typingTimeouts.current.forEach(t => clearTimeout(t));
      typingTimeouts.current.clear();
      setTypingUsers([]);
    };
  }, [currentRoom, currentParticipant?.id, loadParticipants]);

  const value: ChatContextType = {
    messages,
    participants,
    currentRoom,
    currentParticipant,
    isLoading,
    error,
    unreadCount,
    typingUsers,
    resetUnread,
    joinOrCreateRoom,
    joinExistingRoom,
    sendMessage,
    leaveChat,
    loadMessages,
    loadParticipants,
    broadcastTyping,
    notificationSound
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
