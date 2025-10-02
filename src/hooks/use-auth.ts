import { useAuthStore, LoginCredentials, RegisterData, User } from "@/store/auth-store";
import { useCallback, useEffect } from "react";

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    setUser,
    setToken,
    setLoading,
    clearAuth,
    initAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await storeLogin(credentials);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [storeLogin]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        await storeRegister(data);
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    [storeRegister]
  );

  const logout = useCallback(() => {
    storeLogout();
    // Optionally redirect to login page
    // window.location.href = '/sign-in';
  }, [storeLogout]);

  const updateUser = useCallback(
    (userData: User) => {
      setUser(userData);
    },
    [setUser]
  );

  const updateToken = useCallback(
    (newToken: string) => {
      setToken(newToken);
    },
    [setToken]
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    register,
    logout,
    updateUser,
    updateToken,
    setLoading,
    clearAuth,

    // Utility functions
    isLoggedIn: isAuthenticated,
    hasRole: (role: string) => user?.role === role,
    getUserId: () => user?.id,
    getUserEmail: () => user?.email,
    getUserName: () => user?.name,
  };
}