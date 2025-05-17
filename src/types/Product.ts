export interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  subCategory: string;
  subSubCategory: string;
  description: string;
  priceHT: number;
  priceTTC: number;
  images: string[];
  mainImageIndex?: number; // Index de l'image principale dans le tableau images
  colors?: string[];
  relatedProducts?: string[];
  technicalSpecs: Record<string, string>;
  technicalDocUrl: string | null;
  videoUrl: string | null;
  stock: number;
  isAvailable: boolean;
  slug?: string; // Nouveau champ pour les URLs conviviales
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  subSubCategories: SubSubCategory[];
}

export interface SubSubCategory {
  id: string;
  name: string;
  slug: string;
}
