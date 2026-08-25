import { useId } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { WarningIcon, XIcon } from "@phosphor-icons/react";

import "@/styles/components/Modals/ConfirmModal.css";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  danger?: boolean;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onCancel();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="confirm-modal" />

        <Dialog.Content
          className="confirm-modal__content"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <div className="confirm-modal__accent" />

          <Dialog.Close asChild>
            <button
              type="button"
              className="confirm-modal__close"
              disabled={loading}
              aria-label="Close"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </Dialog.Close>

          <div className="confirm-modal__body">
            <div
              className={
                danger
                  ? "confirm-modal__icon confirm-modal__icon--danger"
                  : "confirm-modal__icon"
              }
            >
              <WarningIcon size={23} weight="bold" />
            </div>

            <div className="confirm-modal__text">
              <Dialog.Title id={titleId} className="confirm-modal__title">
                {title}
              </Dialog.Title>

              {description && (
                <Dialog.Description
                  id={descriptionId}
                  className="confirm-modal__description"
                >
                  {description}
                </Dialog.Description>
              )}
            </div>

            <div className="confirm-modal__actions">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="confirm-modal__cancel"
                  disabled={loading}
                >
                  {cancelText}
                </button>
              </Dialog.Close>

              <button
                type="button"
                className={
                  danger
                    ? "confirm-modal__confirm confirm-modal__confirm--danger"
                    : "confirm-modal__confirm"
                }
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Please wait..." : confirmText}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
