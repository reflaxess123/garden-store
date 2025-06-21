"use client";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

export interface CrudFormModalProps<T = any> {
  item?: T | null; // Элемент для редактирования (null для создания)
  trigger: ReactNode; // Кнопка-триггер
  title: string;
  description?: string;
  children: ReactNode; // Форма внутри модала
  onSubmit?: () => void;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  open?: boolean; // Контролируемое состояние
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-[425px]",
  md: "sm:max-w-[600px]",
  lg: "sm:max-w-[800px]",
  xl: "sm:max-w-[1200px]",
};

export default function CrudFormModal<T = any>({
  item,
  trigger,
  title,
  description,
  children,
  onSubmit,
  onOpenChange,
  loading = false,
  submitText,
  cancelText = "Отмена",
  open: controlledOpen,
  size = "md",
}: CrudFormModalProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const isEdit = !!item;
  const defaultSubmitText = isEdit ? "Сохранить изменения" : "Создать";
  const defaultDescription = isEdit
    ? description || "Внесите изменения в запись"
    : description || "Заполните форму для создания новой записи";

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{defaultDescription}</DialogDescription>
        </DialogHeader>

        <div className="py-4">{children}</div>

        {onSubmit && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText || defaultSubmitText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
