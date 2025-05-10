import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminCategories from '../pages/admin/Categories';
import AdminPages from '../pages/admin/Pages';
import AdminCustomers from '../pages/admin/Customers';
import AdminAnnouncements from '../pages/admin/Announcements';
import AdminArtists from '../pages/admin/Artists';
import AdminArtistCategories from '../pages/admin/ArtistCategories';
import QuoteRequestsAdmin from '../pages/admin/QuoteRequests';
import EmailConfigPage from '../pages/admin/EmailConfig';
import AdminSitemap from '../pages/admin/Sitemap';
import { AdminRealizations } from '../pages/admin/Realizations';
import KeywordRankings from '../pages/admin/KeywordRankings';
import AdminNewsletter from '../pages/admin/Newsletter';
import AdminPackageTemplates from '../pages/admin/PackageTemplates';
import PackageTemplateNew from '../pages/admin/PackageTemplateNew';
import PackageTemplateEdit from '../pages/admin/PackageTemplateEdit';
import PackageTemplateDetail from '../pages/admin/PackageTemplateDetail';
import { NotificationProvider } from './admin/AdminNotification';

const AdminRoutes: React.FC = () => {
  return (
    <AdminRoute>
      <NotificationProvider>
        <Routes>
          <Route path="" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="artist-categories" element={<AdminArtistCategories />} />
          <Route path="quote-requests" element={<QuoteRequestsAdmin />} />
          <Route path="email-config" element={<EmailConfigPage />} />
          <Route path="sitemap" element={<AdminSitemap />} />
          <Route path="realizations" element={<AdminRealizations />} />
          <Route path="keyword-rankings" element={<KeywordRankings />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="package-templates" element={<AdminPackageTemplates />} />
          <Route path="package-templates/new" element={<PackageTemplateNew />} />
          <Route path="package-templates/:id" element={<PackageTemplateDetail />} />
          <Route path="package-templates/:id/edit" element={<PackageTemplateEdit />} />
        </Routes>
      </NotificationProvider>
    </AdminRoute>
  );
};

export default AdminRoutes;