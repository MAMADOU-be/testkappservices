import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Clock,
  Loader2,
  Inbox,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      await loadRequests();
      setIsLoading(false);
    };
    load();
  }, [loadRequests]);

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
          Vos demandes de service assignées
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default EmployeeDashboard;
