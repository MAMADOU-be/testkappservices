import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  FileText,
  Clock,
  Circle,
  User as UserIcon,
  Loader2,
  Inbox,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatRoomSummary {
  id: string;
  name: string | null;
  created_at: string;
  clientName: string;
  clientOnline: boolean;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  participantCount: number;
}

interface ServiceRequestSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service_type: string;
  status: string;
  city: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  contacted: 'secondary',
  confirmed: 'default',
  in_progress: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatRoomSummary[]>([]);
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    // Get rooms where user is a participant
    const { data: participantData } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', user.id);

    if (!participantData || participantData.length === 0) {
      setConversations([]);
      return;
    }

    const roomIds = participantData.map(p => p.room_id);

    const roomSummaries: ChatRoomSummary[] = await Promise.all(
      roomIds.map(async (roomId) => {
        const { data: room } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        const { data: participants } = await supabase
          .from('chat_participants')
          .select('*')
          .eq('room_id', roomId);

        const client = (participants || []).find(p => p.role === 'client');

        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content, created_at')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          id: roomId,
          name: room?.name || null,
          created_at: room?.created_at || '',
          clientName: client?.display_name || 'Client',
          clientOnline: client?.is_online || false,
          lastMessageContent: lastMsg?.[0]?.content || null,
          lastMessageAt: lastMsg?.[0]?.created_at || null,
          participantCount: (participants || []).length,
        };
      })
    );

    // Sort by last message date
    roomSummaries.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    });

    setConversations(roomSummaries);
  }, [user]);

  const loadRequests = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false });

    setRequests((data || []) as ServiceRequestSummary[]);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([loadConversations(), loadRequests()]);
      setIsLoading(false);
    };
    load();
  }, [loadConversations, loadRequests]);

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Espace employé
        </CardTitle>
        <CardDescription>
          Vos conversations et demandes de service assignées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversations ({conversations.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Demandes ({requests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Aucune conversation</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {conv.clientOnline && (
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{conv.clientName}</p>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(conv.lastMessageAt), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          )}
                        </div>
                        {conv.lastMessageContent && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessageContent}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground text-center">
              Accédez au <a href="/admin" className="text-primary hover:underline">tableau de bord</a> pour répondre aux conversations.
            </p>
          </TabsContent>

          <TabsContent value="requests">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Aucune demande assignée</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">
                          {req.first_name} {req.last_name}
                        </p>
                        <Badge variant={statusColors[req.status] || 'outline'}>
                          {statusLabels[req.status] || req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.service_type} — {req.city}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(req.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmployeeDashboard;
