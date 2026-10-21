import { MessageCircle } from 'lucide-react';
import { CONTACT } from '@/data/content';

export default function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hello Nhanho Mobility, I’d like to enquire about a booking.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-lg shadow-navy/25 transition-transform hover:-translate-y-1 hover:bg-navy-700"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
