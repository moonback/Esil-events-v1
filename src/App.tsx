import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductListPage from './pages/ProductListPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import DeliveryPage from './pages/DeliveryPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminPages from './pages/admin/Pages';
import AdminCustomers from './pages/admin/Customers';
import AdminCategories from './pages/admin/Categories';
import AdminAnnouncements from './pages/admin/Announcements';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { CartProvider } from './context/CartContext';
import AdminRoute from './components/AdminRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ArtistPage from './pages/ArtistPage';
import { EventsPage } from './pages/EventsPage';  // Changed from default import to named import

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Routes publiques avec Layout principal */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:category" element={<ProductListPage />} />
            <Route path="/products/:category/:subcategory" element={<ProductListPage />} />
            <Route path="/products/:category/:subcategory/:subsubcategory" element={<ProductListPage />} />

            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/artists" element={<ArtistPage />} />
            <Route path="/agence-evenementielle" element={<EventsPage />} />
          </Route>

          {/* Routes utilisateur avec Layout principal */}
          <Route element={<Layout />}>
            <Route path="/profile" element={<AdminRoute><ProfilePage /></AdminRoute>} />
            <Route path="/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />
          </Route>

          {/* Routes admin sans Layout principal */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/pages" element={<AdminRoute><AdminPages /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />

          {/* Page 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
