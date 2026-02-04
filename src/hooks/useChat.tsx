import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface ChatContextType {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentRoom: ChatRoom | null;
  currentParticipant: ChatParticipant | null;
  isLoading: boolean;
  error: string | null;
  joinOrCreateRoom: (displayName: string, role?: 'client' | 'employee') => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  joinExistingRoom: (roomId: string, displayName: string) => Promise<{ room: ChatRoom; participant: ChatParticipant } | null>;
  sendMessage: (content: string) => Promise<boolean>;
  leaveChat: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  loadParticipants: (roomId: string) => Promise<void>;
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

  const getSessionId = useCallback(() => {
    const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    try {
      const stored = localStorage.getItem('chat_session');
      if (stored) {
        const sessionData = JSON.parse(stored);
        // Check if session is still valid
        if (sessionData.expires && Date.now() < sessionData.expires) {
          return sessionData.id;
        }
        // Session expired, remove it
        localStorage.removeItem('chat_session');
      }
    } catch {
      // Invalid session data, clear it
      localStorage.removeItem('chat_session');
    }
    
    // Create new cryptographically secure session
    const sessionId = 'anon_' + crypto.randomUUID();
    const sessionData = {
      id: sessionId,
      created: Date.now(),
      expires: Date.now() + SESSION_EXPIRY_MS
    };
    localStorage.setItem('chat_session', JSON.stringify(sessionData));
    return sessionId;
  }, []);

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
      // Security: Only allow 'employee' role for authenticated users
      // Anonymous users are always 'client' regardless of requested role
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const sessionId = user ? null : getSessionId();
      
      // Enforce role based on authentication status
      const role: 'client' | 'employee' = user ? requestedRole : 'client';

      let room: ChatRoom | null = null;

      if (role === 'client') {
        let existingParticipant = null;
        
        if (user) {
          const { data } = await supabase
            .from('chat_participants')
            .select('room_id')
            .eq('user_id', user.id)
            .eq('role', 'client')
            .maybeSingle();
          existingParticipant = data;
        } else if (sessionId) {
          const { data } = await supabase
            .from('chat_participants')
            .select('room_id')
            .eq('session_id', sessionId)
            .eq('role', 'client')
            .maybeSingle();
          existingParticipant = data;
        }

        if (existingParticipant) {
          const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('id', existingParticipant.room_id)
            .single();
          
          if (existingRoom) {
            room = existingRoom;
          }
        }

        if (!room) {
          // IMPORTANT: do not request RETURNING data here.
          // The SELECT policy on chat_rooms requires the user to already be a participant,
          // and PostgREST will evaluate SELECT RLS when returning inserted rows.
          const roomId = crypto.randomUUID();
          const roomName = 'Chat avec ' + displayName;

          const { error: roomError } = await supabase
            .from('chat_rooms')
            .insert({ id: roomId, name: roomName });

          if (roomError) throw roomError;

          // Temporary local representation; we'll re-fetch after participant creation.
          room = {
            id: roomId,
            name: roomName,
            created_at: new Date().toISOString()
          };
        }
      }

      if (!room) {
        throw new Error('Could not create or find room');
      }

      let existingPart = null;
      if (user) {
        const { data } = await supabase
          .from('chat_participants')
          .select('*')
          .eq('room_id', room.id)
          .eq('user_id', user.id)
          .maybeSingle();
        existingPart = data;
      } else if (sessionId) {
        const { data } = await supabase
          .from('chat_participants')
          .select('*')
          .eq('room_id', room.id)
          .eq('session_id', sessionId)
          .maybeSingle();
        existingPart = data;
      }

      let participant: ChatParticipant;

      if (existingPart) {
        participant = existingPart as ChatParticipant;
        await supabase
          .from('chat_participants')
          .update({ is_online: true, last_seen_at: new Date().toISOString() })
          .eq('id', participant.id);
      } else {
        const { data: newParticipant, error: partError } = await supabase
          .from('chat_participants')
          .insert({
            room_id: room.id,
            user_id: user?.id || null,
            display_name: displayName,
            role,
            session_id: sessionId,
            is_online: true
          })
          .select()
          .single();

        if (partError) throw partError;
        participant = newParticipant as ChatParticipant;
      }

      // Now that the user is a participant, they can SELECT the room safely.
      // (This avoids RLS failures on INSERT ... RETURNING.)
      const { data: roomAfterJoin } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', room.id)
        .maybeSingle();

      if (roomAfterJoin) {
        room = roomAfterJoin;
      }

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
  }, [getSessionId, loadMessages, loadParticipants]);

  const joinExistingRoom = useCallback(async (roomId: string, displayName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        throw new Error('Authentication required to join as employee');
      }

      const { data: existingPart } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();

      let participant: ChatParticipant;

      if (existingPart) {
        participant = existingPart as ChatParticipant;
        await supabase
          .from('chat_participants')
          .update({ is_online: true, last_seen_at: new Date().toISOString() })
          .eq('id', participant.id);
      } else {
        const { data: newParticipant, error: partError } = await supabase
          .from('chat_participants')
          .insert({
            room_id: roomId,
            user_id: user.id,
            display_name: displayName,
            role: 'employee',
            session_id: null,
            is_online: true
          })
          .select()
          .single();

        if (partError) throw partError;
        participant = newParticipant as ChatParticipant;
      }

      // Fetch the room only after the participant exists (SELECT RLS depends on membership)
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
  }, [currentParticipant]);

  useEffect(() => {
    if (!currentRoom) return;

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
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [currentRoom, loadParticipants]);

  const value: ChatContextType = {
    messages,
    participants,
    currentRoom,
    currentParticipant,
    isLoading,
    error,
    joinOrCreateRoom,
    joinExistingRoom,
    sendMessage,
    leaveChat,
    loadMessages,
    loadParticipants
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
