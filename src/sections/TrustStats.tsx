import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function TrustStats() {
  const { t } = useTranslation();

  const stats = [
    { value: '500+', labelKey: 'stats.customers' },
    { value: '15%',  labelKey: 'stats.savings' },
    { value: '10+',  labelKey: 'stats.years' },
    { value: '250+', labelKey: 'stats.entities' },
  ];

  return (
    <div className="bg-primary-light text-white py-12 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-serif text-4xl md:text-5xl font-medium text-accent mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-muted-light font-medium uppercase tracking-wider">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
