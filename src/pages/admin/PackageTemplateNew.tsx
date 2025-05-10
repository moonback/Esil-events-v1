import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import PackageTemplateForm from '../../components/admin/PackageTemplateForm';
import { NotificationContainer } from '../../components/admin/AdminNotification';

const PackageTemplateNew: React.FC = () => {
  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="pt-24">
        <PackageTemplateForm isEditing={false} />
      </div>
    </AdminLayout>
  );
};

export default PackageTemplateNew;