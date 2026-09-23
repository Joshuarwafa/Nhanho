import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import CursorGlow from '@/components/CursorGlow';
import PageTransition from '@/components/PageTransition';
import AdminGuard from '@/components/admin/AdminGuard';
import Home from '@/pages/Home';
import Fleet from '@/pages/Fleet';
import Services from '@/pages/Services';
import Corporate from '@/pages/Corporate';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Booking from '@/pages/Booking';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminBookings from '@/pages/admin/Bookings';
import AdminFleet from '@/pages/admin/Fleet';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function PublicSite() {
  const location = useLocation();
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/fleet" element={<PageTransition><Fleet /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/corporate" element={<PageTransition><Corporate /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
            <Route path="*" element={<PageTransition><Home /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ScrollToTop />
      {isAdmin ? (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/bookings" element={<AdminGuard><AdminBookings /></AdminGuard>} />
          <Route path="/admin/fleet" element={<AdminGuard><AdminFleet /></AdminGuard>} />
        </Routes>
      ) : (
        <PublicSite />
      )}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
