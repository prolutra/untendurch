import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string | React.ReactNode;
  message: string | React.ReactNode;
  confirmLabel?: string | React.ReactNode;
  cancelLabel?: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const confirmButtonClass =
    variant === 'danger'
      ? 'btn btn-error'
      : variant === 'warning'
        ? 'btn btn-warning'
        : 'btn btn-primary';

  return (
    <dialog ref={dialogRef} className="modal" onClose={onCancel}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            {cancelLabel || (
              <FormattedMessage
                id="confirm_dialog_cancel"
                defaultMessage="Abbrechen"
              />
            )}
          </button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmLabel || (
              <FormattedMessage
                id="confirm_dialog_confirm"
                defaultMessage="Bestätigen"
              />
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};
