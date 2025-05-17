import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import ThemeSelector from '../../components/admin/ThemeSelector';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Paramètres du Site</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Apparence</h2>
            <ThemeSelector />
          </div>
          
          {/* Section pour d'autres paramètres du site */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Autres Paramètres</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-gray-600 dark:text-gray-300">
                D'autres paramètres du site seront ajoutés ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings; 