import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useBrowserNotification } from '@/hooks/useBrowserNotification';

interface ChatMessage {
  id: string;
  room_id: string;
  participant_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
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
  employeeLastReadAt: string | null;
  resetUnread: () => void;
  joinOrCreateRoom: (displayName: string, role?: 'client' | 'employee') => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  joinExistingRoom: (roomId: string, displayName: string) => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  sendMessage: (content: string, file?: File) => Promise<boolean>;
  leaveChat: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  loadParticipants: (roomId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  broadcastTyping: () => void;
  notificationSound: ReturnType<typeof useNotificationSound>;
  browserNotification: ReturnType<typeof useBrowserNotification>;
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
  const [employeeLastReadAt, setEmployeeLastReadAt] = useState<string | null>(null);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const notificationSound = useNotificationSound();
  const browserNotification = useBrowserNotification();
  
  // Refs to avoid stale closures in realtime subscription
  const playSoundRef = useRef(notificationSound.playSound);
  const sendNotificationRef = useRef(browserNotification.sendNotification);
  playSoundRef.current = notificationSound.playSound;
  sendNotificationRef.current = browserNotification.sendNotification;

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

    const parts = (data || []) as ChatParticipant[];
    setParticipants(parts);
    
    // Track the latest employee last_read_at
    const employeeReadTimes = parts
      .filter(p => p.role === 'employee' && (p as any).last_read_at)
      .map(p => (p as any).last_read_at as string);
    if (employeeReadTimes.length > 0) {
      employeeReadTimes.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      setEmployeeLastReadAt(employeeReadTimes[0]);
    }
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
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!currentRoom || !currentParticipant) return false;
    if (!content.trim() && !file) return false;

    const trimmedContent = content.trim();

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      setError(`Message trop long (maximum ${MAX_MESSAGE_LENGTH} caractères)`);
      return false;
    }

    if (file && file.size > MAX_FILE_SIZE) {
      setError('Fichier trop volumineux (maximum 10 Mo)');
      return false;
    }

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (file) {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        const ext = file.name.split('.').pop();
        const path = `${userId}/${currentRoom.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(path);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          participant_id: currentParticipant.id,
          content: trimmedContent || (fileName ? `📎 ${fileName}` : ''),
          ...(fileUrl && { file_url: fileUrl, file_name: fileName, file_type: fileType }),
        } as any);

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

  // Mark messages as read by updating last_read_at
  const markAsRead = useCallback(async () => {
    if (!currentParticipant || !currentRoom) return;
    const now = new Date().toISOString();
    await supabase
      .from('chat_participants')
      .update({ last_read_at: now } as any)
      .eq('id', currentParticipant.id);
  }, [currentParticipant, currentRoom]);

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

          // Play sound & push notification for messages from others
          if (payload.new.participant_id !== currentParticipant?.id) {
            setUnreadCount(prev => prev + 1);
            playSoundRef.current();
            sendNotificationRef.current('Nouveau message', {
              body: `${participantData?.display_name}: ${(payload.new as any).content?.substring(0, 100)}`,
              tag: 'chat-message',
            });
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
    employeeLastReadAt,
    resetUnread,
    joinOrCreateRoom,
    joinExistingRoom,
    sendMessage,
    leaveChat,
    loadMessages,
    loadParticipants,
    markAsRead,
    broadcastTyping,
    notificationSound,
    browserNotification
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
