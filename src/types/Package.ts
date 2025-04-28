import { Product } from './Product';

// Interface pour les produits inclus dans un package avec quantité
export interface PackageItem {
  productId: string;
  quantity: number;
  isRequired: boolean; // Si l'élément est obligatoire ou optionnel
  isCustomizable: boolean; // Si le client peut modifier la quantité
  minQuantity?: number; // Quantité minimale si personnalisable
  maxQuantity?: number; // Quantité maximale si personnalisable
}

// Interface pour les options de personnalisation du package
export interface PackageOption {
  id: string;
  name: string;
  description?: string;
  choices: {
    id: string;
    name: string;
    description?: string;
    priceAdjustment: number; // Ajustement de prix (positif ou négatif)
    productIds?: string[]; // Produits associés à cette option
  }[];
  isRequired: boolean;
}

// Interface principale pour un package
export interface Package extends Omit<Product, 'relatedProducts'> {
  type: 'package'; // Pour distinguer des produits normaux
  items: PackageItem[];
  options?: PackageOption[];
  discountPercentage?: number; // Pourcentage de réduction par rapport à l'achat individuel
  originalTotalPriceHT?: number; // Prix total HT des produits individuels sans réduction
  originalTotalPriceTTC?: number; // Prix total TTC des produits individuels sans réduction
}

// Type pour le formulaire de création/édition de package
export type PackageFormData = Omit<Package, 'id' | 'createdAt' | 'updatedAt'>;