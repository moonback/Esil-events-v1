import { supabase } from './supabaseClient';
import { Product, ProductFormData } from '../types/Product';
import { generateSlug, generateUniqueSlug } from '../utils/slugUtils';

// Mock data for products
const mockProducts: Product[] = [
  
]

// Duplicate a product
export const duplicateProduct = async (productId: string): Promise<string> => {
  try {
    // Récupérer la session utilisateur actuelle
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Vous devez être connecté pour dupliquer un produit');
    }
    
    const userId = session.user.id;
    
    // Fetch the product to duplicate
    const { data: productData, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Error fetching product to duplicate:', fetchError);
      throw new Error(`Failed to fetch product: ${fetchError.message}`);
    }

    if (!productData) {
      throw new Error('Product not found');
    }

    // Create a new product based on the existing one
    // Modify the name to indicate it's a copy
    const newProductData = {
      name: `${productData.name} (copie)`,
      reference: `${productData.reference}-copie`,
      category: productData.category,
      sub_category: productData.sub_category,
      sub_sub_category: productData.sub_sub_category,
      description: productData.description,
      price_ht: productData.price_ht,
      price_ttc: productData.price_ttc,
      stock: productData.stock,
      is_available: productData.is_available,
      images: productData.images,
      main_image_index: productData.main_image_index,
      colors: productData.colors,
      technical_specs: productData.technical_specs,
      technical_doc_url: productData.technical_doc_url,
      video_url: productData.video_url,
      // SEO fields
      seo_title: productData.seo_title || null,
      seo_description: productData.seo_description || null,
      seo_keywords: productData.seo_keywords || null,
      created_by: userId,
      updated_by: userId
    };

    // Insert the new product
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([newProductData])
      .select()
      .single();

    if (insertError) {
      console.error('Error duplicating product:', insertError);
      throw new Error(`Failed to duplicate product: ${insertError.message}`);
    }

    return newProduct.id;
  } catch (error: any) {
    console.error('Error in duplicateProduct:', error);
    throw error;
  }
};

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
      mainImageIndex: product.main_image_index,
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      seo_keywords: product.seo_keywords || null
      
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
      mainImageIndex: product.main_image_index,
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      seo_keywords: product.seo_keywords || null
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
      mainImageIndex: product.main_image_index,
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      seo_keywords: product.seo_keywords || null
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
      mainImageIndex: product.main_image_index,
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      seo_keywords: product.seo_keywords || null
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return mockProducts.filter(p => p.category === category && p.subCategory === subCategory);
  }
};

// Fetch a single product by ID or slug
export const getProductById = async (idOrSlug: string): Promise<Product | null> => {
  try {
    console.log('Fetching product by ID or slug:', idOrSlug);
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Authentication status:', session ? 'Authenticated' : 'Not authenticated');

    // Determine if the parameter is a UUID or a slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let query = supabase.from('products').select('*');
    
    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }
    
    const { data, error } = await query.maybeSingle(); // Use maybeSingle() instead of single() to handle not found case without error

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    if (!data) {
      console.log('No product found with identifier:', idOrSlug);
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
      mainImageIndex: data.main_image_index,
      colors: data.colors || [],
      technicalSpecs: data.technical_specs,
      technicalDocUrl: data.technical_doc_url,
      videoUrl: data.video_url,
      relatedProducts: data.related_products || [],
      slug: data.slug || null,
      // Ajout des champs SEO - Assurez-vous qu'ils sont correctement transmis
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null
    };
    
    // Log pour vérifier que les données SEO sont bien présentes
    console.log('SEO data in product:', {
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords
    });

    console.log('Product fetched successfully:', formattedData.id);
    return formattedData;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
};

// Fetch a single product by slug
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  return getProductById(slug);
};

