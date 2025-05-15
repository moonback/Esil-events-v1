import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import ThemeManager from '../../components/admin/ThemeManager';
import { Palette } from 'lucide-react';

const AdminThemes: React.FC = () => {
  return (
    <AdminLayout>
      <AdminHeader title="Gestion des thèmes" icon={<Palette size={24} />} />
      <div className="container mx-auto px-4 py-8">
        <ThemeManager />
      </div>
    </AdminLayout>
  );
};

export default AdminThemes; 