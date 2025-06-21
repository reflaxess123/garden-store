"use client";

import {
  CustomUser,
  getCurrentUserInfoApiAuthMeGet,
  logoutApiAuthLogoutPost,
  signinApiAuthSigninPost,
  signupApiAuthSignupPost,
} from "@/shared/api/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
  user: CustomUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Используем TanStack Query для получения данных пользователя
  const {
    data: user,
    isLoading,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserInfoApiAuthMeGet,
    retry: false, // Не повторяем запрос при ошибке авторизации
    staleTime: 10 * 60 * 1000, // 10 минут - увеличиваем время актуальности
    gcTime: 30 * 60 * 1000, // 30 минут - увеличиваем время жизни кэша
    refetchOnWindowFocus: false, // Отключаем рефетч при фокусе
    refetchOnMount: "always", // Всегда рефетчим при маунте для диагностики
    refetchOnReconnect: false, // Отключаем рефетч при переподключении
  });

  // Мутация для входа
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return await signinApiAuthSigninPost({ email, password });
    },
    onSuccess: () => {
      // После успешного входа обновляем данные пользователя
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Мутация для регистрации
  const signupMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      confirmPassword,
    }: {
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      return await signupApiAuthSignupPost({
        email,
        password,
        confirmPassword,
      });
    },
    onSuccess: (userData) => {
      // Сразу сохраняем данные пользователя в кэш
      queryClient.setQueryData(["currentUser"], userData);
    },
  });

  // Мутация для выхода
  const logoutMutation = useMutation({
    mutationFn: logoutApiAuthLogoutPost,
    onSettled: () => {
      // Очищаем кэш пользователя независимо от результата
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear(); // Очищаем весь кэш при выходе
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    await signupMutation.mutateAsync({ email, password, confirmPassword });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync(undefined);
  };

  const isAuthenticated = !!user && !isError;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isError,
        isAuthenticated,
        login,
        logout,
        signup,
        refetchUser: () => refetchUser(),
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

// Дополнительные хуки для удобства
export function useUser() {
  const { user, isLoading, isError } = useAuth();
  return { user, isLoading, isError };
}

export function useIsAdmin() {
  const { user, isLoading } = useAuth();
  return { isAdmin: user?.isAdmin || false, isLoading };
}

export function useAuthActions() {
  const { login, logout, signup, refetchUser } = useAuth();
  return { login, logout, signup, refetchUser };
}
