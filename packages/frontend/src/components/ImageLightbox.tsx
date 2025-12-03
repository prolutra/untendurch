import type { FC } from 'react';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageLightboxProps {
  alt: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  srcs: string[];
}

export const ImageLightbox: FC<ImageLightboxProps> = ({
  alt,
  initialIndex = 0,
  isOpen,
  onClose,
  srcs,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : srcs.length - 1));
  }, [srcs.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < srcs.length - 1 ? prev + 1 : 0));
  }, [srcs.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && srcs.length > 1) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && srcs.length > 1) {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, srcs.length, goToPrevious, goToNext]);

  if (!isOpen || srcs.length === 0) return null;

  const hasMultiple = srcs.length > 1;

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

        <div className="relative flex items-center justify-center p-2">
          {/* Previous button */}
          {hasMultiple && (
            <button
              className="btn btn-circle btn-ghost absolute left-2 z-10 text-white hover:bg-white/20"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <img
            alt={alt}
            className="max-h-[85vh] w-auto object-contain"
            src={srcs[currentIndex]}
          />

          {/* Next button */}
          {hasMultiple && (
            <button
              className="btn btn-circle btn-ghost absolute right-2 z-10 text-white hover:bg-white/20"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>

        {/* Dots indicator */}
        {hasMultiple && (
          <div className="flex justify-center gap-2 pb-4">
            {srcs.map((_, index) => (
              <button
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
                key={index}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      <form className="modal-backdrop bg-black/80" method="dialog">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
