import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminPackages from '../pages/admin/Packages';
import AdminCategories from '../pages/admin/Categories';
import AdminPages from '../pages/admin/Pages';
import AdminCustomers from '../pages/admin/Customers';
import AdminAnnouncements from '../pages/admin/Announcements';
import AdminArtists from '../pages/admin/Artists';
import AdminArtistCategories from '../pages/admin/ArtistCategories';
import AdminQuoteRequests from '../pages/admin/QuoteRequests';
import AdminEmailConfig from '../pages/admin/EmailConfig';

const AdminRoutes: React.FC = () => {
  return (
    <AdminRoute>
      <Routes>
        <Route path="" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="artists" element={<AdminArtists />} />
        <Route path="artist-categories" element={<AdminArtistCategories />} />
        <Route path="quote-requests" element={<AdminQuoteRequests />} />
        <Route path="email-config" element={<AdminEmailConfig />} />
      </Routes>
    </AdminRoute>
  );
};

export default AdminRoutes;