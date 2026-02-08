import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminChatMessage } from './AdminChatMessage';
import { AdminChatInput } from './AdminChatInput';
import {
  MessageCircle,
  Users,
  Circle,
  Clock,
  User as UserIcon,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatRoom {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  lastMessage?: ChatMessage;
}

interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  role: string;
  is_online: boolean | null;
  last_seen_at: string | null;
}

interface ChatMessage {
  id: string;
  room_id: string;
  participant_id: string;
  content: string;
  created_at: string;
  is_read: boolean | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  participant?: {
    display_name: string;
    role: string;
  };
}

export const AdminChatView = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeParticipant, setEmployeeParticipant] = useState<ChatParticipant | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadRooms = useCallback(async () => {
    const { data: roomsData, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return;

    const roomsWithDetails = await Promise.all(
      (roomsData || []).map(async (room) => {
        const { data: participantsData } = await supabase
          .from('chat_participants')
          .select('*')
          .eq('room_id', room.id);

        const { data: messagesData } = await supabase
          .from('chat_messages')
          .select('content, created_at')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...room,
          participants: participantsData as ChatParticipant[],
          lastMessage: messagesData?.[0] as ChatMessage | undefined,
        };
      })
    );

    setRooms(roomsWithDetails);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadRooms();
  }, [user, loadRooms]);

  // Realtime: room updates
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel('admin-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => loadRooms())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => loadRooms())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadRooms]);

  const loadMessages = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, participant:chat_participants(display_name, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, []);

  const loadParticipants = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId);
    setParticipants((data || []) as ChatParticipant[]);
    const existing = (data || []).find((p: any) => p.user_id === user?.id);
    if (existing) setEmployeeParticipant(existing as ChatParticipant);
  }, [user]);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('join_chat_room', {
      p_room_id: roomId,
      p_display_name: profile?.display_name || user.email?.split('@')[0] || 'Employé',
      p_role: 'employee',
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de rejoindre le chat' });
      return null;
    }
    return data as unknown as ChatParticipant;
  }, [user, profile, toast]);

  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id);
    await loadParticipants(room.id);
    const p = await joinRoom(room.id);
    if (p) setEmployeeParticipant(p);
  };

  // Realtime: messages in selected room
  useEffect(() => {
    if (!selectedRoom) return;
    const ch = supabase
      .channel(`admin-msgs-${selectedRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `room_id=eq.${selectedRoom.id}`,
      }, async (payload) => {
        const { data: pd } = await supabase
          .from('chat_participants')
          .select('display_name, role')
          .eq('id', payload.new.participant_id)
          .single();
        setMessages(prev => [...prev, { ...payload.new, participant: pd } as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedRoom]);

  const clientsInRoom = participants.filter(p => p.role === 'client');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Room list */}
      <Card className={`lg:col-span-1 flex flex-col overflow-hidden ${selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
        <CardHeader className="pb-3 border-b bg-card">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-primary" />
            Conversations
            <Badge variant="secondary" className="ml-auto text-xs font-normal">
              {rooms.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rooms.map((room) => {
                const client = room.participants?.find(p => p.role === 'client');
                const isSelected = selectedRoom?.id === room.id;
                const initial = (client?.display_name || 'C')[0].toUpperCase();

                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full p-3.5 text-left transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary/8 border-l-3 border-l-primary'
                        : 'hover:bg-muted/50 border-l-3 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {initial}
                        </div>
                        {client?.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                            {client?.display_name || room.name || 'Client'}
                          </p>
                          {room.lastMessage && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(room.lastMessage.created_at), {
                                addSuffix: false,
                                locale: fr,
                              })}
                            </span>
                          )}
                        </div>
                        {room.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {room.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat area */}
      <Card className={`lg:col-span-2 flex flex-col overflow-hidden ${!selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 shrink-0"
                onClick={() => setSelectedRoom(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                clientsInRoom[0]?.is_online ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}>
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {clientsInRoom[0]?.display_name || selectedRoom.name || 'Client'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {clientsInRoom[0]?.is_online ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      En ligne
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {clientsInRoom[0]?.last_seen_at
                        ? formatDistanceToNow(new Date(clientsInRoom[0].last_seen_at), { addSuffix: true, locale: fr })
                        : 'Hors ligne'}
                    </span>
                  )}
                  <span className="text-muted-foreground/40">·</span>
                  <span>{participants.length} participant(s)</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun message pour le moment</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <AdminChatMessage key={message.id} message={message} />
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            {employeeParticipant && (
              <AdminChatInput
                roomId={selectedRoom.id}
                participantId={employeeParticipant.id}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 opacity-40" />
              </div>
              <p className="font-medium">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">Choisissez un chat dans la liste pour commencer</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
