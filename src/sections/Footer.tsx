import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PolicyType } from '@/sections/PolicyModal';

interface Props {
  onOpenPolicy: (policy: PolicyType) => void;
}

export default function Footer({ onOpenPolicy }: Props) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const services = [
    { key: 'taxPrep', href: '#services' },
    { key: 'bookkeeping', href: '#services' },
    { key: 'creditRepair', href: '#services' },
    { key: 'lineOfCredit', href: '#services' },
    { key: 'entityCreation', href: '#services' },
  ] as const;

  return (
    <footer id="contact" className="bg-primary text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-primary font-serif font-bold text-xl">D</div>
              <span className="font-serif font-bold text-xl tracking-tight text-accent">Digits Financial Group</span>
            </div>
            <p className="text-gray-400 mb-6">{t('footer.tagline')}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 text-sm font-medium text-accent">
              <Globe className="w-4 h-4" />
              {t('footer.seHablaEspanol')}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-medium text-lg mb-6">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-3 text-gray-400">
              {services.map(({ key, href }) => (
                <li key={key}>
                  <a href={href} className="hover:text-accent transition-colors">
                    {t(`services.items.${key}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-lg mb-6">{t('footer.companyTitle')}</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#about" className="hover:text-accent transition-colors">{t('footer.links.about')}</a></li>
              <li><a href="#faq" className="hover:text-accent transition-colors">{t('footer.links.faq')}</a></li>
              <li><a href="#appointment" className="hover:text-accent transition-colors">{t('footer.links.bookAppointment')}</a></li>
              <li><button onClick={() => onOpenPolicy('privacy')} className="hover:text-accent transition-colors">{t('footer.links.privacyPolicy')}</button></li>
              <li><button onClick={() => onOpenPolicy('privacy')} className="hover:text-accent transition-colors">{t('footer.links.terms')}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-medium text-lg mb-6">{t('footer.contactTitle')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>18425 NW 2nd Ave, Suite 403<br />Miami, FL 33169</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href="tel:+13059272731" className="hover:text-accent transition-colors">(305) 927-2731</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href="mailto:info@digitsfinancial.tax" className="hover:text-accent transition-colors">info@digitsfinancial.tax</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-accent transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-accent transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>{t('footer.copyright', { year })}</div>
          <div>{t('footer.poweredBy')}</div>
        </div>
      </div>
    </footer>
  );
}
