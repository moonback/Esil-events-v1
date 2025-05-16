// Types pour les composants du panier

// Type pour les éléments du panier
export interface CartItem {
  id: string;
  name: string;
  image: string;
  priceTTC: number;
  quantity: number;
  color?: string;
}

// Type pour les données du formulaire de commande
export interface FormData {
  user_id?: string | null;
  description: string;
  eventDuration: string;
  // Étape 1 : Détails de facturation
  customerType: 'particular' | 'professional';
  company: string;
  firstName: string;
  lastName: string;
  billingAddress: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;

  // Étape 2 : Informations sur l'événement
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  guestCount: number;
  eventLocation: 'Intérieur' | 'Extérieur';

  // Étape 3 : Livraison
  deliveryType: 'pickup' | 'eco' | 'premium';
  pickupDate?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: 'before9' | '9to13' | '13to19';
  deliveryAddress?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  exteriorAccess?: 'parking' | 'rue';
  interiorAccess?: 'escaliers' | 'rdc' | 'elevator';
  elevatorWidth?: number | '';
  elevatorHeight?: number | '';
  elevatorDepth?: number | '';

  // Étape 4 : Reprise
  pickupReturnDate: string;
  pickupReturnStartTime: string;
  pickupReturnEndTime: string;

  // Étape 5 : Commentaires/Terms
  comments: string;
  termsAccepted: boolean;
}

// Type pour les props du composant CartItemList
export interface CartItemListProps {
  items: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

// Type pour les props du composant CartSummary
export interface CartSummaryProps {
  items: CartItem[];
  onCheckoutClick: () => void;
}

// Type pour les props du composant EmptyCart
export interface EmptyCartProps {
  message?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  showDecorations?: boolean;
  icon?: 'cart' | 'package' | 'home';
}

// Type pour les props du composant CheckoutForm
export interface CheckoutFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  initialData?: Partial<FormData>;
}

// Type pour les props du composant SuccessMessage
export interface SuccessMessageProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
}
