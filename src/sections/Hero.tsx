import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, ArrowRight, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TaxesToGoModal from './TaxesToGoModal';

export default function Hero() {
  const { t } = useTranslation();
  const [appModalOpen, setAppModalOpen] = useState(false);

  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden bg-primary text-white">
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-dfg-poster.jpg"
        aria-hidden="true"
        preload="auto"
      >
        <source src="/hero-dfg-background.webm" type="video/webm" />
      </video>

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-primary/60 z-[1]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full border border-accent/30 text-accent font-medium text-xs mb-6 uppercase tracking-widest">
              {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-white leading-[1.1] mb-6 tracking-tight">
              {t('hero.headline')} <br className="hidden md:block" />
              <span className="text-accent italic">{t('hero.headlineAccent')}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-light mb-10 max-w-2xl leading-relaxed">
              {t('hero.subtext')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#appointment"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-primary px-8 py-4 rounded-full text-center font-medium transition-all flex items-center justify-center gap-2 text-lg"
              >
                {t('hero.ctaBook')}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+13059272731"
                className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-center font-medium transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Phone className="w-5 h-5" />
                {t('hero.ctaCall')}
              </a>
              <button
                onClick={() => setAppModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 px-8 py-4 rounded-full text-center font-medium transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Smartphone className="w-5 h-5" />
                {t('taxesToGo.getAppBtn')}
              </button>
            </div>

            <TaxesToGoModal isOpen={appModalOpen} onClose={() => setAppModalOpen(false)} />

            <div className="mt-12 flex items-center gap-4 text-sm text-muted-light">
              <div className="flex items-center gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((i) => <span key={i}>★</span>)}
              </div>
              <span>{t('hero.socialProof')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
