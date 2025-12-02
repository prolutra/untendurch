import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

interface ConfirmDialogProps {
  cancelLabel?: React.ReactNode | string;
  confirmLabel?: React.ReactNode | string;
  isOpen: boolean;
  message: React.ReactNode | string;
  onCancel: () => void;
  onConfirm: () => void;
  title: React.ReactNode | string;
  variant?: 'danger' | 'info' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  cancelLabel,
  confirmLabel,
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
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
    <dialog className="modal" onClose={onCancel} ref={dialogRef}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            {cancelLabel || (
              <FormattedMessage
                defaultMessage="Abbrechen"
                id="confirm_dialog_cancel"
              />
            )}
          </button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmLabel || (
              <FormattedMessage
                defaultMessage="Bestätigen"
                id="confirm_dialog_confirm"
              />
            )}
          </button>
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};
