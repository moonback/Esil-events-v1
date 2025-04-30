import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import SeoContentGenerator from '../../components/SeoContentGenerator';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  createSubSubcategory,
  updateSubSubcategory,
  deleteSubSubcategory,
  Category,
  Subcategory,
  SubSubcategory
} from '../../services/categoryService';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'category' | 'subcategory' | 'subsubcategory' | null>(null);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'seo'>('add');
  const [modalName, setModalName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalSeoTitle, setModalSeoTitle] = useState('');
  const [modalSeoDescription, setModalSeoDescription] = useState('');
  const [modalSeoKeywords, setModalSeoKeywords] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    setModalType('category');
    setModalAction('add');
    setModalName('');
    setModalDescription('');
    setModalSeoTitle('');
    setModalSeoDescription('');
    setModalSeoKeywords('');
    setShowModal(true);
  };

  const handleCreateCategory = async () => {
    if (!modalName) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await createCategory({
        name: modalName,
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords,
        order_index: categories.length + 1
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la création de la catégorie');
      console.error(err);
    }
  };

  const handleEditCategory = async (category: Category) => {
    const name = prompt('Nouveau nom de la catégorie:', category.name);
    if (!name || name === category.name) return;

    const slug = name.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await updateCategory(category.id, { name, slug });
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la modification de la catégorie');
      console.error(err);
    }
  };

  const openCategorySeoModal = (category: Category) => {
    setModalType('category');
    setModalAction('seo');
    setSelectedItemId(category.id);
    setModalName(category.name);
    setModalDescription(category.description || '');
    setModalSeoTitle(category.seo_title || '');
    setModalSeoDescription(category.seo_description || '');
    setModalSeoKeywords(category.seo_keywords || '');
    setShowModal(true);
  };

  const openSubcategorySeoModal = (subcategory: Subcategory) => {
    setModalType('subcategory');
    setModalAction('seo');
    setSelectedItemId(subcategory.id);
    setModalName(subcategory.name);
    setModalDescription(subcategory.description || '');
    setModalSeoTitle(subcategory.seo_title || '');
    setModalSeoDescription(subcategory.seo_description || '');
    setModalSeoKeywords(subcategory.seo_keywords || '');
    setShowModal(true);
  };

  const openSubSubcategorySeoModal = (subsubcategory: SubSubcategory) => {
    setModalType('subsubcategory');
    setModalAction('seo');
    setSelectedItemId(subsubcategory.id);
    setModalName(subsubcategory.name);
    setModalDescription(subsubcategory.description || '');
    setModalSeoTitle(subsubcategory.seo_title || '');
    setModalSeoDescription(subsubcategory.seo_description || '');
    setModalSeoKeywords(subsubcategory.seo_keywords || '');
    setShowModal(true);
  };
  const handleUpdateCategory = async () => {
    if (!modalName) {
      setError('Le nom de la catégorie est requis');
      return;
    }
  
    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  
    try {
      await updateCategory(selectedItemId, { 
        name: modalName, 
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la modification de la catégorie');
      console.error(err);
    }
  };
  const handleSaveSeoChanges = async () => {
    try {
      const seoData = {
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords
      };

      if (modalType === 'category') {
        await updateCategory(selectedItemId, seoData);
      } else if (modalType === 'subcategory') {
        await updateSubcategory(selectedItemId, seoData);
      } else if (modalType === 'subsubcategory') {
        await updateSubSubcategory(selectedItemId, seoData);
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(`Erreur lors de la modification des informations SEO`);
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses sous-catégories ?')) {
      return;
    }

    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la suppression de la catégorie');
      console.error(err);
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    setModalType('subcategory');
    setModalAction('add');
    setModalName('');
    setModalDescription('');
    setModalSeoTitle('');
    setModalSeoDescription('');
    setModalSeoKeywords('');
    setSelectedParentId(categoryId);
    setShowModal(true);
  };

  const handleCreateSubcategory = async () => {
    if (!modalName) {
      setError('Le nom de la sous-catégorie est requis');
      return;
    }

    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await createSubcategory({
        category_id: selectedParentId,
        name: modalName,
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords,
        order_index: categories.find(c => c.id === selectedParentId)?.subcategories?.length || 0 + 1
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la création de la sous-catégorie');
      console.error(err);
    }
  };

  const handleEditSubcategory = async (subcategory: Subcategory) => {
    setModalType('subcategory');
    setModalAction('edit');
    setSelectedItemId(subcategory.id);
    setModalName(subcategory.name);
    setModalDescription(subcategory.description || '');
    setModalSeoTitle(subcategory.seo_title || '');
    setModalSeoDescription(subcategory.seo_description || '');
    setModalSeoKeywords(subcategory.seo_keywords || '');
    setShowModal(true);
  };

  const handleUpdateSubcategory = async () => {
    if (!modalName) {
      setError('Le nom de la sous-catégorie est requis');
      return;
    }

    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await updateSubcategory(selectedItemId, { 
        name: modalName, 
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la modification de la sous-catégorie');
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
      return;
    }

    try {
      await deleteSubcategory(id);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la suppression de la sous-catégorie');
      console.error(err);
    }
  };

  const handleAddSubSubcategory = async (subcategoryId: string) => {
    setModalType('subsubcategory');
    setModalAction('add');
    setModalName('');
    setModalDescription('');
    setModalSeoTitle('');
    setModalSeoDescription('');
    setModalSeoKeywords('');
    setSelectedParentId(subcategoryId);
    setShowModal(true);
  };

  const handleCreateSubSubcategory = async () => {
    if (!modalName) {
      setError('Le nom de la sous-sous-catégorie est requis');
      return;
    }

    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await createSubSubcategory({
        subcategory_id: selectedParentId,
        name: modalName,
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords,
        order_index: 1
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la création de la sous-sous-catégorie');
      console.error(err);
    }
  };

  const handleEditSubSubcategory = async (subsubcategory: SubSubcategory) => {
    setModalType('subsubcategory');
    setModalAction('edit');
    setSelectedItemId(subsubcategory.id);
    setModalName(subsubcategory.name);
    setModalDescription(subsubcategory.description || '');
    setModalSeoTitle(subsubcategory.seo_title || '');
    setModalSeoDescription(subsubcategory.seo_description || '');
    setModalSeoKeywords(subsubcategory.seo_keywords || '');
    setShowModal(true);
  };

  const handleUpdateSubSubcategory = async () => {
    if (!modalName) {
      setError('Le nom de la sous-sous-catégorie est requis');
      return;
    }

    const slug = modalName.toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      await updateSubSubcategory(selectedItemId, { 
        name: modalName, 
        slug,
        description: modalDescription,
        seo_title: modalSeoTitle,
        seo_description: modalSeoDescription,
        seo_keywords: modalSeoKeywords
      });
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la modification de la sous-sous-catégorie');
      console.error(err);
    }
  };

  const handleDeleteSubSubcategory = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-sous-catégorie ?')) {
      return;
    }

    try {
      await deleteSubSubcategory(id);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la suppression de la sous-sous-catégorie');
      console.error(err);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(subcategoryId)) {
        next.delete(subcategoryId);
      } else {
        next.add(subcategoryId);
      }
      return next;
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (category.seo_title && category.seo_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (category.seo_description && category.seo_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (category.seo_keywords && category.seo_keywords.toLowerCase().includes(searchTerm.toLowerCase())) ||
    category.subcategories?.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.seo_title && sub.seo_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.seo_description && sub.seo_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.seo_keywords && sub.seo_keywords.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sub.subsubcategories?.some(subsub =>
        subsub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subsub.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subsub.description && subsub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subsub.seo_title && subsub.seo_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subsub.seo_description && subsub.seo_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subsub.seo_keywords && subsub.seo_keywords.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Main content */}
      <AdminHeader />
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-12">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des catégories</h1>
              <p className="mt-2 text-sm text-gray-500">Gérez vos catégories, sous-catégories et sous-sous-catégories</p>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex items-center px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle catégorie
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-gray-700"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredCategories.map((category) => (
              <div key={category.id} className="group p-5 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group-hover:bg-white"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-gray-900">{category.name}</span>
                        <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {category.slug}
                        </span>
                        {category.description && (
                          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Description
                          </span>
                        )}
                        {(category.seo_title || category.seo_description || category.seo_keywords) && (
                          <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            SEO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                      title="Ajouter une sous-catégorie"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                      title="Modifier la catégorie"
                    >
                      <Edit className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => openCategorySeoModal(category)}
                      className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                      title="Modifier la description et le SEO"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {expandedCategories.has(category.id) && category.subcategories && (
                  <div className="mt-4 ml-8 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => toggleSubcategory(subcategory.id)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200"
                            >
                              {expandedSubcategories.has(subcategory.id) ? (
                                <ChevronUp className="w-4.5 h-4.5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4.5 h-4.5 text-gray-600" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="text-gray-900 font-medium">{subcategory.name}</span>
                                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                  {subcategory.slug}
                                </span>
                                {subcategory.description && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    Description
                                  </span>
                                )}
                                {(subcategory.seo_title || subcategory.seo_description || subcategory.seo_keywords) && (
                                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    SEO
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddSubSubcategory(subcategory.id)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                              title="Ajouter une sous-sous-catégorie"
                            >
                              <Plus className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleEditSubcategory(subcategory)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                              title="Modifier la sous-catégorie"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => openSubcategorySeoModal(subcategory)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                              title="Modifier la description et le SEO"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700"
                              title="Supprimer la sous-catégorie"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                        {expandedSubcategories.has(subcategory.id) && subcategory.subsubcategories && (
                          <div className="ml-8 space-y-2">
                            {subcategory.subsubcategories.map((subsubcategory) => (
                              <div
                                key={subsubcategory.id}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <div className="flex items-center flex-wrap gap-1">
                                      <span className="text-gray-900">{subsubcategory.name}</span>
                                      <span className="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                        {subsubcategory.slug}
                                      </span>
                                      {subsubcategory.description && (
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                          Description
                                        </span>
                                      )}
                                      {(subsubcategory.seo_title || subsubcategory.seo_description || subsubcategory.seo_keywords) && (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                          SEO
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditSubSubcategory(subsubcategory)}
                                    className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                                    title="Modifier la sous-sous-catégorie"
                                  >
                                    <Edit className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => openSubSubcategorySeoModal(subsubcategory)}
                                    className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
                                    title="Modifier la description et le SEO"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubSubcategory(subsubcategory.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700"
                                    title="Supprimer la sous-sous-catégorie"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal pour éditer la description et les champs SEO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalAction === 'seo' && 'Modifier la description et le SEO'}
                  {modalAction === 'add' && modalType === 'category' && 'Ajouter une catégorie'}
                  {modalAction === 'add' && modalType === 'subcategory' && 'Ajouter une sous-catégorie'}
                  {modalAction === 'add' && modalType === 'subsubcategory' && 'Ajouter une sous-sous-catégorie'}
                  {modalAction === 'edit' && modalType === 'category' && 'Modifier la catégorie'}
                  {modalAction === 'edit' && modalType === 'subcategory' && 'Modifier la sous-catégorie'}
                  {modalAction === 'edit' && modalType === 'subsubcategory' && 'Modifier la sous-sous-catégorie'}
                  {modalAction !== 'add' && ` - ${modalName}`}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {modalAction !== 'seo' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Nom de la catégorie"
                  />
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Description de la catégorie"
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Optimisation SEO</h4>
                  <SeoContentGenerator
                    item={{
                      id: selectedItemId,
                      name: modalName,
                      slug: modalName.toLowerCase()
                        .replace(/[éèêë]/g, 'e')
                        .replace(/[àâä]/g, 'a')
                        .replace(/[ùûü]/g, 'u')
                        .replace(/[ôö]/g, 'o')
                        .replace(/[îï]/g, 'i')
                        .replace(/[ç]/g, 'c')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
                      description: modalDescription
                    }}
                    itemType={modalType || 'category'}
                    onContentGenerated={(seoContent) => {
                      setModalSeoTitle(seoContent.seo_title);
                      setModalSeoDescription(seoContent.seo_description);
                      setModalSeoKeywords(seoContent.seo_keywords);
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre SEO
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  value={modalSeoTitle}
                  onChange={(e) => setModalSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Titre optimisé pour les moteurs de recherche"
                />
                <div className="text-xs text-gray-500 mt-1">60-70 caractères recommandés</div>
              </div>

              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description SEO
                </label>
                <textarea
                  id="seoDescription"
                  rows={3}
                  value={modalSeoDescription}
                  onChange={(e) => setModalSeoDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Description optimisée pour les moteurs de recherche"
                />
                <div className="text-xs text-gray-500 mt-1">150-160 caractères recommandés</div>
              </div>

              <div>
                <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Mots-clés SEO
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  value={modalSeoKeywords}
                  onChange={(e) => setModalSeoKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Mots-clés séparés par des virgules"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Annuler
              </button>
              {modalAction === 'seo' && (
                <button
                  onClick={handleSaveSeoChanges}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Enregistrer
                </button>
              )}
              {modalAction === 'add' && (
                <button
                  onClick={
                    modalType === 'category' 
                      ? handleCreateCategory 
                      : modalType === 'subcategory'
                      ? handleCreateSubcategory
                      : handleCreateSubSubcategory
                  }
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Créer
                </button>
              )}
              {modalAction === 'edit' && (
                <button
                  onClick={
                    modalType === 'category'
                      ? handleUpdateCategory
                      : modalType === 'subcategory'
                      ? handleUpdateSubcategory
                      : handleUpdateSubSubcategory
                  }
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Mettre à jour
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
