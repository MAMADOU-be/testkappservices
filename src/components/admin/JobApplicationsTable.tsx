import { useEffect, useState } from 'react';
import { StatsSkeleton, TableSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Loader2, Briefcase, Eye, RefreshCw, Clock, CheckCircle, XCircle,
  Phone, Mail, MapPin, Download, User, Car,
} from 'lucide-react';

interface JobApplication {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  employment_type: string;
  has_clientele: string;
  transport: string;
  plan_impulsion: string;
  message: string | null;
  status: string;
  notes: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Nouvelle', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  reviewed: { label: 'Examinée', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye },
  interview: { label: 'Entretien', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: User },
  accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

interface JobApplicationsTableProps {
  highlightId?: string | null;
  onHighlightConsumed?: () => void;
}

export function JobApplicationsTable({ highlightId, onHighlightConsumed }: JobApplicationsTableProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const { toast } = useToast();

  const loadApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les candidatures' });
    } else {
      setApplications((data as JobApplication[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadApplications();
    const channel = supabase
      .channel('job-applications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => loadApplications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-open detail when navigating from notification
  useEffect(() => {
    if (highlightId && applications.length > 0) {
      const target = applications.find(a => a.id === highlightId);
      if (target) {
        setSelectedApp(target);
        setNotes(target.notes || '');
        onHighlightConsumed?.();
      }
    }
  }, [highlightId, applications]);

  const updateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase.from('job_applications').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut' });
    } else {
      toast({ title: 'Statut mis à jour' });
      loadApplications();
    }
    setIsUpdating(false);
  };

  const updateNotes = async (id: string) => {
    setIsUpdating(true);
    const { error } = await supabase.from('job_applications').update({ notes }).eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur' });
    } else {
      toast({ title: 'Notes sauvegardées' });
      setSelectedApp(null);
      loadApplications();
    }
    setIsUpdating(false);
  };

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter);

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

  const exportCSV = () => {
    const headers = ['Date', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Emploi', 'Transport', 'Clientèle', 'Plan Impulsion', 'Statut', 'Notes'];
    const rows = filteredApplications.map(a => [
      format(new Date(a.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      a.first_name, a.last_name, a.email, a.phone,
      `${a.street} ${a.house_number}, ${a.postal_code} ${a.city}`,
      a.employment_type, a.transport, a.has_clientele, a.plan_impulsion,
      statusConfig[a.status]?.label || a.status, a.notes || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatures-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton count={3} />
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Total candidatures</p>
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
              <p className="text-sm text-muted-foreground">Nouvelles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{applications.filter(a => a.status === 'accepted').length}</p>
              <p className="text-sm text-muted-foreground">Acceptées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Candidatures reçues
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-8 bg-background">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredApplications.length === 0}>
              <Download className="h-4 w-4 mr-2" />CSV
            </Button>
            <Button variant="outline" size="sm" onClick={loadApplications}>
              <RefreshCw className="h-4 w-4 mr-2" />Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune candidature</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Emploi</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(app.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">{app.first_name} {app.last_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{app.phone}</div>
                          <div className="text-muted-foreground">{app.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{app.employment_type}</TableCell>
                      <TableCell>
                        <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)} disabled={isUpdating}>
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>{getStatusBadge(app.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedApp(app); setNotes(app.notes || ''); }}>
                          <Eye className="h-4 w-4 mr-1" />Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={(open) => { if (!open) setSelectedApp(null); }}>
        <DialogContent className="max-w-2xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Candidature de {selectedApp.first_name} {selectedApp.last_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2"><User className="h-4 w-4" />Coordonnées</h4>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>{selectedApp.first_name} {selectedApp.last_name}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedApp.phone}</p>
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedApp.email}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2"><MapPin className="h-4 w-4" />Adresse</h4>
                      <div className="text-sm text-muted-foreground">
                        <p>{selectedApp.street} {selectedApp.house_number}</p>
                        <p>{selectedApp.postal_code} {selectedApp.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4" />Candidature</h4>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p><strong>Emploi :</strong> {selectedApp.employment_type}</p>
                        <p><strong>Clientèle :</strong> {selectedApp.has_clientele}</p>
                        <p className="flex items-center gap-1"><Car className="h-3 w-3" /><strong>Transport :</strong> {selectedApp.transport}</p>
                        <p><strong>Plan Impulsion :</strong> {selectedApp.plan_impulsion}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Statut</h4>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                  </div>
                </div>
                {selectedApp.message && (
                  <div>
                    <h4 className="font-medium mb-2">Message</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedApp.message}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">Notes internes</h4>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajouter des notes..." className="min-h-[100px]" />
                  <Button className="mt-2" size="sm" onClick={() => updateNotes(selectedApp.id)} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
