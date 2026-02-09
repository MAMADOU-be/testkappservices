import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Loader2,
  Users,
  Shield,
  ShieldCheck,
  ShieldPlus,
  ShieldMinus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  User,
  Crown,
  Briefcase,
  Filter,
  Download,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  phone: string | null;
  roles: string[];
}

const roleConfig: Record<string, { label: string; icon: typeof Shield; variant: 'default' | 'secondary' | 'destructive' }> = {
  admin: { label: 'Admin', icon: Crown, variant: 'destructive' },
  employee: { label: 'Employé', icon: Briefcase, variant: 'default' },
  user: { label: 'Utilisateur', icon: User, variant: 'secondary' },
};

export function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-users');
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addRole = async (userId: string, role: string) => {
    setUpdatingRole(`${userId}-add-${role}`);
    try {
      const { error } = await supabase.rpc('admin_add_role', {
        _target_user_id: userId,
        _role: role as any,
      });
      if (error) throw error;
      toast({ title: 'Rôle ajouté', description: `Le rôle "${roleConfig[role]?.label}" a été ajouté.` });
      await loadUsers();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Impossible d\'ajouter le rôle' });
    } finally {
      setUpdatingRole(null);
    }
  };

  const removeRole = async (userId: string, role: string) => {
    setUpdatingRole(`${userId}-remove-${role}`);
    try {
      const { error } = await supabase.rpc('admin_remove_role', {
        _target_user_id: userId,
        _role: role as any,
      });
      if (error) throw error;
      toast({ title: 'Rôle retiré', description: `Le rôle "${roleConfig[role]?.label}" a été retiré.` });
      await loadUsers();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Impossible de retirer le rôle' });
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.email?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.roles.some((r) => roleConfig[r]?.label.toLowerCase().includes(q));
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'none' ? u.roles.length === 0 : u.roles.includes(roleFilter));
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.roles.includes('admin')).length;
  const employeeCount = users.filter((u) => u.roles.includes('employee')).length;

  const exportCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Rôles', 'Inscription', 'Dernière connexion'];
    const rows = filteredUsers.map(u => [
      u.display_name || u.email?.split('@')[0] || '',
      u.email,
      u.phone || '',
      u.roles.map(r => roleConfig[r]?.label || r).join(', ') || 'Aucun',
      format(new Date(u.created_at), 'dd/MM/yyyy', { locale: fr }),
      u.last_sign_in_at ? format(new Date(u.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Jamais',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Administrateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employeeCount}</p>
              <p className="text-sm text-muted-foreground">Employés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Gestion des utilisateurs
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredUsers.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employé</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="none">Aucun rôle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? 'Aucun résultat' : 'Aucun utilisateur'}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôles</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.display_name || user.email?.split('@')[0]}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => {
                              const config = roleConfig[role];
                              if (!config) return null;
                              const Icon = config.icon;
                              return (
                                <Badge key={role} variant={config.variant} className="flex items-center gap-1 text-xs">
                                  <Icon className="h-3 w-3" />
                                  {config.label}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline" className="text-xs">Aucun rôle</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {user.last_sign_in_at
                          ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: fr })
                          : 'Jamais'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Shield className="h-4 w-4 mr-1" />
                              Gérer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Gérer les rôles de {user.display_name || user.email}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {user.email}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Inscrit le {format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })}
                                </p>
                              </div>

                              <div className="border rounded-lg divide-y">
                                {(['admin', 'employee', 'user'] as const).map((role) => {
                                  const config = roleConfig[role];
                                  const Icon = config.icon;
                                  const hasRole = user.roles.includes(role);
                                  const isUpdating = updatingRole === `${user.id}-add-${role}` || updatingRole === `${user.id}-remove-${role}`;

                                  return (
                                    <div key={role} className="flex items-center justify-between p-3">
                                      <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                          <p className="font-medium text-sm">{config.label}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {role === 'admin' && 'Accès total à toutes les fonctionnalités'}
                                            {role === 'employee' && 'Accès aux demandes et au chat'}
                                            {role === 'user' && 'Accès standard au profil'}
                                          </p>
                                        </div>
                                      </div>
                                      {hasRole ? (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                              disabled={isUpdating}
                                            >
                                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldMinus className="h-4 w-4 mr-1" />}
                                              Retirer
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirmer le retrait</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Voulez-vous retirer le rôle "{config.label}" de {user.display_name || user.email} ?
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => removeRole(user.id, role)}>
                                                Confirmer
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addRole(user.id, role)}
                                          disabled={isUpdating}
                                        >
                                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4 mr-1" />}
                                          Ajouter
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
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
