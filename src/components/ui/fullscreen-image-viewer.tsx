'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export type ViewerImage = {
  url: string;
  alt?: string;
  title?: string;
  caption?: string;
};

export type FullScreenImageViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  images: readonly (string | ViewerImage)[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  showThumbnails?: boolean;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
  }),
};

export function FullScreenImageViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  subtitle,
  showThumbnails = true,
}: FullScreenImageViewerProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [direction, setDirection] = useState<number>(0);

  const normalizedImages = useMemo(() => {
    return images
      .map((item) => {
        if (typeof item === 'string') {
          return { url: item, alt: 'Imagen ampliada' };
        }
        return {
          url: item.url,
          alt: item.alt || item.title || 'Imagen ampliada',
          title: item.title,
          caption: item.caption,
        };
      })
      .filter((item) => Boolean(item.url));
  }, [images]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, normalizedImages.length - 1));
      setCurrentIndex(validIndex);
      setDirection(0);
    }
  }, [isOpen, initialIndex, normalizedImages.length]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const total = normalizedImages.length;
  const isMultiple = total > 1;

  const paginate = useCallback(
    (newDirection: number) => {
      if (!isMultiple) return;
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        const next = prev + newDirection;
        if (next < 0) return total - 1;
        if (next >= total) return 0;
        return next;
      });
    },
    [isMultiple, total],
  );

  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (targetIndex === currentIndex || targetIndex < 0 || targetIndex >= total) return;
      setDirection(targetIndex > currentIndex ? 1 : -1);
      setCurrentIndex(targetIndex);
    },
    [currentIndex, total],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        paginate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, paginate]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocity = 400;

    if (info.offset.y > 120 && Math.abs(info.offset.x) < 80) {
      onClose();
      return;
    }

    if (isMultiple) {
      if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
        paginate(1);
      } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
        paginate(-1);
      }
    }
  };

  if (!mounted || !isOpen || total === 0) return null;

  const currentImage = normalizedImages[currentIndex] ?? normalizedImages[0];
  const activeTitle = currentImage?.title || title;
  const activeCaption = currentImage?.caption || subtitle;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeTitle || 'Visor de imágenes a pantalla completa'}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none touch-none"
    >
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col min-w-0 pr-4">
          {activeTitle && (
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{activeTitle}</h2>
          )}
          {activeCaption && <p className="text-xs text-white/70 truncate">{activeCaption}</p>}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {isMultiple && (
            <span className="text-xs sm:text-sm font-semibold text-white/80 tabular-nums px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs">
              {currentIndex + 1} / {total}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition cursor-pointer"
            aria-label="Cerrar visor de imágenes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center w-full h-full overflow-hidden px-2 sm:px-8">
        {isMultiple && (
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-90 transition backdrop-blur-md cursor-pointer"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentImage.url + currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 350, damping: 35 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              drag={isMultiple ? 'x' : 'y'}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex items-center justify-center p-2 sm:p-6 cursor-grab active:cursor-grabbing"
            >
              <div className="relative w-full h-full max-w-6xl max-h-[82vh] flex items-center justify-center">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || 'Foto ampliada'}
                  fill
                  unoptimized
                  priority
                  sizes="100vw"
                  draggable={false}
                  className="object-contain select-none pointer-events-none"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {isMultiple && (
          <button
            type="button"
            onClick={() => paginate(1)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-90 transition backdrop-blur-md cursor-pointer"
            aria-label="Siguiente foto"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </main>

      <footer className="relative z-30 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        {isMultiple && showThumbnails && total <= 24 && (
          <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-2 scrollbar-none">
            {normalizedImages.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={`thumb-${img.url}-${idx}`}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-primary scale-105 opacity-100'
                      : 'opacity-50 hover:opacity-85'
                  }`}
                  aria-label={`Ver foto ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Miniatura ${idx + 1}`}
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
