import { motion } from 'motion/react';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OpenService() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-primary">
      <motion.div
        className="max-w-xl mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Available Now badge */}
        <div className="inline-flex items-center gap-2 border border-accent/50 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-duration:3s]" />
          <span className="text-accent text-sm font-medium tracking-wide">
            {t('openService.badge')}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-serif font-medium text-white mb-3">
          {t('openService.headline')}
        </h2>

        {/* Subtext */}
        <p className="text-muted-light text-base leading-relaxed mb-8">
          {t('openService.subtext')}
        </p>

        {/* Call Now button */}
        <a
          href="tel:+13059272731"
          className="inline-flex items-center gap-2.5 bg-accent text-primary font-bold rounded-full px-8 py-3.5 hover:bg-accent-hover transition-colors duration-200"
        >
          <Phone className="w-4 h-4" />
          <span>{t('openService.cta')} · 305-927-2731</span>
        </a>
      </motion.div>
    </section>
  );
}