// Fetch similar products based on multiple criteria with relevance scoring
export const getSimilarProducts = async (product: Product, limit: number = 4): Promise<Product[]> => {
  try {
    console.log('Fetching similar products for:', product.id);
    
    // First check if the product has explicitly defined related products
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      console.log('Using explicitly defined related products');
      
      // Fetch the related products by their IDs
      const { data: relatedData, error: relatedError } = await supabase
        .from('products')
        .select('*')
        .in('id', product.relatedProducts)
        .limit(limit);
      
      if (!relatedError && relatedData && relatedData.length > 0) {
        // Format and return the explicitly related products
        const formattedRelatedData = formatProductData(relatedData);
        console.log('Explicitly related products fetched successfully:', formattedRelatedData.length);
        return formattedRelatedData;
      }
    }
    
    // If no explicit related products or they couldn't be fetched, use enhanced similarity algorithm
    
    // Fetch a larger pool of potential similar products for better recommendations
    // First try to get products from the same subcategory and subSubCategory if available
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id) // Exclude the current product
      .eq('is_available', true); // Only include available products
    
    // Add subcategory filter if available
    if (product.subCategory) {
      query = query.eq('sub_category', product.subCategory);
    }
    
    // Add sub-subcategory filter if available
    if (product.subSubCategory) {
      query = query.eq('sub_sub_category', product.subSubCategory);
    }
    
    let { data, error } = await query.limit(limit * 3); // Get more than needed for better sorting

    // If not enough products found in the same exact categories, broaden the search
    if (!error && (!data || data.length < limit)) {
      // Try with just the same category and subcategory
      if (product.subSubCategory) {
        const { data: moreData, error: moreError } = await supabase
          .from('products')
          .select('*')
          .eq('category', product.category)
          .eq('sub_category', product.subCategory)
          .neq('sub_sub_category', product.subSubCategory) // Different sub-subcategory
          .neq('id', product.id)
          .eq('is_available', true)
          .limit(limit * 2);

        if (!moreError && moreData) {
          data = [...(data || []), ...moreData];
        }
      }
      
      // If still not enough, try with just the same category
      if (!error && (!data || data.length < limit) && product.subCategory) {
        const neededMore = Math.max(limit * 2 - (data?.length || 0), 0);
        const { data: evenMoreData, error: evenMoreError } = await supabase
          .from('products')
          .select('*')
          .eq('category', product.category)
          .neq('sub_category', product.subCategory) // Different subcategory
          .neq('id', product.id)
          .eq('is_available', true)
          .limit(neededMore);

        if (!evenMoreError && evenMoreData) {
          data = [...(data || []), ...evenMoreData];
        }
      }
      
      // If we still need more products, try with different categories but similar price range
      if (!error && (!data || data.length < limit)) {
        const priceMin = product.priceTTC * 0.7; // 70% of product price
        const priceMax = product.priceTTC * 1.3; // 130% of product price
        
        const { data: priceSimilarData, error: priceSimilarError } = await supabase
          .from('products')
          .select('*')
          .neq('category', product.category) // Different category
          .neq('id', product.id)
          .eq('is_available', true)
          .gte('price_ttc', priceMin)
          .lte('price_ttc', priceMax)
          .limit(limit);

        if (!priceSimilarError && priceSimilarData) {
          data = [...(data || []), ...priceSimilarData];
        }
      }
    }

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No similar products found');
      return [];
    }

    // Convert snake_case to camelCase
    const formattedData = formatProductData(data);
    
    // Enhanced scoring algorithm for better recommendations
    const scoredProducts = formattedData.map(similarProduct => {
      let score = 0;
      
      // Base score for being in the same category
      score += 10;
      
      // Additional score for same subcategory
      if (similarProduct.subCategory === product.subCategory) {
        score += 25; // Increased from 20
      }
      
      // Additional score for same sub-subcategory
      if (similarProduct.subSubCategory && similarProduct.subSubCategory === product.subSubCategory) {
        score += 35; // Increased from 30
      }
      
      // Price similarity (closer prices get higher scores) - Enhanced algorithm
      const priceDifference = Math.abs(similarProduct.priceTTC - product.priceTTC);
      const priceRatio = priceDifference / product.priceTTC;
      if (priceRatio < 0.05) { // Within 5% price range
        score += 20; // New tier for very close prices
      } else if (priceRatio < 0.1) { // Within 10% price range
        score += 15;
      } else if (priceRatio < 0.3) { // Within 30% price range
        score += 10;
      } else if (priceRatio < 0.5) { // Within 50% price range
        score += 5;
      }
      
      // Similar technical specs (if available) - Enhanced algorithm
      if (product.technicalSpecs && similarProduct.technicalSpecs) {
        const productSpecsKeys = Object.keys(product.technicalSpecs);
        const similarSpecsKeys = Object.keys(similarProduct.technicalSpecs);
        
        // Count matching spec keys
        const matchingKeys = productSpecsKeys.filter(key => similarSpecsKeys.includes(key));
        if (matchingKeys.length > 0) {
          // Calculate percentage of matching specs for more accurate scoring
          const matchPercentage = matchingKeys.length / productSpecsKeys.length;
          score += 5 + Math.round(matchPercentage * 20); // Base + up to 20 points based on match percentage
          
          // Bonus for matching values, not just keys
          let valueMatchCount = 0;
          matchingKeys.forEach(key => {
            if (product.technicalSpecs[key] === similarProduct.technicalSpecs[key]) {
              valueMatchCount++;
            }
          });
          
          if (valueMatchCount > 0) {
            score += valueMatchCount * 3; // 3 points per exact value match
          }
        }
      }
      
      // Similar colors (if available) - Enhanced algorithm
      if (product.colors && product.colors.length > 0 && 
          similarProduct.colors && similarProduct.colors.length > 0) {
        const matchingColors = product.colors.filter(color => 
          similarProduct.colors?.includes(color));
        if (matchingColors.length > 0) {
          // Calculate percentage of matching colors
          const colorMatchPercentage = matchingColors.length / product.colors.length;
          score += 5 + Math.round(colorMatchPercentage * 15); // Base + up to 15 points based on match percentage
        }
      }
      
      // Stock availability bonus
      if (similarProduct.stock > 5) {
        score += 5; // Bonus for well-stocked items
      }
      
      // Recency bonus - newer products get a slight boost
      const productAge = new Date().getTime() - new Date(similarProduct.createdAt).getTime();
      const isRecentProduct = productAge < (90 * 24 * 60 * 60 * 1000); // Less than 90 days old
      if (isRecentProduct) {
        score += 5; // Bonus for newer products
      }
      
      return { ...similarProduct, relevanceScore: score };
    });
    
    // Sort by relevance score (highest first) and limit to requested number
    const sortedProducts = scoredProducts
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);
    
    console.log('Similar products fetched and sorted by relevance:', sortedProducts.length);
    return sortedProducts;
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
};

