import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Admin() {
  const { appUser, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!appUser) {
        setLocation('/');
      } else if (!appUser.isAdmin) {
        setLocation('/');
      } else {
        setShowDashboard(true);
      }
    }
  }, [appUser, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showDashboard) {
    return <AdminDashboard onClose={() => setLocation('/')} />;
  }

  return null;
}
