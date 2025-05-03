import React, { useState, useEffect } from 'react';
// REMOVE: import { Product, ProductFormData, PRODUCT_CATEGORIES } from '../types/Product';
import { Product, ProductFormData } from '../types/Product'; // Keep Product, ProductFormData
import { uploadProductImage } from '../services/productService';
// ADD: Import category service and types
import {
  getAllCategories,
  Category,
  Subcategory,
  SubSubcategory // Import if needed elsewhere, otherwise Category/Subcategory might suffice
} from '../services/categoryService';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import ProductDescriptionGenerator from './ProductDescriptionGenerator';
import { generateProductSeo, ProductSeoGenerationOptions } from '../services/productSeoService';
import { Sparkles } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProductFormData>(() => {
    // Initialiser le formulaire avec les données initiales ou des valeurs par défaut
    const defaults: ProductFormData = {
      name: '',
      reference: '',
      category: '', // Initialisé vide, sera défini après chargement
      subCategory: '', // Initialisé vide
      subSubCategory: '', // Initialisé vide
      description: '',
      priceHT: 0,
      priceTTC: 0,
      stock: 0,
      images: [],
      mainImageIndex: undefined, // Pas d'image principale par défaut
      colors: [],
      technicalSpecs: {},
      technicalDocUrl: null,
      videoUrl: null,
      isAvailable: true,
      // Champs SEO
      seo_title: '',
      seo_description: '',
      seo_keywords: ''
    };
    if (initialData) {
      return {
        ...defaults,
        name: initialData.name,
        reference: initialData.reference,
        category: initialData.category, // Garder les slugs initiaux
        subCategory: initialData.subCategory,
        subSubCategory: initialData.subSubCategory,
        description: initialData.description,
        priceHT: initialData.priceHT,
        priceTTC: initialData.priceTTC,
        stock: initialData.stock,
        images: initialData.images || [],
        mainImageIndex: initialData.mainImageIndex,
        colors: initialData.colors || [],
        technicalSpecs: initialData.technicalSpecs || {},
        technicalDocUrl: initialData.technicalDocUrl || null,
        videoUrl: initialData.videoUrl || null,
        isAvailable: initialData.isAvailable ?? true,
        // Champs SEO - Assurez-vous d'utiliser les bonnes propriétés
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || '',
      };
    }
    return defaults;
  });

  // --- Nouveaux états pour les catégories dynamiques ---
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // --- Nouveaux états pour suivre les objets sélectionnés ---
  const [selectedDbCategory, setSelectedDbCategory] = useState<Category | null>(null);
  const [selectedDbSubCategory, setSelectedDbSubCategory] = useState<Subcategory | null>(null);
  // (Pas besoin pour subSubCategory car il n'a pas d'enfants)

  // --- État pour gérer l'initialisation asynchrone ---
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Charger les catégories depuis la DB ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const data = await getAllCategories();
        setDbCategories(data);
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
        setCategoriesError("Impossible de charger les catégories.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- Initialiser les sélections après le chargement des catégories ---
  useEffect(() => {
    if (categoriesLoading || dbCategories.length === 0 || isInitialized) {
      return; // Attendre la fin du chargement et s'assurer qu'on ne le fait qu'une fois
    }

    let initialCategory: Category | null = null;
    let initialSubCategory: Subcategory | null = null;
    let initialSubSubCategorySlug: string | null = null;

    if (initialData?.category) {
      // Mode édition : trouver les objets correspondants
      initialCategory = dbCategories.find(cat => cat.slug === initialData.category) || null;
      if (initialCategory && initialData.subCategory) {
        initialSubCategory = initialCategory.subcategories?.find(sub => sub.slug === initialData.subCategory) || null;
        if (initialSubCategory && initialData.subSubCategory) {
           initialSubSubCategorySlug = initialSubCategory.subsubcategories?.find(ssub => ssub.slug === initialData.subSubCategory)?.slug || null;
        }
      }
    } else {
      // Mode création : prendre la première catégorie comme défaut
      initialCategory = dbCategories[0] || null;
      if (initialCategory) {
        initialSubCategory = initialCategory.subcategories?.[0] || null;
        if (initialSubCategory) {
          initialSubSubCategorySlug = initialSubCategory.subsubcategories?.[0]?.slug || null;
        }
      }
    }

    // Mettre à jour les états des objets sélectionnés
    setSelectedDbCategory(initialCategory);
    setSelectedDbSubCategory(initialSubCategory);

    // Mettre à jour formData avec les slugs par défaut/initiaux trouvés
    setFormData(prev => ({
      ...prev,
      category: initialCategory?.slug || '',
      subCategory: initialSubCategory?.slug || '',
      subSubCategory: initialSubSubCategorySlug || '',
    }));

    setIsInitialized(true); // Marquer comme initialisé

  }, [categoriesLoading, dbCategories, initialData, isInitialized]);


  // (Le reste des états comme uploading, error, descriptionLength, etc., reste inchangé)
  // (useEffect pour calculer le prix TTC reste inchangé)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'description') {
      setDescriptionLength(value.length);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategorySlug = e.target.value;
    const newCategory = dbCategories.find(cat => cat.slug === newCategorySlug) || null;

    setSelectedDbCategory(newCategory);
    const firstSubCategory = newCategory?.subcategories?.[0] || null;
    setSelectedDbSubCategory(firstSubCategory); // Réinitialiser la sous-catégorie sélectionnée
    const firstSubSubCategorySlug = firstSubCategory?.subsubcategories?.[0]?.slug || '';


    setFormData(prev => ({
      ...prev,
      category: newCategorySlug,
      subCategory: firstSubCategory?.slug || '', // Prend le slug de la première sous-catégorie
      subSubCategory: firstSubSubCategorySlug, // Prend le slug de la première sous-sous-catégorie
    }));
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubCategorySlug = e.target.value;
    const newSubCategory = selectedDbCategory?.subcategories?.find(sub => sub.slug === newSubCategorySlug) || null;

    setSelectedDbSubCategory(newSubCategory);
    const firstSubSubCategorySlug = newSubCategory?.subsubcategories?.[0]?.slug || '';

    setFormData(prev => ({
      ...prev,
      subCategory: newSubCategorySlug,
      subSubCategory: firstSubSubCategorySlug, // Prend le slug de la première sous-sous-catégorie
    }));
  };

  const handleSubSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      subSubCategory: e.target.value,
    }));
  };

  // (Les fonctions validateFile, handleImageUpload, handleRemoveImage, etc., restent inchangées)
  // ... (gardez handleAddTechnicalSpec, handleRemoveTechnicalSpec, handleAddColor, handleRemoveColor)
  const handleAddTechnicalSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      technicalSpecs: {
        ...prev.technicalSpecs,
        [newSpecKey.trim()]: newSpecValue.trim()
      }
    }));
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveTechnicalSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.technicalSpecs };
      delete newSpecs[key];
      return { ...prev, technicalSpecs: newSpecs };
    });
  };

  const handleAddColor = () => {
    if (!newColor.trim()) return;
    if (!formData.colors || !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...(prev.colors || []), newColor.trim()]
      }));
    }
    setNewColor('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors?.filter(color => color !== colorToRemove) || []
    }));
  };

  const [descriptionLength, setDescriptionLength] = useState(formData.description.length);
  const MAX_DESCRIPTION_LENGTH = 2000;
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>(''); // Main form error
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('');
  
  // États pour la génération SEO
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  


  useEffect(() => {
    const priceTTC = formData.priceHT * 1.2;
    setFormData(prev => ({ ...prev, priceTTC }));
  }, [formData.priceHT]);


  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `${file.name} n'est pas un type d'image accepté. Utilisez JPG, PNG, WEBP ou GIF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} est trop volumineux. La taille maximum est de 5MB.`;
    }
    return null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadErrors([]);
    setUploading(true);

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      setUploading(false);
      return;
    }

    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          const url = await uploadProductImage(file);
          return url;
        } catch (err) {
          errors.push(`Erreur lors du téléchargement de ${file.name}`);
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      }
    } catch (err) {
      setUploadErrors(['Erreur lors du téléchargement des images']);
      console.error(err);
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => {
      // Si on supprime l'image principale, réinitialiser mainImageIndex
      let newMainImageIndex = prev.mainImageIndex;
      
      // Si l'image supprimée est l'image principale
      if (prev.mainImageIndex === indexToRemove) {
        newMainImageIndex = undefined;
      } 
      // Si l'image supprimée est avant l'image principale, décaler l'index
      else if (prev.mainImageIndex !== undefined && indexToRemove < prev.mainImageIndex) {
        newMainImageIndex = prev.mainImageIndex - 1;
      }
      
      return {
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
        mainImageIndex: newMainImageIndex
      };
    });
  };
  
  // Nouvelle fonction pour définir l'image principale
  const handleSetMainImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mainImageIndex: index
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous main errors

    // Basic validation
    if (!formData.name || !formData.reference || !formData.category || !formData.subCategory || !formData.subSubCategory) {
      setError('Veuillez remplir tous les champs obligatoires (Nom, Référence, Catégories)');
      return;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`);
      return;
    }

    if (formData.description.length < 20) {
      setError('La description doit contenir au moins 20 caractères');
      return;
    }

    if (formData.priceHT < 0) {
      setError('Le prix HT ne peut pas être négatif');
      return;
    }

    if (formData.stock < 0) {
      setError('Le stock ne peut pas être négatif');
      return;
    }


    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du produit');
      console.error(err);
    }
  };

  // --- JSX ---
  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-3">Chargement des catégories...</span>
      </div>
    );
  }

  if (categoriesError) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-md">{categoriesError}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 transition-all duration-300">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border-l-4 border-red-500 shadow-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Section Informations de base */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Informations de base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Nom */}
          <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Entrez le nom du produit"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200"
            />
          </div>

          {/* Input Référence */}
          <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              required
              placeholder="Entrez la référence du produit"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>


      {/* Section Catégories */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Catégorisation du produit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200 appearance-none pr-10"
                disabled={dbCategories.length === 0}
              >
                <option value="" disabled>Sélectionnez...</option>
                {dbCategories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
            <div className="relative">
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleSubCategoryChange}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200 appearance-none pr-10"
                disabled={!selectedDbCategory || !selectedDbCategory.subcategories || selectedDbCategory.subcategories.length === 0}
              >
                <option value="" disabled>Sélectionnez...</option>
                {selectedDbCategory?.subcategories?.map(subCat => (
                  <option key={subCat.id} value={subCat.slug}>
                    {subCat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-sous-catégorie</label>
            <div className="relative">
              <select
                name="subSubCategory"
                value={formData.subSubCategory}
                onChange={handleSubSubCategoryChange}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200 appearance-none pr-10"
                disabled={!selectedDbSubCategory || !selectedDbSubCategory.subsubcategories || selectedDbSubCategory.subsubcategories.length === 0}
              >
                <option value="" disabled>Sélectionnez...</option>
                {selectedDbSubCategory?.subsubcategories?.map(subSubCat => (
                  <option key={subSubCat.id} value={subSubCat.slug}>
                    {subSubCat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Description */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Description du produit
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Contenu détaillé</span>
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${descriptionLength > MAX_DESCRIPTION_LENGTH ? 'bg-red-100 text-red-600' : descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH} caractères
            </div>
          </div>
          <div className="relative transition-all duration-200 hover:shadow-md rounded-lg">
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => {
                handleChange(e);
                setDescriptionLength(e.target.value.length);
              }}
              onKeyDown={(e) => { /* ... (indentation logic) ... */ }}
              required
              placeholder="Décrivez le produit en détail..."
              className={`block w-full rounded-lg shadow-sm min-h-[180px] p-4 resize-y transition-colors duration-200 ${descriptionLength > MAX_DESCRIPTION_LENGTH ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-violet-500 focus:ring-violet-500'} placeholder:text-gray-400 placeholder:text-sm`}
            />
            {descriptionLength > MAX_DESCRIPTION_LENGTH && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border-l-2 border-red-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                La description dépasse {MAX_DESCRIPTION_LENGTH} caractères
              </div>
            )}
          </div>
          {/* Intégration du générateur de description avec style amélioré */}
          <div className="mt-2">
            <ProductDescriptionGenerator 
              productData={formData} 
              onDescriptionGenerated={(description) => {
                setFormData(prev => ({
                  ...prev,
                  description
                }));
                setDescriptionLength(description.length);
              }}
            />
          </div>
        </div>
      </div>

      {/* Section SEO */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
          </svg>
          Optimisation SEO
          <span className="ml-2 text-sm font-normal text-gray-500">(Search Engine Optimization)</span>
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SEO Title */}
            <div className="bg-white p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre SEO
                <span className="ml-2 text-xs font-normal text-violet-600">Important</span>
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title || ''}
                onChange={handleChange}
                placeholder="Titre optimisé pour les moteurs de recherche"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 hover:border-violet-300"
                maxLength={60}
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Recommandé: 50-60 caractères</p>
                <span className={`text-xs font-medium ${(formData.seo_title?.length || 0) > 60 ? 'text-red-500' : 'text-green-500'}`}>
                  {formData.seo_title?.length || 0}/60
                </span>
              </div>
            </div>

            {/* SEO Keywords */}
            <div className="bg-white p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mots-clés SEO
                <span className="ml-2 text-xs font-normal text-violet-600">3-5 recommandés</span>
              </label>
              <input
                type="text"
                name="seo_keywords"
                value={formData.seo_keywords || ''}
                onChange={handleChange}
                placeholder="mot-clé1, mot-clé2, mot-clé3"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 hover:border-violet-300"
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Séparez les mots-clés par des virgules</p>
                <span className="text-xs text-gray-500">
                  {(formData.seo_keywords?.split(',').filter(k => k.trim()) || []).length} mots-clés
                </span>
              </div>
            </div>
          </div>

          {/* SEO Description */}
          <div className="bg-white p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description SEO
              <span className="ml-2 text-xs font-normal text-violet-600">Meta description</span>
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description || ''}
              onChange={handleChange}
              placeholder="Description courte et optimisée pour les moteurs de recherche"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-all duration-300 hover:border-violet-300 min-h-[100px] resize-y"
              maxLength={160}
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">Recommandé: 150-160 caractères</p>
              <span className={`text-xs font-medium ${(formData.seo_description?.length || 0) > 160 ? 'text-red-500' : 'text-green-500'}`}>
                {formData.seo_description?.length || 0}/160
              </span>
            </div>
          </div>

          {/* SEO Generation Button */}
          <div className="flex items-center justify-between mt-6 bg-violet-50 p-4 rounded-xl">
            <div className="flex-1 mr-4">
              <h3 className="text-sm font-medium text-violet-900">Génération automatique</h3>
              <p className="text-xs text-violet-600">Utilise l'IA pour optimiser votre contenu SEO</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (isGeneratingSeo) return;
                
                setIsGeneratingSeo(true);
                setSeoError(null);
                
                try {
                  const categoryObj = selectedDbCategory;
                  const subCategoryObj = selectedDbSubCategory;
                  
                  const options: ProductSeoGenerationOptions = {
                    language: 'fr',
                    targetLength: 'medium',
                    includeCompetitors: false,
                    focusKeywords: [
                      formData.name,
                      categoryObj?.name || '',
                      subCategoryObj?.name || '',
                      'location',
                      'événementiel'
                    ].filter(k => k.trim() !== '')
                  };
                  
                  if (formData.colors && formData.colors.length > 0) {
                    options.targetAudience = `Organisateurs d'événements recherchant des produits en ${formData.colors.join(', ')}`;
                  } else {
                    options.targetAudience = "Organisateurs d'événements professionnels et particuliers";
                  }
                  
                  if (categoryObj) {
                    options.eventType = `${categoryObj.name}${subCategoryObj ? ` - ${subCategoryObj.name}` : ''}`;
                  }
                  
                  const result = await generateProductSeo(
                    formData, 
                    { 
                      category: categoryObj || undefined,
                      subCategory: subCategoryObj || undefined 
                    },
                    options
                  );
                  
                  if (result.error) {
                    setSeoError(result.error);
                  } else if (result.seoContent) {
                    setFormData(prev => ({
                      ...prev,
                      seo_title: result.seoContent?.seo_title || '',
                      seo_description: result.seoContent?.seo_description || '',
                      seo_keywords: result.seoContent?.seo_keywords || ''
                    }));
                  }
                } catch (err: any) {
                  setSeoError(err.message || 'Une erreur est survenue lors de la génération du contenu SEO');
                  console.error('Erreur lors de la génération du contenu SEO:', err);
                } finally {
                  setIsGeneratingSeo(false);
                }
              }}
              disabled={isGeneratingSeo}
              className={`
                inline-flex items-center px-6 py-3 rounded-lg font-medium text-white
                ${isGeneratingSeo 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'}
                transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0
                shadow-md hover:shadow-lg
              `}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isGeneratingSeo ? 'Génération en cours...' : 'Générer le contenu SEO'}
            </button>
          </div>

          {seoError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{seoError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Section Prix et Stock */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Prix et disponibilité
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prix HT */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix HT</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input 
                  type="number" 
                  name="priceHT" 
                  value={formData.priceHT} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  className="block w-full pl-7 pr-12 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">HT</span>
                </div>
              </div>
            </div>
            
            {/* Prix TTC */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix TTC</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input 
                  type="number" 
                  value={formData.priceTTC.toFixed(2)} 
                  disabled 
                  className="block w-full pl-7 pr-12 rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">TTC</span>
                </div>
              </div>
            </div>
            
            {/* Stock */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
              <div className="relative rounded-md shadow-sm">
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  placeholder="Quantité en stock"
                  className="block w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">unités</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Disponibilité */}
          <div className="mt-4 p-2 transition-all duration-200 hover:shadow-md rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isAvailable"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={e => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 transition-colors duration-200"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 flex items-center">
                <span>Produit disponible à la vente</span>
                {formData.isAvailable ? (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Disponible
                  </span>
                ) : (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Indisponible
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Section Images */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Images du produit
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Galerie d'images</span>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${formData.images.length >= 10 ? 'bg-red-100 text-red-600' : formData.images.length > 7 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                {formData.images.length} / 10 images
              </span>
            </div>
            
            <div className="flex items-center justify-center px-6 py-8 border-2 border-violet-300 border-dashed rounded-lg bg-violet-50 transition-all duration-300 hover:bg-violet-100 hover:border-violet-400 group">
              <div className="space-y-3 text-center">
                <svg
                  className="mx-auto h-14 w-14 text-violet-400 group-hover:text-violet-500 transition-colors duration-300"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer px-4 py-2 bg-violet-600 text-white rounded-md font-medium hover:bg-violet-700 transition-colors duration-200 mb-2"
                  >
                    <span>Télécharger des images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      onChange={handleImageUpload}
                      className="sr-only"
                      disabled={uploading || formData.images.length >= 10}
                    />
                  </label>
                  <p className="text-gray-500">ou glisser-déposer les fichiers ici</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Formats acceptés: PNG, JPG, WEBP ou GIF • Taille max: 5MB • 10 images max
                  </p>
                </div>
              </div>
              
            </div>
          </div>

          {uploadErrors.length > 0 && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-red-700">Erreurs de téléchargement:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {uploadErrors.map((err, index) => (
                  <li key={index} className="text-sm text-red-600">{err}</li>
                ))}
              </ul>
            </div>
          )}
          {uploading && (
            <div className="mt-4 flex items-center justify-center p-4 bg-violet-50 rounded-md">
              <svg className="animate-spin h-5 w-5 text-violet-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium text-violet-700">Téléchargement des images en cours...</p>
            </div>
          )}

          {/* Image Previews */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Aperçu des images
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 transition-all duration-300">
              {formData.images.length > 0 ? (
                formData.images.map((url, index) => (
                  <ImagePreview 
                    key={index} 
                    url={url} 
                    onRemove={() => handleRemoveImage(index)}
                    isMain={formData.mainImageIndex === index}
                    onSetAsMain={() => handleSetMainImage(index)}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 transition-all duration-300 hover:bg-gray-100">
                  <img
                    src={DEFAULT_PRODUCT_IMAGE}
                    alt="Image par défaut"
                    className="w-32 h-32 mb-3 opacity-70"
                  />
                  <p className="text-sm text-gray-500 text-center">Aucune image téléchargée.<br/>Une image par défaut sera utilisée.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Information sur l'image principale */}
          {formData.images.length > 0 && formData.mainImageIndex === undefined && (
            <div className="mt-4 flex items-center p-4 bg-amber-50 border-l-4 border-amber-500 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-700">
                <span className="font-medium">Conseil :</span> Sélectionnez une image principale en cliquant sur l'icône d'étoile. Cette image sera affichée en premier dans les listes de produits.
              </p>
            </div>
          )}
          {formData.images.length > 0 && formData.mainImageIndex !== undefined && (
            <div className="mt-4 flex items-center p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700">
                <span className="font-medium">Image principale définie !</span> Vous pouvez la changer à tout moment en cliquant sur l'icône d'étoile d'une autre image.
              </p>
            </div>
          )}
        </div>


        {/* Section Couleurs */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            Couleurs et options
          </h2>
          
          <div className="space-y-6">
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-4 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                Couleurs disponibles
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Ajouter une couleur (ex: Rouge, Bleu, Noir...)"
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200"
                />
                <button 
                  type="button" 
                  onClick={handleAddColor} 
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter
                </button>
              </div>
              
              {formData.colors && formData.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <div key={color} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-violet-200">
                      <span className="font-medium text-gray-700">{color}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveColor(color)} 
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200 ml-1"
                        title="Supprimer cette couleur"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                  Aucune couleur ajoutée. Si le produit est disponible en plusieurs couleurs, ajoutez-les ici.
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Section Informations Techniques */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Informations Techniques
          </h2>
          
          {/* Specs */}
          <div className="space-y-6">
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-4 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                Spécifications Techniques
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="relative rounded-md shadow-sm">
                  <input 
                    type="text" 
                    value={newSpecKey} 
                    onChange={(e) => setNewSpecKey(e.target.value)} 
                    placeholder="Caractéristique (ex: Dimensions)" 
                    className="block w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200 pr-10" 
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative rounded-md shadow-sm flex-1">
                    <input 
                      type="text" 
                      value={newSpecValue} 
                      onChange={(e) => setNewSpecValue(e.target.value)} 
                      placeholder="Valeur (ex: 80x60x40 cm)" 
                      className="block w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddTechnicalSpec} 
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter
                  </button>
                </div>
              </div>
              
              {Object.keys(formData.technicalSpecs).length > 0 ? (
                <div className="mt-3 space-y-2 border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {Object.entries(formData.technicalSpecs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{key}:</span>
                        <span className="ml-2 text-gray-600">{value}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTechnicalSpec(key)} 
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                        title="Supprimer cette spécification"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                  Aucune spécification technique ajoutée. Ajoutez des caractéristiques pour décrire votre produit en détail.
                </div>
              )}
            </div>
            
            {/* Doc URL */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-4 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Documentation Technique (PDF)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="url" 
                  name="technicalDocUrl" 
                  value={formData.technicalDocUrl || ''} 
                  onChange={handleChange} 
                  placeholder="https://example.com/documentation.pdf" 
                  className="block w-full pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200" 
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Lien vers un document PDF contenant les spécifications techniques détaillées du produit.</p>
            </div>
            
            {/* Video URL */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-4 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Vidéo de Présentation
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <input 
                  type="url" 
                  name="videoUrl" 
                  value={formData.videoUrl || ''} 
                  onChange={handleChange} 
                  placeholder="https://youtube.com/watch?v=..." 
                  className="block w-full pl-10 rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors duration-200" 
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Lien vers une vidéo YouTube ou Vimeo présentant le produit en action.</p>
            </div>
          </div>
        </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="submit"
          disabled={isLoading || uploading || categoriesLoading}
          className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium shadow-md hover:bg-violet-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement en cours...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Enregistrer le produit
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

// --- Composant ImagePreview (modifié pour gérer l'image principale) ---
const ImagePreview = ({ 
  url, 
  onRemove, 
  isMain, 
  onSetAsMain 
}: { 
  url: string; 
  onRemove: () => void; 
  isMain?: boolean; 
  onSetAsMain?: () => void 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative group ${isMain ? 'ring-2 ring-black' : ''}`}>
      {isMain && (
        <div className="absolute top-0 right-0 z-10 bg-black text-white text-xs px-2 py-1 rounded-bl-md">
          Principale
        </div>
      )}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
        {!error ? (
          <img
            src={url}
            alt="Product preview"
            className={`object-cover object-center w-full h-full transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
          />
        ) : (
          <img
            src={DEFAULT_PRODUCT_IMAGE}
            alt="Image par défaut"
            className="object-cover object-center w-full h-full"
          />
        )}
        {loading && ( <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div> )}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!isMain && onSetAsMain && (
            <button 
              type="button" 
              onClick={onSetAsMain} 
              className="text-white p-2 hover:text-yellow-400" 
              title="Définir comme image principale"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
          <button 
            type="button" 
            onClick={onRemove} 
            className="text-white p-2 hover:text-red-500" 
            title="Supprimer l'image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


export default ProductForm;