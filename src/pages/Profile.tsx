import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ReferralSection from '@/components/profile/ReferralSection';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ServiceRequestsTable } from '@/components/admin/ServiceRequestsTable';
import { AdminChatView } from '@/components/admin/AdminChatView';
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Shield,
  LogOut,
  FileText,
  MessageCircle,
  Gift,
  Settings,
} from 'lucide-react';

const Profile = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, roles, isLoading: profileLoading, hasAnyRole } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isStaff = hasAnyRole(['admin', 'employee']);

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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
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
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <Tabs defaultValue={isStaff ? 'requests' : 'profile'} className="space-y-4">
          <TabsList className={`grid w-full max-w-lg ${isStaff ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {isStaff && (
              <>
                <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Demandes</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
              </>
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
            <>
              <TabsContent value="requests">
                <ServiceRequestsTable />
              </TabsContent>
              <TabsContent value="chat" className="h-[calc(100vh-10rem)]">
                <AdminChatView />
              </TabsContent>
            </>
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
