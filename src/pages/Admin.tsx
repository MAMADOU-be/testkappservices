import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ServiceRequestsTable } from '@/components/admin/ServiceRequestsTable';
import { AdminChatView } from '@/components/admin/AdminChatView';
import { Loader2, LogOut, FileText, MessageCircle } from 'lucide-react';

const Admin = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, hasAnyRole, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasAnyRole(['admin', 'employee'])) {
        navigate('/');
        toast({
          variant: 'destructive',
          title: 'Accès refusé',
          description: "Vous n'avez pas les permissions nécessaires",
        });
      }
    }
  }, [user, authLoading, profileLoading, hasAnyRole, navigate, toast]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Employé';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <span className="text-primary font-bold text-sm">K</span>
            </Link>
            <div>
              <h1 className="font-semibold text-sm">Tableau de bord</h1>
              <p className="text-[11px] text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center gap-2 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs">
              <MessageCircle className="h-3.5 w-3.5" />
              Conversations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <ServiceRequestsTable />
          </TabsContent>

          <TabsContent value="chat">
            <AdminChatView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
