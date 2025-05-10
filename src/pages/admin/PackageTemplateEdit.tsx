import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import PackageTemplateForm from '../../components/admin/PackageTemplateForm';
import { NotificationContainer, useNotification } from '../../components/admin/AdminNotification';
import { getPackageTemplateById } from '../../services/packageTemplateService';
import { PackageTemplateFormData } from '../../types/PackageTemplate';

const PackageTemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [templateData, setTemplateData] = useState<PackageTemplateFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!id) {
        navigate('/admin/package-templates/new');
        return;
      }

      try {
        setLoading(true);
        const template = await getPackageTemplateById(id);
        
        if (!template) {
          setError('Modèle de package non trouvé');
          return;
        }

        // Convertir les données pour le formulaire
        const formData: PackageTemplateFormData = {
          name: template.name,
          description: template.description,
          slug: template.slug,
          target_event_type: template.target_event_type,
          base_price: template.base_price,
          is_active: template.is_active,
          image_url: template.image_url,
          order_index: template.order_index,
        };

        setTemplateData(formData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du modèle de package:', err);
        setError('Erreur lors du chargement du modèle de package');
        showNotification('Erreur lors du chargement du modèle de package', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
  }, [id, navigate, showNotification]);

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="pt-24">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement du modèle de package...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => navigate('/admin/package-templates')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader />
      <NotificationContainer />
      <div className="pt-24">
        {templateData && (
          <PackageTemplateForm
            initialData={templateData}
            templateId={id}
            isEditing={true}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default PackageTemplateEdit;