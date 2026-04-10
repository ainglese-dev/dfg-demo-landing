import { motion } from 'motion/react';
import { CheckCircle2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 bg-miami-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-primary-light" />
            <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
              <div className="font-serif text-4xl text-accent mb-2">10+</div>
              <div className="text-white font-medium">{t('about.yearsLabel')}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-medium text-primary mb-6">{t('about.sectionTitle')}</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{t('about.body')}</p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-accent-hover" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-medium text-primary mb-2">{t('about.mission.title')}</h4>
                  <p className="text-gray-600">{t('about.mission.body')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-medium text-primary mb-2">{t('about.vision.title')}</h4>
                  <p className="text-gray-600">{t('about.vision.body')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
