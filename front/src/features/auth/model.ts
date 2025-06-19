import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { z } from "zod";

// Zod схемы для валидации форм
export const signInSchema = z.object({
  email: z.string().email({
    message: "Пожалуйста, введите действительный адрес электронной почты.",
  }),
  password: z.string().min(1, {
    message: "Пароль не может быть пустым.",
  }),
});

export const signUpSchema = z
  .object({
    email: z.string().email({
      message: "Пожалуйста, введите действительный адрес электронной почты.",
    }),
    password: z
      .string()
      .min(6, {
        message: "Пароль должен содержать не менее 6 символов.",
      })
      .max(100, {
        message: "Пароль не должен превышать 100 символов.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "Введите корректный адрес электронной почты.",
  }),
});

// Функции аутентификации

export async function signInWithPassword(data: z.infer<typeof signInSchema>) {
  const { email, password } = data;
  const { data: userData, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, user: userData.user };
}

export async function signUp(data: z.infer<typeof signUpSchema>) {
  const { email, password } = data;
  const { data: userData, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Добавляем isAdmin по умолчанию false при регистрации
        isAdmin: false,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Если пользователь успешно зарегистрирован, но требует подтверждения email
  if (userData.user && !userData.user.identities?.length) {
    return {
      success: true,
      user: userData.user,
      message: "Пожалуйста, подтвердите вашу электронную почту.",
    };
  }

  return { success: true, user: userData.user };
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return {
    success: true,
    message: "Инструкции по сбросу пароля отправлены на ваш email.",
  };
}

export async function updatePassword(password: string) {
  const { error } = await supabaseClient.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, message: "Ваш пароль успешно обновлен." };
}
