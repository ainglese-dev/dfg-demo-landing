import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WhatsAppButton() {
  const { i18n } = useTranslation();
  const isEs = i18n.language?.startsWith('es');
  const message = isEs
    ? 'Hola%20DFG%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita'
    : 'Hi%20DFG%2C%20I%27d%20like%20to%20schedule%20an%20appointment';

  return (
    <a
      href={`https://wa.me/13059272731?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
