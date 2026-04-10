import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FaqItem {
  q: string;
  a: string;
}

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = t('faq.items', { returnObjects: true }) as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-medium text-primary mb-4">{t('faq.sectionTitle')}</h2>
          <p className="text-lg text-gray-600">{t('faq.sectionSubtext')}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-2xl overflow-hidden transition-colors ${openIndex === index ? 'border-accent bg-miami-warm' : 'border-gray-200 bg-white'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-medium text-primary text-lg pr-8">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-accent-hover' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
