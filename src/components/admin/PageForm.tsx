import React, { useState, useEffect, useRef } from 'react';
import { PageFormData } from '../../services/pageService';
import RichTextEditor from '../ui/RichTextEditor';
import PagePreview from './PagePreview';
import PageContentGenerator from './PageContentGenerator';
import { Eye, EyeOff, Save } from 'lucide-react';

interface PageFormProps {
  initialData?: PageFormData;
  onSubmit: (data: PageFormData) => void;
  onCancel: () => void;
}

const DRAFT_STORAGE_KEY = 'page_draft';

const PageForm: React.FC<PageFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    meta_description: '',
    meta_keywords: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clé unique pour le stockage local du brouillon
  const storageKey = initialData ? `${DRAFT_STORAGE_KEY}_${initialData.slug}` : DRAFT_STORAGE_KEY;

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, initialData]);
  
  // Charger le brouillon sauvegardé au chargement initial
  useEffect(() => {
    if (!initialData) {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(parsedDraft);
          setSaveStatus('Brouillon restauré');
          setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
          console.error('Erreur lors de la restauration du brouillon:', error);
        }
      }
    }
    
    // Nettoyer le timeout à la destruction du composant
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [initialData, storageKey]);
  
  // Fonction pour sauvegarder automatiquement le brouillon
  const autoSaveDraft = () => {
    if (!initialData) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(formData));
        setSaveStatus('Brouillon enregistré');
        setUnsavedChanges(false);
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du brouillon:', error);
        setSaveStatus('Erreur lors de la sauvegarde');
      }
    }
  };
  
  // Configurer la sauvegarde automatique lorsque les données du formulaire changent
  useEffect(() => {
    if (!initialData) {
      setUnsavedChanges(true);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(autoSaveDraft, 3000);
    }
  }, [formData, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setUnsavedChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'L\'URL est requise';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'L\'URL ne doit contenir que des lettres minuscules, des chiffres et des tirets';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Fonction pour sauvegarder manuellement le brouillon
  const handleSaveDraft = () => {
    autoSaveDraft();
  };
  
  // Fonction pour basculer l'affichage de la prévisualisation
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={togglePreview}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Masquer la prévisualisation
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </>
            )}
          </button>
          
          {!initialData && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer le brouillon
            </button>
          )}
        </div>
        
        {saveStatus && (
          <span className={`text-sm ${unsavedChanges ? 'text-amber-600' : 'text-green-600'}`}>
            {saveStatus}
          </span>
        )}
      </div>
      
      {/* Prévisualisation */}
      {showPreview && (
        <div className="mb-6">
          <PagePreview 
            title={formData.title || 'Titre de la page'}
            content={formData.content || '<p>Contenu de la page...</p>'}
            meta_description={formData.meta_description}
            meta_keywords={formData.meta_keywords}
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
              /
            </span>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`block w-full flex-1 rounded-none rounded-r-md border ${errors.slug ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-black focus:outline-none focus:ring-black sm:text-sm`}
            />
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenu <span className="text-red-500">*</span>
          </label>
          <div className="mb-2">
            <PageContentGenerator
              pageData={formData}
              onContentGenerated={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>
          <div className={`mt-1 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Commencez à écrire le contenu de votre page..."
            />
          </div>
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>

        <div>
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
            Meta Description (SEO)
          </label>
          <textarea
            id="meta_description"
            name="meta_description"
            rows={2}
            value={formData.meta_description || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
            Mots-clés (SEO)
          </label>
          <input
            type="text"
            id="meta_keywords"
            name="meta_keywords"
            value={formData.meta_keywords || ''}
            onChange={handleChange}
            placeholder="Séparés par des virgules"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
    </div>
  );
};

export default PageForm;