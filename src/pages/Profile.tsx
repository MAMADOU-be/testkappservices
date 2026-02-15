import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAdminNotifications } from '@/hooks/useNotifications';
import { usePresence } from '@/hooks/usePresence';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ReferralSection from '@/components/profile/ReferralSection';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ServiceRequestsTable } from '@/components/admin/ServiceRequestsTable';
import { JobApplicationsTable } from '@/components/admin/JobApplicationsTable';
import { UserManagement } from '@/components/admin/UserManagement';
import { ClientRequestsView } from '@/components/profile/ClientRequestsView';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { ContactMessagesTable } from '@/components/admin/ContactMessagesTable';
import { StatsDashboard } from '@/components/admin/StatsDashboard';
import { BlogManagement } from '@/components/admin/BlogManagement';
import {
  Loader2,
  ArrowLeft,
  LogOut,
  FileText,
  Gift,
  Settings,
  Users,
  Briefcase,
  Send,
  MessageSquare,
  BarChart3,
  Newspaper,
} from 'lucide-react';

const Profile = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, roles, isLoading: profileLoading, hasAnyRole } = useProfile();
  const { unreadCount, markAllAsRead, loadUnreadCount } = useAdminNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('');

  // Activate presence tracking
  usePresence();

  const isStaff = hasAnyRole(['admin', 'employee']);
  const isAdmin = hasAnyRole(['admin']);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'employee': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'employee': return 'Employé';
      default: return 'Utilisateur';
    }
  };

  // Determine number of tabs
  const gridCols = isAdmin ? 'grid-cols-8' : isStaff ? 'grid-cols-6' : 'grid-cols-3';

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">{displayName}</h1>
                <div className="flex items-center gap-1.5">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-[10px] px-1.5 py-0">
                        {getRoleLabel(role)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Utilisateur</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && (
              <NotificationPanel
                unreadCount={unreadCount}
                markAllAsRead={markAllAsRead}
                loadUnreadCount={loadUnreadCount}
                onNavigateToTab={setActiveTab}
              />
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab || (isStaff ? 'stats' : 'my-requests')} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full max-w-2xl ${gridCols}`}>
            {isStaff && (
              <TabsTrigger value="stats" className="flex items-center gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Statistiques</span>
              </TabsTrigger>
            )}
            {isStaff && (
              <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Demandes</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="jobs" className="flex items-center gap-1.5 text-xs">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Candidatures</span>
              </TabsTrigger>
            )}
            {isStaff && (
              <TabsTrigger value="messages" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Utilisateurs</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="blog" className="flex items-center gap-1.5 text-xs">
                <Newspaper className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
            )}
            {!isStaff && (
              <TabsTrigger value="my-requests" className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mes demandes</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-1.5 text-xs">
              <Gift className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Parrainage</span>
            </TabsTrigger>
          </TabsList>

          {isStaff && (
            <TabsContent value="stats">
              <StatsDashboard />
            </TabsContent>
          )}

          {isStaff && (
            <TabsContent value="requests">
              <ServiceRequestsTable />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="jobs">
              <JobApplicationsTable />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {isStaff && (
            <TabsContent value="messages">
              <ContactMessagesTable />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="blog">
              <BlogManagement />
            </TabsContent>
          )}

          {!isStaff && (
            <TabsContent value="my-requests">
              <div className="max-w-3xl">
                <ClientRequestsView />
              </div>
            </TabsContent>
          )}

          <TabsContent value="profile">
            <div className="max-w-2xl">
              <ProfileForm />
            </div>
          </TabsContent>

          <TabsContent value="referral">
            <div className="max-w-2xl">
              <ReferralSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
