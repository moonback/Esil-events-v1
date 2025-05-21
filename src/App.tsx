import React, { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import AdminRoute from './components/AdminRoute';
import AdminRoutes from './components/AdminRoutes';
import CookieConsentBanner from './components/CookieConsent';
import { initializeSmtpConfig } from './services/emailService';
import { ComparisonProvider } from './context/ComparisonContext';

// Lazy loading des pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const RegisterForm = lazy(() => import('./components/RegisterForm'));
const ArtistPage = lazy(() => import('./pages/ArtistPage'));
const EventsPage = lazy(() => import('./pages/EventsPage').then(module => ({ default: module.EventsPage })));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));
const CguPage = lazy(() => import('./pages/CguPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const RealisationPage = lazy(() => import('./pages/RealisationPage'));


const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));


// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Initialiser la configuration SMTP au démarrage
initializeSmtpConfig().catch(error => {
  console.error('Erreur lors de l\'initialisation de la configuration SMTP:', error);
});

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <ComparisonProvider>
          <CookieConsentBanner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Routes publiques avec Layout principal */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />


                <Route path="/categories" element={<CategoriesPage />} />

                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:category" element={<ProductListPage />} />
                <Route path="/products/:category/:subcategory" element={<ProductListPage />} />
                <Route path="/products/:category/:subcategory/:subsubcategory" element={<ProductListPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/qui-sommes-nous" element={<AboutPage />} />
                <Route path="/legal" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/artists" element={<ArtistPage />} />
                <Route path="/artist/:id" element={<ArtistDetailPage />} />
                <Route path="/agence-evenementielle" element={<EventsPage />} />
                <Route path="/cgu" element={<CguPage />} />
                <Route path='/realisations' element={<RealisationPage />} />
                <Route path="/compare" element={<ComparePage />} />
              </Route>

              {/* Routes utilisateur avec Layout principal */}
              <Route element={<Layout />}>
                <Route path="/profile" element={<AdminRoute><ProfilePage /></AdminRoute>} />
                <Route path="/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />
              </Route>
        
              {/* Routes admin avec AdminLayout */}
              <Route path="/admin/*" element={<AdminRoutes />} />
              
              {/* Page 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ComparisonProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
