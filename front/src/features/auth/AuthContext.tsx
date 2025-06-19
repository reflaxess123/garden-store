"use client";

import {
  CustomUser,
  getCurrentUserInfoApiAuthMeGet,
  logoutApiAuthLogoutPost,
  signinApiAuthSigninPost,
  signupApiAuthSignupPost,
} from "@/shared/api/generated";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: CustomUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем текущую сессию при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUserInfoApiAuthMeGet();
      setUser(userData);
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await signinApiAuthSigninPost({ email, password });
    // После успешного входа обновляем пользователя
    await checkAuth();
  };

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const userData = await signupApiAuthSignupPost({
      email,
      password,
      confirmPassword,
    });
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApiAuthLogoutPost();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
