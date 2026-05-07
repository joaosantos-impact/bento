"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "./modal";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise((resolve) => setPending({ options, resolve }));
  }, []);

  function close(value: boolean) {
    if (!pending) return;
    pending.resolve(value);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal
          open
          onClose={() => close(false)}
          title={pending.options.title ?? "Confirmar"}
          footer={
            <>
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:border-zinc-400 dark:border-zinc-700"
              >
                {pending.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium text-white " +
                  (pending.options.variant === "destructive"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200")
                }
              >
                {pending.options.confirmLabel ?? "Confirmar"}
              </button>
            </>
          }
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{pending.options.message}</p>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm deve estar dentro de <ConfirmProvider>");
  return ctx;
}
