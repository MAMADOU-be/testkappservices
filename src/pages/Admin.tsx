import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MessageCircle, 
  Users, 
  LogOut, 
  Send,
  Circle,
  Clock,
  User as UserIcon,
  Settings
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatRoom {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
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
  participant?: {
    display_name: string;
    role: string;
  };
}

const Admin = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, hasAnyRole, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [employeeParticipant, setEmployeeParticipant] = useState<ChatParticipant | null>(null);

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasAnyRole(['admin', 'employee'])) {
        navigate('/');
        toast({
          variant: 'destructive',
          title: 'Accès refusé',
          description: 'Vous n\'avez pas les permissions nécessaires',
        });
      }
    }
  }, [user, authLoading, profileLoading, hasAnyRole, navigate, toast]);

  // Load all chat rooms
  const loadRooms = useCallback(async () => {
    const { data: roomsData, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading rooms:', error);
      return;
    }

    // Load participants and last message for each room
    const roomsWithDetails = await Promise.all(
      (roomsData || []).map(async (room) => {
        const { data: participantsData } = await supabase
          .from('chat_participants')
          .select('*')
          .eq('room_id', room.id);

        const { data: messagesData } = await supabase
          .from('chat_messages')
          .select('*, participant:chat_participants(display_name, role)')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const clientParticipants = (participantsData || []).filter(p => p.role === 'client');

        return {
          ...room,
          participants: participantsData as ChatParticipant[],
          lastMessage: messagesData?.[0] as ChatMessage | undefined,
          clientName: clientParticipants[0]?.display_name || 'Client',
        };
      })
    );

    setRooms(roomsWithDetails);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user, loadRooms]);

  // Subscribe to real-time updates for rooms
  useEffect(() => {
    if (!user) return;

    const roomsChannel = supabase
      .channel('admin-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        () => loadRooms()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => loadRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [user, loadRooms]);

  // Load messages for selected room
  const loadMessages = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, participant:chat_participants(display_name, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  }, []);

  // Load participants for selected room
  const loadParticipants = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error loading participants:', error);
      return;
    }

    setParticipants(data as ChatParticipant[] || []);
    
    // Check if current user is already a participant
    const existingParticipant = (data || []).find(p => p.user_id === user?.id);
    if (existingParticipant) {
      setEmployeeParticipant(existingParticipant as ChatParticipant);
    }
  }, [user]);

  // Join room as employee
  const joinRoomAsEmployee = useCallback(async (roomId: string) => {
    if (!user) return null;

    // Check if already a participant
    const { data: existing } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Update online status
      await supabase
        .from('chat_participants')
        .update({ is_online: true, last_seen_at: new Date().toISOString() })
        .eq('id', existing.id);
      return existing as ChatParticipant;
    }

    // Create new participant as employee
    const { data: newParticipant, error } = await supabase
      .from('chat_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Employé',
        role: 'employee',
        is_online: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error joining room:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de rejoindre le chat',
      });
      return null;
    }

    return newParticipant as ChatParticipant;
  }, [user, toast]);

  // Select a room
  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id);
    await loadParticipants(room.id);
    
    const participant = await joinRoomAsEmployee(room.id);
    if (participant) {
      setEmployeeParticipant(participant);
    }
  };

  // Subscribe to messages in selected room
  useEffect(() => {
    if (!selectedRoom) return;

    const messagesChannel = supabase
      .channel(`admin-messages-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        async (payload) => {
          const { data: participantData } = await supabase
            .from('chat_participants')
            .select('display_name, role')
            .eq('id', payload.new.participant_id)
            .single();

          const newMessage = {
            ...payload.new,
            participant: participantData,
          } as ChatMessage;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedRoom]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !employeeParticipant || !newMessage.trim()) return;

    setIsSending(true);
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: selectedRoom.id,
        participant_id: employeeParticipant.id,
        content: newMessage.trim(),
      });

    setIsSending(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
      });
    } else {
      setNewMessage('');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const clientsInRoom = participants.filter(p => p.role === 'client');
  const employeesInRoom = participants.filter(p => p.role === 'employee');

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Employé';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <span className="text-primary font-bold">K</span>
            </Link>
            <div>
              <h1 className="font-semibold">Tableau de bord</h1>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Chat list */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
                <Badge variant="secondary" className="ml-auto">
                  {rooms.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {rooms.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune conversation</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {rooms.map((room) => {
                      const client = room.participants?.find(p => p.role === 'client');
                      const isSelected = selectedRoom?.id === room.id;
                      
                      return (
                        <button
                          key={room.id}
                          onClick={() => handleSelectRoom(room)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              {client?.is_online && (
                                <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium truncate">
                                  {client?.display_name || room.name || 'Client'}
                                </p>
                                {room.lastMessage && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(room.lastMessage.created_at), {
                                      addSuffix: true,
                                      locale: fr,
                                    })}
                                  </span>
                                )}
                              </div>
                              {room.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {room.lastMessage.participant?.role === 'employee' && (
                                    <span className="text-primary">Vous: </span>
                                  )}
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
            </CardContent>
          </Card>

          {/* Chat view */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedRoom ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {clientsInRoom[0]?.display_name || selectedRoom.name || 'Client'}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {participants.length} participant(s)
                          {clientsInRoom[0]?.is_online ? (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              En ligne
                            </Badge>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {clientsInRoom[0]?.last_seen_at ? (
                                formatDistanceToNow(new Date(clientsInRoom[0].last_seen_at), {
                                  addSuffix: true,
                                  locale: fr,
                                })
                              ) : (
                                'Hors ligne'
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isEmployee = message.participant?.role === 'employee';
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isEmployee ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isEmployee
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium opacity-80">
                                  {message.participant?.display_name}
                                </span>
                                <Badge 
                                  variant={isEmployee ? 'secondary' : 'outline'} 
                                  className="text-[10px] px-1 py-0"
                                >
                                  {isEmployee ? 'Employé' : 'Client'}
                                </Badge>
                              </div>
                              <p className="whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isEmployee ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Message input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Tapez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSending}
                          maxLength={5000}
                          className="pr-16"
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                          newMessage.length > 4500 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {newMessage.length}/5000
                        </span>
                      </div>
                      <Button type="submit" disabled={isSending || !newMessage.trim()}>
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm">Choisissez un chat dans la liste pour commencer</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
