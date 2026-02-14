import { useEffect, useState } from 'react';
import { ContractsSkeleton, RequestCardSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Loader2, FileText, Clock, CheckCircle, XCircle, Phone as PhoneIcon,
  MapPin, Calendar, Send, Download, Shirt, Home
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postal_code: string;
  service_type: string;
  frequency: string;
  preferred_day: string | null;
  status: string;
  comments: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  contacted: { label: 'Contacté', color: 'bg-blue-100 text-blue-800', icon: PhoneIcon },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

export function ClientRequestsView() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    
    const loadMyRequests = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('email', user.email!)
        .order('created_at', { ascending: false });

      if (!error) {
        setRequests(data || []);
      }
      setIsLoading(false);
    };

    loadMyRequests();

    // Realtime updates
    const channel = supabase
      .channel('my-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => loadMyRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.email]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ContractsSkeleton />
        <RequestCardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Besoin d'une aide-ménagère ?</h3>
            <p className="text-sm text-muted-foreground">Faites une nouvelle demande en quelques clics</p>
          </div>
          <Button asChild className="btn-accent border-0 whitespace-nowrap">
            <a href="/#demande">
              <Send className="w-4 h-4 mr-2" />
              Demander une aide-ménagère
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Contrats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5" />
            Mes contrats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Téléchargez, lisez et remplissez le contrat correspondant à votre service, puis renvoyez-le signé à votre agence.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="/contrats/convention-titres-services-2025.docx"
              download
              className="flex items-center gap-3 border rounded-xl p-4 hover:bg-secondary/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Convention Aide-Ménagère</p>
                <p className="text-xs text-muted-foreground">Titres-Services 2025 • DOCX</p>
              </div>
            </a>
            <a
              href="/contrats/convention-repassage-2025.docx"
              download
              className="flex items-center gap-3 border rounded-xl p-4 hover:bg-secondary/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Shirt className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Convention Repassage en Atelier</p>
                <p className="text-xs text-muted-foreground">Prestations 2025 • DOCX</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Requests list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Mes demandes ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Vous n'avez pas encore de demande de service</p>
              <p className="text-sm mt-1">Faites votre première demande ci-dessus !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const config = statusConfig[req.status] || statusConfig.pending;
                const Icon = config.icon;
                return (
                  <div key={req.id} className="border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {format(new Date(req.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </span>
                      </div>
                      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{req.street}, {req.postal_code} {req.city}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fréquence :</span> {req.frequency}
                      </div>
                      {req.preferred_day && (
                        <div>
                          <span className="font-medium text-foreground">Jours :</span> {req.preferred_day}
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-foreground">Service :</span> {req.service_type}
                      </div>
                    </div>
                    {req.status !== req.status && (
                      <p className="text-xs text-muted-foreground">
                        Dernière mise à jour : {format(new Date(req.updated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
