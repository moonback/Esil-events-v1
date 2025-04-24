import { supabase } from './supabaseClient';
import { Product, ProductFormData } from '../types/Product';

// Mock data for products
const mockProducts: Product[] = [
  // {
  //   id: 'c0a80121-7ac0-4e1c-9d1f-c3a3877aa1b1',
  //   name: 'Enceinte JBL EON neuro',
  //   reference: 'JBL-EON715',
  //   category: 'technique',
  //   subCategory: 'son',
  //   subSubCategory: 'enceintes',
  //   description: 'Enceinte active 2 voies 15" avec DSP intégré, idéale pour les événements de moyenne et grande taille. Puissance de 1300W, légère et facile à transporter.',
  //   priceHT: 80,
  //   priceTTC: 96,
  //   stock: 10,
  //   isAvailable: true,
  //   createdAt: new Date('2025-03-03T11:59:55.533Z'),
  //   updatedAt: new Date('2025-03-03T11:59:55.533Z'),
  //   images: [
  //     'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  //     'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  //     'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  //   ],
  //   technicalSpecs: {
  //     'Type': 'Enceinte active 2 voies',
  //     'Puissance': '1300W',
  //     'Haut-parleur': '15"',
  //     'SPL max': '127 dB',
  //     'Réponse en fréquence': '45 Hz - 20 kHz',
  //     'Dispersion': '100° x 60°',
  //     'Poids': '17 kg',
  //     'Dimensions': '68.6 x 42.9 x 36.6 cm'
  //   },
  //   technicalDocUrl: 'https://example.com/docs/jbl-eon715.pdf',
  //   videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  // },
  // {
  //   id: 'c0a80121-7ac0-4e1c-9d1f-c3a3877aa1b2',
  //   name: 'Table basse LED',
  //   reference: 'TBL-LED-01',
  //   category: 'mobilier',
  //   subCategory: 'tables',
  //   subSubCategory: 'tables-basses',
  //   description: 'Table basse lumineuse à LED, idéale pour les espaces lounge et VIP. Changement de couleurs via télécommande, batterie rechargeable pour une utilisation sans fil.',
  //   priceHT: 45,
  //   priceTTC: 54,
  //   stock: 5,
  //   isAvailable: true,
  //   createdAt: new Date('2025-03-03T11:59:55.533Z'),
  //   updatedAt: new Date('2025-03-03T11:59:55.533Z'),
  //   images: [
  //     'https://images.unsplash.com/photo-1581428982868-e410dd047a90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  //     'https://images.unsplash.com/photo-1565791380713-1756b9a05343?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  //   ],
  //   technicalSpecs: {
  //     'Matériau': 'Polyéthylène',
  //     'Dimensions': '80 x 80 x 40 cm',
  //     'Poids': '8 kg',
  //     'Autonomie': 'Jusqu\'à 8 heures',
  //     'Télécommande': 'Incluse'
  //   },
  //   technicalDocUrl: null,
  //   videoUrl: null
  // }
]

// Fetch all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Authentication status:', session ? 'Authenticated' : 'Not authenticated');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Query executed');
    
    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!data) {
      console.log('No data returned from Supabase');
      return [];
    }

    // Convert snake_case to camelCase and ensure all Product interface properties are included
    const formattedData = data.map((product) => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      category: product.category,
      subCategory: product.sub_category,
      subSubCategory: product.sub_sub_category || '',
      description: product.description,
      priceHT: parseFloat(product.price_ht),
      priceTTC: parseFloat(product.price_ttc),
      stock: product.stock,
      isAvailable: product.is_available,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      images: product.images || [],
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null
    }));

    console.log('Products fetched successfully:', formattedData.length, 'products');
    return formattedData;
  } catch (error: any) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

// Fetch products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      console.log('Falling back to mock data...');
      return mockProducts.filter(p => p.category === category);
    }

    if (!data || data.length === 0) {
      console.log('No products found in database for this category, using mock data...');
      return mockProducts.filter(p => p.category === category);
    }

    // Convert snake_case to camelCase
    const formattedData = data.map((product) => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      category: product.category,
      subCategory: product.sub_category,
      subSubCategory: product.sub_sub_category || '',
      description: product.description,
      priceHT: parseFloat(product.price_ht),
      priceTTC: parseFloat(product.price_ttc),
      stock: product.stock,
      isAvailable: product.is_available,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      images: product.images || [],
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching products:', error);
    return mockProducts.filter(p => p.category === category);
  }
};

