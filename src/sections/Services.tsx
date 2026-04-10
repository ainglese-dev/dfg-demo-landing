import { motion } from 'motion/react';
import { Calculator, BookOpen, CreditCard, Building2, FileText, Shield, PenTool, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const serviceKeys = [
  { key: 'taxPrep',        icon: Calculator, gradientFrom: '#1a1a2e', gradientTo: '#00c48a' },
  { key: 'bookkeeping',    icon: BookOpen,   gradientFrom: '#1e1e35', gradientTo: '#0099cc' },
  { key: 'creditRepair',   icon: CreditCard, gradientFrom: '#1a2438', gradientTo: '#6c5ce7' },
  { key: 'lineOfCredit',   icon: Building2,  gradientFrom: '#1a2e1a', gradientTo: '#00b870' },
  { key: 'entityCreation', icon: FileText,   gradientFrom: '#2e1a1a', gradientTo: '#e07000' },
  { key: 'lifeInsurance',  icon: Shield,     gradientFrom: '#1a1a2e', gradientTo: '#0066ff' },
  { key: 'notary',         icon: PenTool,    gradientFrom: '#2a1a2e', gradientTo: '#b000e0' },
] as const;

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-serif font-medium text-primary mb-4">{t('services.sectionTitle')}</h2>
          <p className="text-lg text-gray-600">{t('services.sectionSubtext')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceKeys.map(({ key, icon: Icon, gradientFrom, gradientTo }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-miami-warm rounded-2xl border border-gray-100 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image placeholder banner */}
              <div
                className="h-44 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
              >
                <Icon className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  {t(`services.items.${key}.category`)}
                </div>
                <h3 className="text-xl font-serif font-medium text-primary mb-3">
                  {t(`services.items.${key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {t(`services.items.${key}.description`)}
                </p>
                <a href="#appointment" className="inline-flex items-center text-sm font-medium text-primary group-hover:text-accent transition-colors mt-auto">
                  {t('services.learnMore')} <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
