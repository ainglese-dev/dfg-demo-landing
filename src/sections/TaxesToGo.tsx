import { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TaxesToGoModal from './TaxesToGoModal';

export default function TaxesToGo() {
  const { t } = useTranslation();
  const features = t('taxesToGo.features', { returnObjects: true }) as string[];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-24 bg-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 text-accent text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                {t('taxesToGo.badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">{t('taxesToGo.title')}</h2>
              <p className="text-lg text-muted-light mb-8 leading-relaxed">{t('taxesToGo.body')}</p>

              <ul className="space-y-4 mb-10">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 px-8 py-3 rounded-full font-medium transition-colors"
              >
                {t('taxesToGo.getAppBtn')}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="w-[300px] h-[600px] bg-primary-light rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 w-full h-6 bg-gray-800 rounded-b-3xl" />
                <div className="p-6 pt-12 h-full flex flex-col bg-white">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-8 h-8 bg-primary rounded-lg" />
                    <div className="w-24 h-4 bg-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="w-full h-32 bg-miami-warm rounded-2xl border border-gray-100 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-primary/20" />
                    </div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded-full" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded-full" />
                    <div className="w-full h-24 bg-gray-50 rounded-2xl mt-8" />
                    <div className="w-full h-24 bg-gray-50 rounded-2xl" />
                  </div>
                  <div className="w-full h-12 bg-accent rounded-xl mt-auto" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-accent/10 blur-[100px] -z-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      <TaxesToGoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
