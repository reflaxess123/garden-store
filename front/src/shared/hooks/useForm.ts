"use client";

import { useCallback, useMemo, useState } from "react";
import { logger } from "../lib/logger";
import { FormField, FormState } from "../types/common";

type ValidationRule<T = any> = {
  validator: (value: T) => boolean;
  message: string;
};

type FieldValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: FieldValidationRules<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  // Инициализация полей формы
  const [fields, setFields] = useState<{ [K in keyof T]: FormField<T[K]> }>(
    () => {
      const initialFields = {} as { [K in keyof T]: FormField<T[K]> };

      for (const key in initialValues) {
        initialFields[key] = {
          value: initialValues[key],
          error: undefined,
          touched: false,
          dirty: false,
        };
      }

      return initialFields;
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валидация отдельного поля
  const validateField = useCallback(
    (fieldName: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules[fieldName];
      if (!rules) return undefined;

      for (const rule of rules) {
        if (!rule.validator(value)) {
          return rule.message;
        }
      }

      return undefined;
    },
    [validationRules]
  );

  // Валидация всей формы
  const validateForm = useCallback(() => {
    const errors: { [K in keyof T]?: string } = {};
    let hasErrors = false;

    for (const fieldName in fields) {
      const error = validateField(fieldName, fields[fieldName].value);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    }

    return { errors, hasErrors };
  }, [fields, validateField]);

  // Обновление значения поля
  const setFieldValue = useCallback(
    (fieldName: keyof T, value: T[keyof T]) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          dirty: true,
          error: validateOnChange
            ? validateField(fieldName, value)
            : prev[fieldName].error,
        },
      }));

      logger.debug("Form field value updated", {
        component: "useForm",
        fieldName: String(fieldName),
        hasError: !!validateField(fieldName, value),
      });
    },
    [validateField, validateOnChange]
  );

  // Обновление ошибки поля
  const setFieldError = useCallback(
    (fieldName: keyof T, error: string | undefined) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error,
        },
      }));
    },
    []
  );

  // Установка touched состояния
  const setFieldTouched = useCallback(
    (fieldName: keyof T, touched: boolean = true) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched,
          error:
            validateOnBlur && touched
              ? validateField(fieldName, prev[fieldName].value)
              : prev[fieldName].error,
        },
      }));
    },
    [validateField, validateOnBlur]
  );

  // Обработчики событий для input полей
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      value: fields[fieldName].value,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        setFieldValue(fieldName, e.target.value as T[keyof T]);
      },
      onBlur: () => setFieldTouched(fieldName, true),
      error: fields[fieldName].error,
      touched: fields[fieldName].touched,
    }),
    [fields, setFieldValue, setFieldTouched]
  );

  // Сброс формы
  const resetForm = useCallback(() => {
    setFields(() => {
      const resetFields = {} as { [K in keyof T]: FormField<T[K]> };

      for (const key in initialValues) {
        resetFields[key] = {
          value: initialValues[key],
          error: undefined,
          touched: false,
          dirty: false,
        };
      }

      return resetFields;
    });

    setIsSubmitting(false);

    logger.debug("Form reset", {
      component: "useForm",
    });
  }, [initialValues]);

  // Сброс ошибок
  const clearErrors = useCallback(() => {
    setFields((prev) => {
      const clearedFields = { ...prev };
      for (const key in clearedFields) {
        clearedFields[key] = {
          ...clearedFields[key],
          error: undefined,
        };
      }
      return clearedFields;
    });
  }, []);

  // Установка значений полей (для обновления формы извне)
  const setValues = useCallback((values: Partial<T>) => {
    setFields((prev) => {
      const updatedFields = { ...prev };
      for (const key in values) {
        if (key in updatedFields) {
          updatedFields[key] = {
            ...updatedFields[key],
            value: values[key]!,
            dirty: true,
          };
        }
      }
      return updatedFields;
    });
  }, []);

  // Обработка отправки формы
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const { errors, hasErrors } = validateForm();

      if (hasErrors) {
        // Обновляем ошибки в полях
        setFields((prev) => {
          const updatedFields = { ...prev };
          for (const key in errors) {
            updatedFields[key] = {
              ...updatedFields[key],
              error: errors[key],
              touched: true,
            };
          }
          return updatedFields;
        });

        logger.warn("Form submission failed due to validation errors", {
          component: "useForm",
          errors: Object.keys(errors),
        });

        return;
      }

      if (!onSubmit) return;

      setIsSubmitting(true);

      try {
        const values = {} as T;
        for (const key in fields) {
          values[key] = fields[key].value;
        }

        await onSubmit(values);

        logger.info("Form submitted successfully", {
          component: "useForm",
        });
      } catch (error) {
        logger.error("Form submission failed", error, {
          component: "useForm",
        });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, fields]
  );

  // Вычисляемые значения
  const values = useMemo(() => {
    const result = {} as T;
    for (const key in fields) {
      result[key] = fields[key].value;
    }
    return result;
  }, [fields]);

  const errors = useMemo(() => {
    const result = {} as { [K in keyof T]?: string };
    for (const key in fields) {
      if (fields[key].error) {
        result[key] = fields[key].error;
      }
    }
    return result;
  }, [fields]);

  const touched = useMemo(() => {
    const result = {} as { [K in keyof T]: boolean };
    for (const key in fields) {
      result[key] = fields[key].touched;
    }
    return result;
  }, [fields]);

  const dirty = useMemo(() => {
    const result = {} as { [K in keyof T]: boolean };
    for (const key in fields) {
      result[key] = fields[key].dirty;
    }
    return result;
  }, [fields]);

  const isValid = useMemo(() => {
    return Object.values(fields).every((field) => !field.error);
  }, [fields]);

  const isDirty = useMemo(() => {
    return Object.values(fields).some((field) => field.dirty);
  }, [fields]);

  const formState: FormState<T> = {
    fields,
    isValid,
    isSubmitting,
    isDirty,
  };

  return {
    // Состояние формы
    formState,
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    isSubmitting,

    // Методы управления полями
    setFieldValue,
    setFieldError,
    setFieldTouched,
    getFieldProps,

    // Методы управления формой
    handleSubmit,
    resetForm,
    clearErrors,
    setValues,
    validateForm,
    validateField,
  };
}

// Вспомогательные функции для валидации
export const validators = {
  required: <T>(value: T): boolean => {
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !isNaN(value);
    if (Array.isArray(value)) return value.length > 0;
    return value != null;
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength:
    (min: number) =>
    (value: string): boolean => {
      return value.length >= min;
    },

  maxLength:
    (max: number) =>
    (value: string): boolean => {
      return value.length <= max;
    },

  min:
    (min: number) =>
    (value: number): boolean => {
      return value >= min;
    },

  max:
    (max: number) =>
    (value: number): boolean => {
      return value <= max;
    },

  pattern:
    (regex: RegExp) =>
    (value: string): boolean => {
      return regex.test(value);
    },

  phone: (value: string): boolean => {
    const phoneRegex =
      /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(value);
  },
};
