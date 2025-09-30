import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const GlobalErrorHandler = () => {
  const { authError, refreshSession, signOut } = useAuth();

  if (!authError) return null;

  const handleRefresh = () => {
    refreshSession();
  };
  
  const handleReLogin = async () => {
    await signOut();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-destructive text-destructive-foreground p-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            <strong>Error:</strong> {authError.message}
          </p>
        </div>
        <div className="flex items-center gap-2">
            {authError.type === 're-login' ? (
                <Button variant="outline" size="sm" onClick={handleReLogin} className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90">
                    Login Again
                </Button>
            ) : (
                <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Session
                </Button>
            )}
            <Button variant="link" size="sm" asChild className="text-destructive-foreground hover:text-destructive-foreground/80">
                <Link to="/contact">Get Help</Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorHandler;