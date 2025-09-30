import React, { useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState = () => (
    <div className="p-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    </div>
);

const ErrorState = ({ title, message, onRetry, onReauthenticate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-screen p-8 bg-gray-50"
    >
        <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-4 justify-center">
                    {onRetry && (
                        <Button onClick={onRetry}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    )}
                    {onReauthenticate && (
                         <Button variant="destructive" onClick={onReauthenticate}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Re-authenticate
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

const AuthBootstrap = ({ children, roles }) => {
    const { loading: authLoading, initializationError, signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleReauthenticate = useCallback(async () => {
        await signOut();
        navigate('/login');
    }, [signOut, navigate]);

    if (authLoading) {
        return <LoadingState />;
    }
    
    if (initializationError) {
        return <ErrorState 
            title="Initialization Failed" 
            message={initializationError}
            onRetry={() => window.location.reload()}
            onReauthenticate={handleReauthenticate}
        />;
    }

    if (roles && profile && !roles.includes(profile.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default AuthBootstrap;