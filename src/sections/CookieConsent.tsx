import { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { PolicyType } from '@/sections/PolicyModal';

const STORAGE_KEY = 'dfg_cookie_consent';

interface Props {
  onOpenPolicy: (policy: PolicyType) => void;
}

export default function CookieConsent({ onOpenPolicy }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const dismiss = (accepted: boolean) => {
    localStorage.setItem(STORAGE_KEY, accepted ? 'accepted' : 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 w-full z-[60] bg-primary border-t border-white/10 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 text-center sm:text-left">
          {t('cookie.message')}{' '}
          <button onClick={() => onOpenPolicy('cookie')} className="text-accent hover:underline">{t('cookie.cookiePolicy')}</button>
          {' '}&amp;{' '}
          <button onClick={() => onOpenPolicy('data')} className="text-accent hover:underline">{t('cookie.dataPolicy')}</button>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => dismiss(true)}
            className="bg-accent text-primary hover:bg-accent-hover px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {t('cookie.acceptAll')}
          </button>
          <button
            onClick={() => dismiss(false)}
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {t('cookie.decline')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
