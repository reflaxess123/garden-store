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
import { AlertTriangle, Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

export interface DeleteConfirmDialogProps {
  trigger: ReactNode; // Кнопка-триггер (обычно кнопка "Удалить")
  title?: string;
  description?: string;
  itemName?: string; // Название удаляемого элемента
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  open?: boolean; // Контролируемое состояние
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "destructive";
}

export default function DeleteConfirmDialog({
  trigger,
  title,
  description,
  itemName,
  onConfirm,
  loading = false,
  confirmText = "Удалить",
  cancelText = "Отмена",
  open: controlledOpen,
  onOpenChange,
  variant = "destructive",
}: DeleteConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const defaultTitle = title || "Подтвердите удаление";
  const defaultDescription =
    description ||
    `Вы уверены, что хотите удалить${
      itemName ? ` "${itemName}"` : " этот элемент"
    }? Это действие нельзя отменить.`;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // Ошибка должна быть обработана в onConfirm
      console.error("Delete operation failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {defaultTitle}
          </DialogTitle>
          <DialogDescription className="text-left">
            {defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
