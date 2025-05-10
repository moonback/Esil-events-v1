export interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  target_event_type?: string;
  base_price?: number;
  is_active: boolean;
  image_url?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface PackageTemplateItem {
  id: string;
  package_template_id: string;
  item_id: string;
  item_type: 'product' | 'service' | 'artist';
  default_quantity: number;
  is_optional: boolean;
  is_quantity_adjustable: boolean;
  min_quantity?: number;
  max_quantity?: number;
  discount_percentage?: number;
  unit_override?: string;
}

export interface PackageTemplateWithItems extends PackageTemplate {
  items: (PackageTemplateItem & {
    item_details?: any; // Détails de l'élément (produit, service ou artiste)
  })[];
}

export type PackageTemplateFormData = Omit<PackageTemplate, 'id' | 'created_at' | 'updated_at'>;

export type PackageTemplateItemFormData = Omit<PackageTemplateItem, 'id'>;