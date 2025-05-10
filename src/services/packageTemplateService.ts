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
// Fonction pour vérifier si un slug existe déjà dans la table package_templates
const checkSlugExists = async (slug: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('package_templates')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) throw error;
    return !!data; // Retourne true si le slug existe, false sinon
  } catch (error) {
    console.error('Error checking slug existence:', error);
    return false; // En cas d'erreur, on suppose que le slug n'existe pas
  }
};

// Fonction pour générer un slug unique en vérifiant dans la base de données
const generateUniqueDbSlug = async (baseName: string): Promise<string> => {
  let slug = generateSlug(baseName);
  let counter = 1;
  let slugExists = await checkSlugExists(slug);
  
  // Tant que le slug existe, on en génère un nouveau avec un compteur
  while (slugExists) {
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
    slugExists = await checkSlugExists(slug);
  }
  
  return slug;
};

export const createPackageTemplate = async (templateData: PackageTemplateFormData): Promise<PackageTemplate> => {
  try {
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour créer un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour créer un modèle de package');
    }

    // Générer un slug unique si non fourni
    if (!templateData.slug) {
      templateData.slug = await generateUniqueDbSlug(templateData.name);
    }

    // Assurez-vous que les champs numériques sont correctement typés
    const dataToInsert = {
      ...templateData,
      base_price: templateData.base_price !== undefined ? Number(templateData.base_price) : null,
      order_index: Number(templateData.order_index || 0)
    };

    const { data, error } = await supabase
      .from('package_templates')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour créer un modèle de package. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
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
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour modifier un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour modifier un modèle de package');
    }
    
    const { data, error } = await supabase
      .from('package_templates')
      .update({
        ...templateData,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour modifier ce modèle de package. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
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
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour supprimer un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour supprimer un modèle de package');
    }
    
    const { error } = await supabase
      .from('package_templates')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour supprimer ce modèle de package. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting package template with ID ${id}:`, error);
    throw error;
  }
};

// Ajouter un élément à un modèle de package
export const addPackageTemplateItem = async (itemData: PackageTemplateItemFormData): Promise<PackageTemplateItem> => {
  try {
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour ajouter un élément à un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour ajouter un élément à un modèle de package');
    }
    
    const { data, error } = await supabase
      .from('package_template_items')
      .insert([itemData])
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour ajouter un élément à ce modèle de package. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
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
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour modifier un élément d\'un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour modifier un élément d\'un modèle de package');
    }
    
    const { data, error } = await supabase
      .from('package_template_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour modifier cet élément. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
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
    // Vérifier que l'utilisateur est authentifié
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Vous devez être connecté pour supprimer un élément d\'un modèle de package');
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Impossible de vérifier vos droits d\'administrateur');
    }
    
    if (profileData.role !== 'admin') {
      throw new Error('Vous devez avoir les droits d\'administrateur pour supprimer un élément d\'un modèle de package');
    }
    
    const { error } = await supabase
      .from('package_template_items')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour supprimer cet élément. Vérifiez que vous êtes bien connecté avec un compte administrateur.');
      }
      throw error;
    }
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