import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, Phone, Calendar, Globe, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentLang = i18n.language?.startsWith('es') ? 'ES' : 'EN';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    const next = currentLang === 'EN' ? 'es' : 'en';
    i18n.changeLanguage(next);
  };

  const navLinks = [
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.faq'), href: '#faq' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  return (
    <header className="fixed w-full z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className={`bg-accent text-primary overflow-hidden transition-all duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center text-sm font-medium">
          <div className="flex items-center gap-6">
            <a href="tel:+13059272731" className="flex items-center gap-2 hover:text-primary-light transition-colors">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">(305) 927-2731</span>
            </a>
            <a href="mailto:info@digitsfinancial.tax" className="hidden md:flex items-center gap-2 hover:text-primary-light transition-colors">
              <Mail className="w-4 h-4" />
              info@digitsfinancial.tax
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary-light transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary-light transition-colors" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-primary-light transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`w-full transition-all duration-300 ${isScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg py-3' : 'bg-primary py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-primary font-serif font-bold text-xl">D</div>
              <span className="font-serif font-bold text-xl tracking-tight text-accent">Digits Financial Group</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-white hover:text-accent transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                <button onClick={toggleLang} className="flex items-center gap-1 text-sm font-medium text-white hover:text-accent transition-colors">
                  <Globe className="w-4 h-4" />
                  {currentLang}
                </button>
                <a href="#appointment" className="border-2 border-accent text-accent hover:bg-accent hover:text-primary px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('nav.bookAppointment')}
                </a>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={toggleLang} className="flex items-center gap-1 text-sm font-medium text-white">
                <Globe className="w-4 h-4" />
                {currentLang}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-primary border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-white hover:bg-white/5 rounded-lg"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 mt-2 border-t border-white/10">
                  <a
                    href="#appointment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-primary px-5 py-3 rounded-full text-center font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    {t('nav.bookAppointment')}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