// Search products by query
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      console.log('Falling back to mock data...');
      return mockProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (!data || data.length === 0) {
      console.log('No products found in database for this query, using mock data...');
      return mockProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Convert snake_case to camelCase
    const formattedData = data.map((product) => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      category: product.category,
      subCategory: product.sub_category,
      subSubCategory: product.sub_sub_category || '',
      description: product.description,
      priceHT: parseFloat(product.price_ht),
      priceTTC: parseFloat(product.price_ttc),
      stock: product.stock,
      isAvailable: product.is_available,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      images: product.images || [],
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null
    }));

    return formattedData;
  } catch (error) {
    console.error('Error searching products:', error);
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Fetch products by subcategory
export const getProductsBySubCategory = async (category: string, subCategory: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('sub_category', subCategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      console.log('Falling back to mock data...');
      return mockProducts.filter(p => p.category === category && p.subCategory === subCategory);
    }

    if (!data || data.length === 0) {
      console.log('No products found in database for this subcategory, using mock data...');
      return mockProducts.filter(p => p.category === category && p.subCategory === subCategory);
    }

    // Convert snake_case to camelCase
    const formattedData = data.map((product) => ({
      id: product.id,
      name: product.name,
      reference: product.reference,
      category: product.category,
      subCategory: product.sub_category,
      subSubCategory: product.sub_sub_category || '',
      description: product.description,
      priceHT: parseFloat(product.price_ht),
      priceTTC: parseFloat(product.price_ttc),
      stock: product.stock,
      isAvailable: product.is_available,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      images: product.images || [],
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return mockProducts.filter(p => p.category === category && p.subCategory === subCategory);
  }
};

// Fetch a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    console.log('Fetching product by ID:', id);
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Authentication status:', session ? 'Authenticated' : 'Not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle not found case without error

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    if (!data) {
      console.log('No product found with ID:', id);
      return null;
    }

    // Convert snake_case to camelCase
    const formattedData: Product = {
      id: data.id,
      name: data.name,
      reference: data.reference,
      category: data.category,
      subCategory: data.sub_category,
      subSubCategory: data.sub_sub_category,
      description: data.description,
      priceHT: parseFloat(data.price_ht),
      priceTTC: parseFloat(data.price_ttc),
      stock: data.stock,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      images: data.images,
      colors: data.colors || [],
      technicalSpecs: data.technical_specs,
      technicalDocUrl: data.technical_doc_url,
      videoUrl: data.video_url,
      relatedProducts: data.related_products || []
    };

    console.log('Product fetched successfully:', formattedData.id);
    return formattedData;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (product: ProductFormData): Promise<Product> => {
  try {
    console.log('Creating new product in Supabase...', product);
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required to create a product');
    }
    console.log('User is authenticated:', session.user.id);

    // Prepare the product data for database insertion
    const dbProduct = {
      name: product.name,
      reference: product.reference,
      category: product.category,
      sub_category: product.subCategory,
      sub_sub_category: product.subSubCategory,
      description: product.description,
      price_ht: product.priceHT,
      price_ttc: product.priceTTC,
      stock: product.stock,
      is_available: true,
      images: product.images || [],
      colors: product.colors || [],
      technical_specs: product.technicalSpecs || {},
      technical_doc_url: product.technicalDocUrl || null,
      video_url: product.videoUrl || null,
      created_by: session.user.id,
      updated_by: session.user.id
    };

    console.log('Attempting to insert product with data:', dbProduct);

    // Insert the product
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();

    if (error) {
      console.error('Detailed error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas la permission de créer des produits. Veuillez contacter un administrateur.');
      } else if (error.code === '23502') {
        throw new Error('Certains champs requis sont manquants.');
      } else if (error.code === '23505') {
        throw new Error('Un produit avec cette référence existe déjà.');
      }
      
      throw new Error(`Erreur lors de la création du produit: ${error.message}`);
    }

    if (!data) {
      throw new Error('Aucune donnée retournée après la création du produit');
    }

    console.log('Product successfully inserted:', data);

    // Format the response data
    const formattedData: Product = {
      id: data.id,
      name: data.name,
      reference: data.reference,
      category: data.category,
      subCategory: data.sub_category,
      subSubCategory: data.sub_sub_category,
      description: data.description,
      priceHT: parseFloat(data.price_ht),
      priceTTC: parseFloat(data.price_ttc),
      stock: data.stock,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      images: data.images,
      colors: data.colors || [],
      technicalSpecs: data.technical_specs,
      technicalDocUrl: data.technical_doc_url,
      videoUrl: data.video_url,
      relatedProducts: data.related_products || []
    };

    console.log('Product created successfully:', formattedData.id);
    return formattedData;
  } catch (error: any) {
    console.error('Error in createProduct:', error);
    throw new Error(error.message || 'Erreur lors de la création du produit');
  }
};

// Update an existing product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    console.log('Updating product in Supabase...');
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required to update a product');
    }
    console.log('User is authenticated:', session.user.email);

    // First, check if the product exists and if the user has permission to update it
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error checking product:', checkError);
      throw new Error(`Failed to check product: ${checkError.message}`);
    }

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Convert camelCase to snake_case for database
    const dbProduct: Record<string, any> = {
      name: product.name,
      reference: product.reference,
      category: product.category,
      sub_category: product.subCategory,
      sub_sub_category: product.subSubCategory,
      description: product.description,
      price_ht: product.priceHT,
      price_ttc: product.priceTTC,
      stock: product.stock,
      is_available: product.isAvailable,
      images: product.images,
      colors: product.colors || [],
      technical_specs: product.technicalSpecs,
      technical_doc_url: product.technicalDocUrl,
      video_url: product.videoUrl,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    };

    // Remove undefined values
    Object.keys(dbProduct).forEach(key => 
      dbProduct[key] === undefined && delete dbProduct[key]
    );

    console.log('Updating product with data:', dbProduct);

    // Use the service role client for the update operation
    const { data, error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      if (error.code === '42501') { // Permission denied error
        throw new Error('You do not have permission to update this product. Please contact an administrator.');
      }
      throw new Error(`Failed to update product: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after updating product');
    }

    // Convert back to camelCase for frontend
    const formattedData = {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      subCategory: data.sub_category,
      priceHT: parseFloat(data.price_ht),
      priceTTC: parseFloat(data.price_ttc),
      technicalSpecs: data.technical_specs,
      technicalDocUrl: data.technical_doc_url,
      videoUrl: data.video_url,
      isAvailable: data.is_available
    };

    console.log('Product updated successfully');
    return formattedData;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    console.log('Deleting product from Supabase...');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

const BUCKET_NAME = 'product-images';

// Upload product image
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    console.log('Starting image upload:', file.name);
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log('Uploading file with name:', fileName);

    // Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError.message.includes('row-level security policy')) {
        throw new Error('Vous n\'avez pas la permission d\'uploader des images. Veuillez contacter un administrateur.');
      }
      throw new Error(`Erreur lors du téléchargement de l'image: ${uploadError.message}`);
    }

    if (!data) {
      console.error('No data returned from upload');
      throw new Error('Erreur lors du téléchargement de l\'image');
    }

    console.log('Upload successful, getting public URL');

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Impossible de générer l\'URL publique de l\'image');
    }

    console.log('Image upload complete:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadProductImage:', error);
    throw new Error(error.message || 'Erreur lors du téléchargement de l\'image');
  }
};

