import { supabase } from './supabaseClient';
import { PackageTemplate, PackageTemplateItem, PackageTemplateWithItems, PackageTemplateFormData, PackageTemplateItemFormData } from '../types/PackageTemplate';
import { generateSlug, generateUniqueSlug } from '../utils/slugUtils';

// Récupérer tous les modèles de packages
export const getAllPackageTemplates = async (): Promise<PackageTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('package_templates')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching package templates:', error);
    throw error;
  }
};

// Récupérer un modèle de package par son ID avec ses éléments
export const getPackageTemplateById = async (id: string): Promise<PackageTemplateWithItems | null> => {
  try {
    // Récupérer le modèle de package
    const { data: templateData, error: templateError } = await supabase
      .from('package_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) throw templateError;
    if (!templateData) return null;

    // Récupérer les éléments du modèle de package
    const { data: itemsData, error: itemsError } = await supabase
      .from('package_template_items')
      .select('*')
      .eq('package_template_id', id);

    if (itemsError) throw itemsError;

    // Convertir les dates
    const template: PackageTemplate = {
      ...templateData,
      created_at: new Date(templateData.created_at),
      updated_at: new Date(templateData.updated_at)
    };

    // Retourner le modèle avec ses éléments
    return {
      ...template,
      items: itemsData || []
    };
  } catch (error) {
    console.error(`Error fetching package template with ID ${id}:`, error);
    throw error;
  }
};

// Récupérer un modèle de package par son slug avec ses éléments
export const getPackageTemplateBySlug = async (slug: string): Promise<PackageTemplateWithItems | null> => {
  try {
    // Récupérer le modèle de package
    const { data: templateData, error: templateError } = await supabase
      .from('package_templates')
      .select('*')
      .eq('slug', slug)
      .single();

    if (templateError) throw templateError;
    if (!templateData) return null;

    // Récupérer les éléments du modèle de package
    const { data: itemsData, error: itemsError } = await supabase
      .from('package_template_items')
      .select('*')
      .eq('package_template_id', templateData.id);

    if (itemsError) throw itemsError;

    // Convertir les dates
    const template: PackageTemplate = {
      ...templateData,
      created_at: new Date(templateData.created_at),
      updated_at: new Date(templateData.updated_at)
    };

    // Retourner le modèle avec ses éléments
    return {
      ...template,
      items: itemsData || []
    };
  } catch (error) {
    console.error(`Error fetching package template with slug ${slug}:`, error);
    throw error;
  }
};

// Créer un nouveau modèle de package
export const createPackageTemplate = async (templateData: PackageTemplateFormData): Promise<PackageTemplate> => {
  try {
    // Générer un slug unique si non fourni
    if (!templateData.slug) {
      templateData.slug = await (templateData.name, 'package_templates', 'slug');
    }

    const { data, error } = await supabase
      .from('package_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create package template');

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating package template:', error);
    throw error;
  }
};

// Mettre à jour un modèle de package
export const updatePackageTemplate = async (id: string, templateData: Partial<PackageTemplateFormData>): Promise<PackageTemplate> => {
  try {
    const { data, error } = await supabase
      .from('package_templates')
      .update({
        ...templateData,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Package template with ID ${id} not found`);

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  } catch (error) {
    console.error(`Error updating package template with ID ${id}:`, error);
    throw error;
  }
};

// Supprimer un modèle de package
export const deletePackageTemplate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('package_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting package template with ID ${id}:`, error);
    throw error;
  }
};

// Ajouter un élément à un modèle de package
export const addPackageTemplateItem = async (itemData: PackageTemplateItemFormData): Promise<PackageTemplateItem> => {
  try {
    const { data, error } = await supabase
      .from('package_template_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add package template item');

    return data;
  } catch (error) {
    console.error('Error adding package template item:', error);
    throw error;
  }
};

// Mettre à jour un élément d'un modèle de package
export const updatePackageTemplateItem = async (id: string, itemData: Partial<PackageTemplateItemFormData>): Promise<PackageTemplateItem> => {
  try {
    const { data, error } = await supabase
      .from('package_template_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Package template item with ID ${id} not found`);

    return data;
  } catch (error) {
    console.error(`Error updating package template item with ID ${id}:`, error);
    throw error;
  }
};

// Supprimer un élément d'un modèle de package
export const deletePackageTemplateItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('package_template_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting package template item with ID ${id}:`, error);
    throw error;
  }
};

// Récupérer tous les éléments d'un modèle de package
export const getPackageTemplateItems = async (templateId: string): Promise<PackageTemplateItem[]> => {
  try {
    const { data, error } = await supabase
      .from('package_template_items')
      .select('*')
      .eq('package_template_id', templateId);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching items for package template with ID ${templateId}:`, error);
    throw error;
  }
};