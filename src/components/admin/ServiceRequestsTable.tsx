import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Loader2, 
  FileText, 
  Eye, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar
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
  preferred_time: string | null;
  comments: string | null;
  status: string;
  notes: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  contacted: { label: 'Contacté', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Phone },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },
};

export function ServiceRequestsTable() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
      });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('service-requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
      });
    } else {
      toast({
        title: 'Statut mis à jour',
        description: `La demande a été marquée comme "${statusConfig[newStatus]?.label || newStatus}"`,
      });
      loadRequests();
    }
    setIsUpdating(false);
  };

  const updateNotes = async (id: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('service_requests')
      .update({ notes })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder les notes',
      });
    } else {
      toast({
        title: 'Notes sauvegardées',
      });
      loadRequests();
    }
    setIsUpdating(false);
  };

  const openDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const contactedCount = requests.filter(r => r.status === 'contacted').length;
  const confirmedCount = requests.filter(r => r.status === 'confirmed').length;

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Total demandes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contactedCount}</p>
              <p className="text-sm text-muted-foreground">Contactés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demandes de service
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-8 bg-background">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{statusFilter === 'all' ? 'Aucune demande de service' : `Aucune demande avec le statut "${statusConfig[statusFilter]?.label}"`}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.first_name} {request.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.phone}</div>
                          <div className="text-muted-foreground">{request.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.postal_code} {request.city}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.frequency}</div>
                          {request.preferred_day && (
                            <div className="text-muted-foreground text-xs">{request.preferred_day}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) => updateStatus(request.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue>{getStatusBadge(request.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="h-3 w-3" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => openDetails(request)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Demande de {request.first_name} {request.last_name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium flex items-center gap-2 mb-2">
                                      <User className="h-4 w-4" />
                                      Coordonnées
                                    </h4>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                      <p>{request.first_name} {request.last_name}</p>
                                      <p className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {request.phone}
                                      </p>
                                      <p className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {request.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium flex items-center gap-2 mb-2">
                                      <MapPin className="h-4 w-4" />
                                      Adresse
                                    </h4>
                                    <div className="text-sm text-muted-foreground">
                                      <p>{request.street}</p>
                                      <p>{request.postal_code} {request.city}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium flex items-center gap-2 mb-2">
                                      <Calendar className="h-4 w-4" />
                                      Service demandé
                                    </h4>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                      <p><strong>Type:</strong> {request.service_type}</p>
                                      <p><strong>Fréquence:</strong> {request.frequency}</p>
                                      {request.preferred_day && (
                                        <p><strong>Jours:</strong> {request.preferred_day}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Statut</h4>
                                    {getStatusBadge(request.status)}
                                  </div>
                                </div>
                              </div>
                              
                              {request.comments && (
                                <div>
                                  <h4 className="font-medium mb-2">Message du client</h4>
                                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                    {request.comments}
                                  </p>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium mb-2">Notes internes</h4>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Ajouter des notes..."
                                  className="min-h-[100px]"
                                />
                                <Button
                                  className="mt-2"
                                  size="sm"
                                  onClick={() => updateNotes(request.id)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : null}
                                  Sauvegarder les notes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}