import { MessageCircle } from 'lucide-react';
import { CONTACT } from '@/data/content';

export default function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hello Nhanho Mobility, I’d like to enquire about a booking.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-green px-4 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-green/30 transition-transform hover:-translate-y-1"
      style={{ animation: 'pulse-ring 2.4s infinite' }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
