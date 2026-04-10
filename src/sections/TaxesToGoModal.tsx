import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, X, ExternalLink } from 'lucide-react';

const APP_URL = 'https://taxestogo.com/app/download/90636';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaxesToGoModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-[#1a1a2e] shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-medium">
                <Smartphone className="w-4 h-4 text-accent" />
                TaxesToGo™
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <iframe
              src={APP_URL}
              title="TaxesToGo App Download"
              className="w-full border-0"
              style={{ height: '520px' }}
            />

            <div className="px-5 py-3 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                Having trouble?{' '}
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Open in new tab <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
