import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type PolicyType = 'cookie' | 'privacy' | 'data' | null;

interface Props {
  policy: PolicyType;
  onClose: () => void;
}

const EFFECTIVE_DATE = 'April 9, 2025';
const COMPANY = 'Digits Financial Group';
const EMAIL = 'info@digitsfinancial.tax';
const ADDRESS = '18425 NW 2nd Ave, Suite 403, Miami, FL 33169';

const policies: Record<Exclude<PolicyType, null>, { title: string; content: JSX.Element }> = {
  cookie: {
    title: 'Cookie Policy',
    content: (
      <>
        <p className="text-sm text-gray-500 mb-6">Effective Date: {EFFECTIVE_DATE}</p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">What Are Cookies</h3>
        <p className="text-gray-600 mb-4">
          Cookies are small text files placed on your device when you visit our website. They help us deliver a better experience by remembering your preferences and understanding how you interact with our site.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Cookies We Use</h3>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li><strong>Essential cookies</strong> — required for the site to function (e.g., your language preference, consent record).</li>
          <li><strong>Analytics cookies</strong> — help us understand traffic patterns and improve our content. We use anonymized data only.</li>
          <li><strong>Preference cookies</strong> — remember settings you have selected so you don't have to re-enter them on each visit.</li>
        </ul>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Third-Party Cookies</h3>
        <p className="text-gray-600 mb-4">
          We may use trusted third-party services (such as Google Analytics) that set their own cookies. These providers have their own privacy policies and we do not control their cookies.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Managing Cookies</h3>
        <p className="text-gray-600 mb-4">
          You can control or delete cookies through your browser settings at any time. Note that disabling certain cookies may affect functionality. You can also use the "Decline" option in our cookie banner to opt out of non-essential cookies.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Contact Us</h3>
        <p className="text-gray-600">
          For questions about our cookie practices, contact us at{' '}
          <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a> or{' '}
          {ADDRESS}.
        </p>
      </>
    ),
  },
  data: {
    title: 'Data Policy',
    content: (
      <>
        <p className="text-sm text-gray-500 mb-6">Effective Date: {EFFECTIVE_DATE}</p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Information We Collect</h3>
        <p className="text-gray-600 mb-2">When you use our website or services, we may collect:</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Contact information (name, email address, phone number)</li>
          <li>Appointment and service request details</li>
          <li>Device and browser information for analytics purposes</li>
          <li>Communication preferences and language settings</li>
        </ul>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">How We Use Your Data</h3>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>To process and confirm appointment bookings</li>
          <li>To communicate with you about our services</li>
          <li>To improve our website and user experience</li>
          <li>To comply with legal and regulatory obligations</li>
        </ul>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Data Sharing</h3>
        <p className="text-gray-600 mb-4">
          We do not sell or rent your personal data. We may share information with trusted service providers (e.g., email delivery, appointment scheduling) strictly for the purpose of delivering our services to you. All third parties are contractually required to protect your data.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Data Retention</h3>
        <p className="text-gray-600 mb-4">
          We retain your data for as long as necessary to provide our services and comply with legal requirements (typically 7 years for financial records as required by IRS regulations).
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Your Rights</h3>
        <p className="text-gray-600 mb-2">You have the right to:</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention requirements)</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Contact Us</h3>
        <p className="text-gray-600">
          To exercise your rights or ask questions about our data practices, contact us at{' '}
          <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a> or{' '}
          {ADDRESS}.
        </p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p className="text-sm text-gray-500 mb-6">Effective Date: {EFFECTIVE_DATE}</p>

        <p className="text-gray-600 mb-6">
          {COMPANY} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Information We Collect</h3>
        <p className="text-gray-600 mb-2">We collect information that you voluntarily provide to us, including:</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Name, email address, and phone number when you book an appointment</li>
          <li>Service preferences and appointment details</li>
          <li>Any messages or communications you send us through the website</li>
        </ul>
        <p className="text-gray-600 mb-4">
          We also automatically collect certain technical information such as IP address, browser type, and pages visited, solely for the purpose of improving site performance.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">How We Use Your Information</h3>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Schedule and confirm your appointments</li>
          <li>Send service-related communications (confirmations, reminders)</li>
          <li>Respond to your inquiries</li>
          <li>Improve our website and services</li>
          <li>Comply with applicable laws and regulations</li>
        </ul>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Information Sharing</h3>
        <p className="text-gray-600 mb-4">
          We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and delivering services, subject to confidentiality agreements.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Data Security</h3>
        <p className="text-gray-600 mb-4">
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Children's Privacy</h3>
        <p className="text-gray-600 mb-4">
          Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Changes to This Policy</h3>
        <p className="text-gray-600 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the effective date at the top of this page.
        </p>

        <h3 className="text-lg font-serif font-medium text-primary mb-2">Contact Us</h3>
        <p className="text-gray-600">
          If you have questions about this Privacy Policy, please contact us at:{' '}
          <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>
          <br />{ADDRESS}
        </p>
      </>
    ),
  },
};

export default function PolicyModal({ policy, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!policy) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [policy, onClose]);

  const data = policy ? policies[policy] : null;

  return (
    <AnimatePresence>
      {policy && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
              <h2 className="text-2xl font-serif font-medium text-primary">{data.title}</h2>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-primary transition-colors rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-8 py-6 flex-1">
              {data.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
