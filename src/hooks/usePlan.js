import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

export const usePlan = () => {
  const { plan, features, limits, isLoading } = useAuth();

  const hasFeature = (featureKey) => {
    if (!features) {
      return false;
    }
    return features[featureKey] === true;
  };
  
  return {
    planName: plan || 'freemium',
    features: features || {},
    limits: limits || {},
    isLoading,
    hasFeature,
  };
};