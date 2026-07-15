'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ID untuk aria-labelledby (harus cocok dengan id pada elemen judul di dalam modal) */
  titleId?: string;
  /** ID untuk aria-describedby (opsional) */
  descriptionId?: string;
  /** Lebar maksimum modal */
  maxWidth?: ModalMaxWidth;
  children: React.ReactNode;
  className?: string;
}

const maxWidthMap: Record<ModalMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

/**
 * Shell modal yang dapat digunakan kembali.
 * Menyediakan: backdrop, dialog wrapper, focus trap, Escape key handler.
 * Konten (header/body/footer) disediakan oleh consumer melalui children.
 */
export function Modal({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  maxWidth = 'md',
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Simpan elemen yang memicu modal agar bisa mengembalikan fokus
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else {
      // Kembalikan fokus ke trigger setelah modal tutup
      if (triggerRef.current && 'focus' in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Fokus ke dialog saat pertama kali terbuka
    dialog.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cegah scroll body saat modal terbuka
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={handleClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={clsx(
          'relative bg-white rounded-xl shadow-xl w-full flex flex-col max-h-[90vh]',
          maxWidthMap[maxWidth],
          'focus:outline-none',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Sub-komponen Modal ──────────────────────────────────────────────────────

interface ModalHeaderProps {
  id?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Icon atau elemen tambahan di samping kiri judul */
  icon?: React.ReactNode;
}

export function ModalHeader({ id, title, subtitle, onClose, icon }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold text-gray-900 truncate">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="shrink-0 ml-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface ModalBodyProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** Apakah konten bisa di-scroll */
  scrollable?: boolean;
}

export function ModalBody({ id, children, className, scrollable = false }: ModalBodyProps) {
  return (
    <div id={id} className={clsx('px-5 py-4', scrollable && 'overflow-y-auto flex-1', className)}>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;
