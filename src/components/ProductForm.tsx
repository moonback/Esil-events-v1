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
      isAvailable: true
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
  const MAX_DESCRIPTION_LENGTH = 1500;
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>(''); // Main form error
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('');

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

    // ... (autres validations existantes) ...
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Input Nom */}
       <div>
          <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          />
        </div>

        {/* Input Référence */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Référence</label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          />
        </div>


      {/* --- Selects mis à jour --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            disabled={dbCategories.length === 0} // Désactiver si pas de catégories
          >
            <option value="" disabled>Sélectionnez...</option>
            {dbCategories.map(category => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sous-catégorie</label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleSubCategoryChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            disabled={!selectedDbCategory || !selectedDbCategory.subcategories || selectedDbCategory.subcategories.length === 0}
          >
            <option value="" disabled>Sélectionnez...</option>
            {selectedDbCategory?.subcategories?.map(subCat => (
              <option key={subCat.id} value={subCat.slug}>
                {subCat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sous-sous-catégorie</label>
          <select
            name="subSubCategory"
            value={formData.subSubCategory}
            onChange={handleSubSubCategoryChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            disabled={!selectedDbSubCategory || !selectedDbSubCategory.subsubcategories || selectedDbSubCategory.subsubcategories.length === 0}
          >
            <option value="" disabled>Sélectionnez...</option>
            {selectedDbSubCategory?.subsubcategories?.map(subSubCat => (
              <option key={subSubCat.id} value={subSubCat.slug}>
                {subSubCat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ... (le reste du formulaire : description, prix, stock, images, etc. reste majoritairement inchangé) ... */}
       {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Description du produit</label>
            <span className={`text-sm ${descriptionLength > MAX_DESCRIPTION_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH} caractères
            </span>
          </div>
          <div className="relative">
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
              className={`mt-1 block w-full rounded-md shadow-sm min-h-[150px] p-3 resize-y ${descriptionLength > MAX_DESCRIPTION_LENGTH ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} placeholder:text-gray-400 placeholder:text-sm`}
            />
            {descriptionLength > MAX_DESCRIPTION_LENGTH && ( <p className="mt-1 text-sm text-red-600">La description dépasse {MAX_DESCRIPTION_LENGTH} caractères</p> )}
            {/* <div className="absolute bottom-3 right-3 text-gray-400 text-sm">Appuyez sur Tab pour indenter</div> */}
          </div>
          {/* Intégration du générateur de description */}
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
          {/* <p className="text-sm text-gray-500 mt-1">Conseil : Incluez dimensions, matériaux, etc.</p> */}
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix HT</label>
            <input type="number" name="priceHT" value={formData.priceHT} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix TTC</label>
            <input type="number" value={formData.priceTTC.toFixed(2)} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50" />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
        </div>

        {/* Images Upload */}
        {/* ... (gardez la section d'upload d'images telle quelle) ... */}
         <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Images du produit</label>
            <span className="text-sm text-gray-500">
              {formData.images.length} / 10 images
            </span>
          </div>
          
          <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {/* ... SVG Icon ... */}
               <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700"
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
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP ou GIF jusqu'à 5MB
              </p>
            </div>
          </div>

          {uploadErrors.length > 0 && (
            <div className="mt-2">
              {uploadErrors.map((err, index) => ( <p key={index} className="text-sm text-red-600">{err}</p> ))}
            </div>
          )}
          {uploading && ( <div className="mt-2"><p className="text-sm text-gray-500">Téléchargement...</p></div> )}

          {/* Image Previews */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
              <div className="col-span-full flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg">
                <img
                  src={DEFAULT_PRODUCT_IMAGE}
                  alt="Image par défaut"
                  className="w-32 h-32 mb-2"
                />
                <p className="text-sm text-gray-500">Aucune image téléchargée. Une image par défaut sera utilisée.</p>
              </div>
            )}
          </div>
          
          {/* Information sur l'image principale */}
          {formData.images.length > 0 && formData.mainImageIndex === undefined && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              Conseil : Sélectionnez une image principale en cliquant sur l'icône d'étoile.
            </div>
          )}
        </div>


        {/* Disponibilité */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={e => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Produit disponible
          </label>
        </div>

        {/* Couleurs */}
        {/* ... (gardez la section couleurs telle quelle) ... */}
         <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Couleurs disponibles</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Ajouter une couleur"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
            <button type="button" onClick={handleAddColor} className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">Ajouter</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.colors?.map((color) => (
              <div key={color} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
                <span>{color}</span>
                <button type="button" onClick={() => handleRemoveColor(color)} className="text-red-600 hover:text-red-800">×</button>
              </div>
            ))}
          </div>
        </div>


        {/* Infos Techniques */}
        {/* ... (gardez la section infos techniques telle quelle) ... */}
         <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Techniques</h3>
          {/* Specs */}
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-gray-700">Spécifications Techniques</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Caractéristique (ex: Dimensions)" className="rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
              <div className="flex gap-2">
                <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Valeur (ex: 80x60x40 cm)" className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
                <button type="button" onClick={handleAddTechnicalSpec} className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">Ajouter</button>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Object.entries(formData.technicalSpecs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div><span className="font-medium">{key}:</span><span className="ml-2">{value}</span></div>
                  <button type="button" onClick={() => handleRemoveTechnicalSpec(key)} className="text-red-600 hover:text-red-800">Supprimer</button>
                </div>
              ))}
            </div>
          </div>
          {/* Doc URL */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700">URL Documentation Technique (PDF)</label>
            <input type="url" name="technicalDocUrl" value={formData.technicalDocUrl || ''} onChange={handleChange} placeholder="https://example.com/doc.pdf" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
            {/* <p className="text-sm text-gray-500">Lien vers la documentation technique.</p> */}
          </div>
          {/* Video URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">URL Vidéo de Présentation</label>
            <input type="url" name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black" />
            {/* <p className="text-sm text-gray-500">Lien vers une vidéo de démonstration.</p> */}
          </div>
        </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={isLoading || uploading || categoriesLoading} // Désactiver aussi pendant le chargement des catégories
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {/* ... (gestion de l'affichage du chargement) ... */}
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /* ... */ ></svg>
              Enregistrement...
            </span>
          ) : 'Enregistrer'}
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
