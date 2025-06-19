import {
  resetPasswordApiAuthResetPasswordPost,
  signinApiAuthSigninPost,
  signupApiAuthSignupPost,
  updatePasswordApiAuthUpdatePasswordPost,
} from "@/shared/api/generated";
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
  try {
    const result = await signinApiAuthSigninPost(data);
    return { success: true, token: result.access_token };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка входа",
    };
  }
}

export async function signUp(data: z.infer<typeof signUpSchema>) {
  try {
    const result = await signupApiAuthSignupPost(data);
    return { success: true, user: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка регистрации",
    };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    await resetPasswordApiAuthResetPasswordPost({ email });
    return {
      success: true,
      message: "Инструкции по сбросу пароля отправлены на ваш email.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка сброса пароля",
    };
  }
}

export async function updatePassword(password: string) {
  try {
    await updatePasswordApiAuthUpdatePasswordPost({ password });
    return { success: true, message: "Ваш пароль успешно обновлен." };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка обновления пароля",
    };
  }
}
