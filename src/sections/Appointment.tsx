import { useState } from 'react';
import { MapPin, Calendar, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SERVICE_KEYS = [
  'taxPrep', 'bookkeeping', 'creditRepair',
  'lineOfCredit', 'entityCreation', 'lifeInsurance', 'notary',
] as const;

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

export default function Appointment() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    service: '', date: '', time: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="appointment" className="py-24 bg-miami-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Info Panel */}
            <div className="lg:col-span-2 bg-primary text-white p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="text-3xl font-serif font-medium mb-4">{t('appointment.sectionTitle')}</h3>
                <p className="text-muted-light mb-12">{t('appointment.sectionSubtext')}</p>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-lg mb-1">{t('appointment.officeLocation')}</h4>
                      <p className="text-gray-300">18425 NW 2nd Ave, Suite 403<br />Miami, FL 33169</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Calendar className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-lg mb-1">{t('appointment.officeHours')}</h4>
                      <p className="text-gray-300 whitespace-pre-line">{t('appointment.hours')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-16 pt-8 border-t border-white/10">
                <p className="text-accent font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('appointment.seHablaEspanol')}
                </p>
              </div>
            </div>

            {/* Form Panel */}
            <div className="lg:col-span-3 p-12">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-primary">{t('appointment.form.successTitle')}</h3>
                  <p className="text-gray-600">{t('appointment.form.successBody')}</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.firstName')}</label>
                      <input name="firstName" type="text" required value={form.firstName} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.lastName')}</label>
                      <input name="lastName" type="text" required value={form.lastName} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.email')}</label>
                      <input name="email" type="email" required value={form.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.phone')}</label>
                      <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.service')}</label>
                    <select name="service" required value={form.service} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white appearance-none">
                      <option value="">{t('appointment.form.selectService')}</option>
                      {SERVICE_KEYS.map((key) => (
                        <option key={key} value={key}>{t(`appointment.form.services.${key}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.preferredDate')}</label>
                      <input name="date" type="date" required value={form.date} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.preferredTime')}</label>
                      <input name="time" type="time" required value={form.time} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('appointment.form.message')}</label>
                    <textarea name="message" rows={3} value={form.message} onChange={handleChange}
                      placeholder={t('appointment.form.messagePlaceholder')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white resize-none" />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full border-2 border-accent bg-accent text-primary hover:bg-accent-hover hover:border-accent-hover px-8 py-4 rounded-full font-medium transition-all shadow-lg shadow-accent/20 text-lg disabled:opacity-60"
                  >
                    {status === 'submitting' ? t('appointment.form.submitting') : t('appointment.form.submit')}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
