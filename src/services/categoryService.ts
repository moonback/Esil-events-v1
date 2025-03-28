import { supabase } from './supabaseClient';

export interface Category {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  subsubcategories?: SubSubcategory[];
}

export interface SubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Fetch all categories with their subcategories
export const getAllCategories = async (): Promise<Category[]> => {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('order_index');

  if (categoriesError) throw categoriesError;

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('*')
    .order('order_index');

  if (subcategoriesError) throw subcategoriesError;

  const { data: subsubcategories, error: subsubcategoriesError } = await supabase
    .from('subsubcategories')
    .select('*')
    .order('order_index');

  if (subsubcategoriesError) throw subsubcategoriesError;

  const subcategoriesWithSubs = subcategories.map(subcategory => ({
    ...subcategory,
    subsubcategories: subsubcategories.filter(sub => sub.subcategory_id === subcategory.id)
  }));

  return categories.map(category => ({
    ...category,
    subcategories: subcategoriesWithSubs.filter(sub => sub.category_id === category.id)
  }));
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a category
export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Create a new subcategory
export const createSubcategory = async (subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>): Promise<Subcategory> => {
  const { data, error } = await supabase
    .from('subcategories')
    .insert([subcategory])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a subcategory
export const updateSubcategory = async (id: string, subcategory: Partial<Subcategory>): Promise<Subcategory> => {
  const { data, error } = await supabase
    .from('subcategories')
    .update(subcategory)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a subcategory
export const deleteSubcategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reorder categories
export const reorderCategories = async (orderedIds: string[]): Promise<void> => {
  const updates = orderedIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const { error } = await supabase
    .from('categories')
    .upsert(updates);

  if (error) throw error;
};

// Reorder subcategories
export const reorderSubcategories = async (categoryId: string, orderedIds: string[]): Promise<void> => {
  const updates = orderedIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const { error } = await supabase
    .from('subcategories')
    .upsert(updates);

  if (error) throw error;
};

// Create a new subsubcategory
export const createSubSubcategory = async (subsubcategory: Omit<SubSubcategory, 'id' | 'created_at' | 'updated_at'>): Promise<SubSubcategory> => {
  const { data, error } = await supabase
    .from('subsubcategories')
    .insert([subsubcategory])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a subsubcategory
export const updateSubSubcategory = async (id: string, subsubcategory: Partial<SubSubcategory>): Promise<SubSubcategory> => {
  const { data, error } = await supabase
    .from('subsubcategories')
    .update(subsubcategory)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a subsubcategory
export const deleteSubSubcategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subsubcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reorder subsubcategories
export const reorderSubSubcategories = async (subcategoryId: string, orderedIds: string[]): Promise<void> => {
  const updates = orderedIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const { error } = await supabase
    .from('subsubcategories')
    .upsert(updates);

  if (error) throw error;
};
