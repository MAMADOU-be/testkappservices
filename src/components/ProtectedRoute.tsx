import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';

type AppRole = 'admin' | 'employee' | 'user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { roles, isLoading: profileLoading } = useProfile();

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="text-center max-w-md p-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Navigate to="/" replace />
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