// Helper function to format product data from database format to application format
const formatProductData = (data: any[]): Product[] => {
  return data.map((product) => ({
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
    mainImageIndex: product.main_image_index,
    colors: product.colors || [],
    relatedProducts: product.related_products || [],
    technicalSpecs: product.technical_specs || {},
    technicalDocUrl: product.technical_doc_url || null,
    videoUrl: product.video_url || null,
    // Ajout des champs SEO
    seo_title: product.seo_title || null,
    seo_description: product.seo_description || null,
    seo_keywords: product.seo_keywords || null
  }));
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

    // Generate a slug from the product name
    const baseSlug = generateSlug(product.name);
    
    // Check if the slug already exists
    const { data: existingProducts, error: slugCheckError } = await supabase
      .from('products')
      .select('slug')
      .not('slug', 'is', null);
      
    if (slugCheckError) {
      console.error('Error checking existing slugs:', slugCheckError);
      throw new Error(`Failed to check existing slugs: ${slugCheckError.message}`);
    }
    
    // Generate a unique slug
    const existingSlugs = existingProducts ? existingProducts.map(p => p.slug) : [];
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

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
      main_image_index: product.mainImageIndex,
      colors: product.colors || [],
      technical_specs: product.technicalSpecs || {},
      technical_doc_url: product.technicalDocUrl || null,
      video_url: product.videoUrl || null,
      // Add the slug
      slug: uniqueSlug,
      // Ajout des champs SEO
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      seo_keywords: product.seo_keywords || null,
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
      mainImageIndex: data.main_image_index,
      colors: data.colors || [],
      technicalSpecs: data.technical_specs,
      technicalDocUrl: data.technical_doc_url,
      videoUrl: data.video_url,
      relatedProducts: data.related_products || [],
      slug: data.slug || null,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords
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
      main_image_index: product.mainImageIndex,
      colors: product.colors || [],
      technical_specs: product.technicalSpecs,
      technical_doc_url: product.technicalDocUrl,
      video_url: product.videoUrl,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      seo_keywords: product.seo_keywords,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    };
    
    // If name is changed, update the slug
    if (product.name && product.name !== existingProduct.name) {
      const baseSlug = generateSlug(product.name);
      
      // Check if the slug already exists for other products
      const { data: existingProducts, error: slugCheckError } = await supabase
        .from('products')
        .select('slug')
        .not('id', 'eq', id)
        .not('slug', 'is', null);
        
      if (slugCheckError) {
        console.error('Error checking existing slugs:', slugCheckError);
        throw new Error(`Failed to check existing slugs: ${slugCheckError.message}`);
      }
      
      // Generate a unique slug
      const existingSlugs = existingProducts ? existingProducts.map(p => p.slug) : [];
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      dbProduct.slug = uniqueSlug;
    }
    
    // Log pour vérifier que les données SEO sont bien envoyées à la base de données
    console.log('SEO data being saved:', {
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      seo_keywords: product.seo_keywords
    });

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
      isAvailable: data.is_available,
      mainImageIndex: data.main_image_index,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords
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
    console.log('Deleting product from Supabase...', id);
    
    // Vérifier que le produit existe avant de le supprimer
    const { data: productExists, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking product existence:', checkError);
      throw new Error(`Failed to check product existence: ${checkError.message}`);
    }
    
    if (!productExists) {
      console.warn(`Product with ID ${id} does not exist, nothing to delete`);
      return;
    }
    
    // Supprimer le produit
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
    
    // Vérifier que le produit a bien été supprimé
    const { data: verifyProduct, error: verifyError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    if (verifyError) {
      console.error('Error verifying product deletion:', verifyError);
      throw new Error(`Failed to verify product deletion: ${verifyError.message}`);
    }
    
    if (verifyProduct) {
      console.error(`Product with ID ${id} still exists after deletion attempt`);
      throw new Error('Failed to delete product: Product still exists in database');
    }

    console.log('Product deleted successfully and verified from database');
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
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      seo_keywords: product.seo_keywords,
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

// Fetch products by subsubcategory
export const getProductsBySubSubCategory = async (category: string, subCategory: string, subSubCategory: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('sub_category', subCategory)
      .eq('sub_sub_category', subSubCategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      console.log('Falling back to mock data...');
      return mockProducts.filter(p => 
        p.category === category && 
        p.subCategory === subCategory && 
        p.subSubCategory === subSubCategory
      );
    }

    if (!data || data.length === 0) {
      console.log('No products found in database for this subsubcategory, using mock data...');
      return mockProducts.filter(p => 
        p.category === category && 
        p.subCategory === subCategory && 
        p.subSubCategory === subSubCategory
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
      mainImageIndex: product.main_image_index,
      colors: product.colors || [],
      relatedProducts: product.related_products || [],
      technicalSpecs: product.technical_specs || {},
      technicalDocUrl: product.technical_doc_url || null,
      videoUrl: product.video_url || null,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      seo_keywords: product.seo_keywords

    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching products by subsubcategory:', error);
    return mockProducts.filter(p => 
      p.category === category && 
      p.subCategory === subCategory && 
      p.subSubCategory === subSubCategory
    );
  }
};