// Seed database with mock data
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding process...');
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required. Please log in first.');
    }
    console.log('User is authenticated:', session.user.id);
    
    // Convert mock products to database format
    const dbProducts = mockProducts.map(product => ({
      name: product.name,
      reference: product.reference,
      category: product.category,
      sub_category: product.subCategory,
      description: product.description,
      price_ht: product.priceHT,
      price_ttc: product.priceTTC,
      stock: product.stock,
      is_available: true,
      images: product.images || [],
      colors: product.colors || [],
      technical_specs: product.technicalSpecs || {},
      technical_doc_url: product.technicalDocUrl || null,
      video_url: product.videoUrl || null,
      created_by: session.user.id,
      updated_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log('Prepared', dbProducts.length, 'products for insertion');

    // First, delete all existing products for this user
    console.log('Deleting existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('created_by', session.user.id);
    
    if (deleteError) {
      console.error('Error deleting existing products:', deleteError);
      throw new Error(`Failed to delete existing products: ${deleteError.message}`);
    }
    console.log('Existing products deleted successfully');

    // Insert products one by one to better handle errors
    console.log('Starting product insertion...');
    const insertedProducts = [];
    
    for (const product of dbProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Error inserting product:', error);
        throw new Error(`Failed to insert product ${product.name}: ${error.message}`);
      }

      if (data) {
        insertedProducts.push(data);
      }
    }

    console.log('Database seeded successfully with', insertedProducts.length, 'products');

  } catch (error) {
    console.error('Error in seedDatabase:', error);
    throw error;
  }
};

// Update product colors
export const updateProductColors = async (id: string, colors: string[]): Promise<void> => {
  try {
    console.log('Updating product colors:', { id, colors });
    
    const { error } = await supabase
      .from('products')
      .update({ colors })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to update product colors: ${error.message}`);
    }

    console.log('Colors updated successfully');
  } catch (error) {
    console.error('Error in updateProductColors:', error);
    throw error;
  }
};
