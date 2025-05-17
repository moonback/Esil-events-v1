type ProductId = 'product-1' | 'product-2' | 'product-3' | 'product-4' | 'product-5';
type MoodboardId = 'moodboard-1' | 'moodboard-2' | 'moodboard-3';

export const PLACEHOLDER_IMAGES = {
  products: {
    'product-1': '/images/products/placeholder-1.jpg',
    'product-2': '/images/products/placeholder-2.jpg',
    'product-3': '/images/products/placeholder-3.jpg',
    'product-4': '/images/products/placeholder-4.jpg',
    'product-5': '/images/products/placeholder-5.jpg',
  } as Record<ProductId, string>,
  moodboards: {
    'moodboard-1': [
      '/images/moodboards/wedding-1.jpg',
      '/images/moodboards/wedding-2.jpg',
      '/images/moodboards/wedding-3.jpg',
      '/images/moodboards/wedding-4.jpg',
    ],
    'moodboard-2': [
      '/images/moodboards/corporate-1.jpg',
      '/images/moodboards/corporate-2.jpg',
      '/images/moodboards/corporate-3.jpg',
      '/images/moodboards/corporate-4.jpg',
    ],
    'moodboard-3': [
      '/images/moodboards/birthday-1.jpg',
      '/images/moodboards/birthday-2.jpg',
      '/images/moodboards/birthday-3.jpg',
      '/images/moodboards/birthday-4.jpg',
    ],
  } as Record<MoodboardId, string[]>,
};

export const getProductImage = (productId: string): string => {
  return PLACEHOLDER_IMAGES.products[productId as ProductId] || '/images/products/default.jpg';
};

export const getMoodboardImages = (moodboardId: string): string[] => {
  return PLACEHOLDER_IMAGES.moodboards[moodboardId as MoodboardId] || ['/images/moodboards/default.jpg'];
}; 