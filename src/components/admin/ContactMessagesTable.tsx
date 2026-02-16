import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Eye, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  notes: string | null;
  created_at: string;
}

interface ContactMessagesTableProps {
  highlightId?: string | null;
  onHighlightConsumed?: () => void;
}

export function ContactMessagesTable({ highlightId, onHighlightConsumed }: ContactMessagesTableProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('contact-messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-open detail when navigating from notification
  useEffect(() => {
    if (highlightId && messages.length > 0) {
      const target = messages.find(m => m.id === highlightId);
      if (target) {
        openDetail(target);
        onHighlightConsumed?.();
      }
    }
  }, [highlightId, messages]);

  const openDetail = async (msg: ContactMessage) => {
    setSelected(msg);
    setNotes(msg.notes || '');
    if (!msg.is_read) {
      await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from('contact_messages')
      .update({ notes })
      .eq('id', selected.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Notes sauvegardées' });
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, notes } : m));
      setSelected(prev => prev ? { ...prev, notes } : null);
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      toast({ title: 'Message supprimé' });
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  if (loading) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages de contact ({messages.length})
          </h3>
        </div>

        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Aucun message de contact reçu
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map(msg => (
                <TableRow
                  key={msg.id}
                  className={`cursor-pointer ${!msg.is_read ? 'bg-primary/5 font-medium' : ''}`}
                  onClick={() => openDetail(msg)}
                >
                  <TableCell className="text-sm">
                    {msg.first_name} {msg.last_name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {msg.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={msg.is_read ? 'secondary' : 'default'} className="text-[10px]">
                      {msg.is_read ? 'Lu' : 'Non lu'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDetail(msg)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message de {selected?.first_name} {selected?.last_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${selected.phone}`} className="text-primary hover:underline">
                    {selected.phone}
                  </a>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes internes</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ajouter des notes..."
                  className="min-h-[80px]"
                />
                <Button size="sm" className="mt-2" onClick={saveNotes}>
                  Sauvegarder les notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
