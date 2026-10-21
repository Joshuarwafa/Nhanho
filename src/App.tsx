import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import CursorGlow from '@/components/CursorGlow';
import PageTransition from '@/components/PageTransition';
import PageLoader from '@/components/PageLoader';
import AdminGuard from '@/components/admin/AdminGuard';

// Lazy-loaded per route: the whole site used to ship as one ~730KB bundle that every
// visitor downloaded before anything could render — the blank-white-then-load you saw.
// Splitting each page into its own chunk means a first visit only pays for the page it
// landed on (and the admin console, which pulls in Supabase/report code, never loads
// for a public visitor at all).
const Home = lazy(() => import('@/pages/Home'));
const Fleet = lazy(() => import('@/pages/Fleet'));
const Services = lazy(() => import('@/pages/Services'));
const Corporate = lazy(() => import('@/pages/Corporate'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Booking = lazy(() => import('@/pages/Booking'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminBookings = lazy(() => import('@/pages/admin/Bookings'));
const AdminFleet = lazy(() => import('@/pages/admin/Fleet'));
const AdminPricing = lazy(() => import('@/pages/admin/Pricing'));
// AdminStaff (add-admin) is temporarily pulled from the routes below — see Staff.tsx.

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/bookings" element={<AdminGuard><AdminBookings /></AdminGuard>} />
            <Route path="/admin/fleet" element={<AdminGuard><AdminFleet /></AdminGuard>} />
            <Route path="/admin/pricing" element={<AdminGuard><AdminPricing /></AdminGuard>} />
          </Routes>
        </Suspense>
      ) : (
        <PublicSite />
      )}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
