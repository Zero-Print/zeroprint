'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ZPButton } from '../ZPButton';

interface ZPModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  preventScroll?: boolean;
}

interface ZPModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ZPModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ZPModalFooterProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

// Hook for focus trapping
const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, containerRef]);
};

// Main Modal Component
type ZPModalComponent = React.FC<ZPModalProps> & {
  Header: typeof ZPModalHeader;
  Body: typeof ZPModalBody;
  Footer: typeof ZPModalFooter;
};

export const ZPModal = (({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  preventScroll = true,
}: ZPModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trapping
  useFocusTrap(isOpen, modalRef);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  const modalContent = (
    <div
      className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', overlayClassName)}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-background border border-border rounded-lg shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          sizeClasses[size],
          className
        )}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <ZPModalHeader onClose={onClose} showCloseButton={showCloseButton}>
            {title && (
              <div>
                <h2 id='modal-title' className='text-lg font-semibold text-foreground'>
                  {title}
                </h2>
                {description && (
                  <p id='modal-description' className='text-sm text-muted-foreground mt-1'>
                    {description}
                  </p>
                )}
              </div>
            )}
          </ZPModalHeader>
        )}

        {/* Content */}
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}) as ZPModalComponent;

// Modal Header Component
export const ZPModalHeader: React.FC<ZPModalHeaderProps> = ({
  children,
  className,
  onClose,
  showCloseButton = true,
}) => {
  return (
    <div className={cn('flex items-start justify-between p-6 pb-4', className)}>
      <div className='flex-1'>{children}</div>
      {showCloseButton && onClose && (
        <ZPButton
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='h-8 w-8 rounded-full'
          aria-label='Close modal'
        >
          <X className='h-4 w-4' />
        </ZPButton>
      )}
    </div>
  );
};

// Modal Body Component
export const ZPModalBody: React.FC<ZPModalBodyProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};

// Modal Footer Component
export const ZPModalFooter: React.FC<ZPModalFooterProps> = ({
  children,
  className,
  justify = 'end',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-6 pt-4 border-t border-border',
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};

// Compound component with sub-components
ZPModal.Header = ZPModalHeader;
ZPModal.Body = ZPModalBody;
ZPModal.Footer = ZPModalFooter;

// Convenience hook for modal state
export const useZPModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default ZPModal;
