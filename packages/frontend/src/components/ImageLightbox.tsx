import type { FC } from 'react';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ImageLightboxProps {
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  src: string;
}

export const ImageLightbox: FC<ImageLightboxProps> = ({
  alt,
  isOpen,
  onClose,
  src,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="modal-box max-w-4xl bg-black/95 p-0">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center p-2">
          <img
            alt={alt}
            className="max-h-[85vh] w-auto object-contain"
            src={src}
          />
        </div>
      </div>
      <form className="modal-backdrop bg-black/80" method="dialog">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
