import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { User, login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, LoginData, RegisterData } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      try {
        const data = await getCurrentUser();
        return data.user;
      } catch (error) {
        return null;
      }
    }
  });

  const user = data || null;
  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data.user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error?.message || 'Invalid email or password',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: apiRegister,
    onSuccess: () => {
      toast({
        title: 'Registration successful',
        description: 'Please login with your new account',
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      navigate('/');
    },
    onError: () => {
      toast({
        title: 'Logout failed',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Check if user is on a protected route without authentication
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/create-test', '/test-library', '/students', '/settings'];
    const currentPath = window.location.pathname;
    
    if (!isLoading && !isAuthenticated && protectedRoutes.some(route => currentPath.startsWith(route))) {
      navigate('/');
      toast({
        title: 'Authentication required',
        description: 'Please login to access this page',
        variant: 'destructive',
      });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
  
  // Using createElement directly without JSX
  return (
    AuthContext.Provider({
      value: contextValue,
      children
    })
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}