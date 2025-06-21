"use client";

import { AdminProductClient } from "@/entities/product/admin-api";
import { ReactNode, useState } from "react";
import ProductFormModal from "./ProductFormModal";

export interface ProductFormModalWrapperProps {
  product?: AdminProductClient | null;
  trigger: ReactNode;
  onSuccess?: () => void;
}

export default function ProductFormModalWrapper({
  product,
  trigger,
  onSuccess,
}: ProductFormModalWrapperProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      <ProductFormModal
        product={product || null}
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
