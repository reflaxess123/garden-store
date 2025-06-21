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

interface CrudFormModalProps<T = Record<string, unknown>> {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (data: T) => void;
  initialData?: T | null;
  item?: T | null; // Алиас для initialData для обратной совместимости
  title: string;
  children: React.ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
  loading?: boolean; // Алиас для isLoading
  trigger?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-[425px]",
  md: "sm:max-w-[600px]",
  lg: "sm:max-w-[800px]",
  xl: "sm:max-w-[1200px]",
};

export function CrudFormModal<T = Record<string, unknown>>({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  item,
  title,
  children,
  submitLabel = "Сохранить",
  isLoading = false,
  loading = false,
  trigger,
  size = "md",
}: CrudFormModalProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = isControlled ? onClose : setInternalOpen;

  // Используем item как алиас для initialData если он передан
  const data = item ?? initialData;
  const isLoading_ = loading || isLoading;

  const isEdit = !!data;
  const defaultSubmitText = isEdit ? "Сохранить изменения" : "Создать";
  const defaultDescription = isEdit
    ? "Внесите изменения в запись"
    : "Заполните форму для создания новой записи";

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(data as T);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
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
              disabled={isLoading_}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading_}>
              {isLoading_ && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel || defaultSubmitText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CrudFormModal;
