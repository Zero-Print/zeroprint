import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { UserRole } from '@/types';

interface UseAuthGuardOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { allowedRoles, redirectTo = '/auth/login', requireAuth = true } = options;

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, allowedRoles, redirectTo, requireAuth, router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    // Enhanced granular access controls
    hasWardAccess: (wardId: string) => user?.assignedWards?.includes(wardId) || user?.role === 'admin' || user?.role === 'government',
    hasEntityAccess: (entityId: string) => user?.entityId === entityId || user?.role === 'admin',
    hasExportPermission: (resourceType: string) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'government' && ['ward_data', 'city_data', 'reports'].includes(resourceType)) return true;
      if (user.role === 'entity' && ['entity_data', 'reports'].includes(resourceType)) return true;
      return user.role === 'citizen' && resourceType === 'personal_data';
    },
    hasBulkActionPermission: () => ['admin', 'government'].includes(user?.role || ''),
  };
}
