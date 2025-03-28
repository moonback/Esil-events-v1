import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

// ... (Keep the FormData interface as is) ...
interface FormData {
  description: string; // Changed 'any' to 'string' for better type safety
  eventDuration: string; // Changed type to string, assuming text input like "1 day"
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
  eventLocation: 'indoor' | 'outdoor';

  // Étape 3 : Livraison
  deliveryType: 'pickup' | 'eco' | 'premium';
  pickupDate?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: 'before9' | '9to13' | '13to19';
  deliveryAddress?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  exteriorAccess?: 'parking' | 'street';
  interiorAccess?: 'stairs' | 'flat' | 'elevator';
  elevatorWidth?: number | ''; // Allow empty string for initial/reset state
  elevatorHeight?: number | '';// Allow empty string
  elevatorDepth?: number | ''; // Allow empty string

  // Étape 4 : Reprise
  pickupReturnDate: string;
  pickupReturnStartTime: string;
  pickupReturnEndTime: string;

  // Étape 5 : Commentaires/Terms
  comments: string; // Assuming comments field was intended, added back
  termsAccepted: boolean;
}


const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  // const [currentStep, setCurrentStep] = useState(1); // Not used, can be removed unless you plan multi-step
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Étape 1
    customerType: 'particular',
    company: '',
    firstName: '',
    lastName: '',
    billingAddress: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',

    // New fields
    description: '',
    eventDuration: '',

    // Étape 2
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    guestCount: 0,
    eventLocation: 'indoor',

    // Étape 3
    deliveryType: 'pickup',
    pickupDate: '',
    deliveryDate: '',
    deliveryTimeSlot: 'before9', // Default value
    deliveryAddress: '',
    deliveryPostalCode: '',
    deliveryCity: '',
    exteriorAccess: 'parking', // Default value
    interiorAccess: 'flat',    // Default value
    elevatorWidth: '', // Use empty string for number inputs initially
    elevatorHeight: '',
    elevatorDepth: '',

    // Étape 4
    pickupReturnDate: '',
    pickupReturnStartTime: '',
    pickupReturnEndTime: '',

    // Étape 5
    comments: '', // Initialize comments
    termsAccepted: false
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // --- SOLUTION: Update the type annotation here ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox differently to get boolean value
    if (type === 'checkbox') {
      // Need to assert the type to access 'checked' property
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      // Handle number inputs: convert value if the target is type number and value is not empty
      const isNumberInput = type === 'number';
      const processedValue = isNumberInput && value !== '' ? parseFloat(value) : value;

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };
  // --- End of Solution ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation example (can be expanded)
    if (!formData.termsAccepted) {
        alert("Veuillez accepter les conditions générales.");
        return;
    }

    // Here you would typically send the data to your backend
    console.log('Form data:', formData);
    console.log('Cart items:', items);

    // Show success message and clear cart
    setFormSubmitted(true);
    clearCart();
  };

  // --- Conditional Rendering Logic ---
  const isDelivery = formData.deliveryType !== 'pickup';
  const isElevator = formData.interiorAccess === 'elevator';
  const isProfessional = formData.customerType === 'professional';


  if (formSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container-custom mx-auto max-w-3xl">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Demande envoyée avec succès !</h2>
            <p className="mb-6">
              Merci pour votre demande de devis. Notre équipe va l'étudier et vous contactera dans les plus brefs délais.
            </p>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 pb-16 px-4">
      <div className="container-custom mx-auto">
        <h1 className="text-3xl font-bold mb-8">Votre devis</h1>

        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-medium mb-4">Votre panier est vide</h2>
            <p className="mb-6">Vous n'avez pas encore ajouté de produits à votre devis.</p>
            <Link to="/" className="btn-primary">
              Découvrir nos produits
            </Link>
          </div>
        ) : !showForm ? (
          <>
            {/* --- Cart Items Table (No Changes Needed Here) --- */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left">Produit</th>
                    <th className="py-4 px-6 text-center">Quantité</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.color && <p className="text-sm text-gray-500">Couleur: {item.color}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 border border-gray-300 rounded-l disabled:opacity-50"
                            disabled={item.quantity <= 1} // Disable minus if quantity is 1
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 border-t border-b border-gray-300 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 border border-gray-300 rounded-r"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Supprimer ${item.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="flex items-center text-black hover:underline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Demander un devis
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Finaliser votre demande de devis</h2>

            {/* --- Form (Removed Duplicates, Added Conditionals) --- */}
            <form onSubmit={handleSubmit}>
              {/* Section 1: Customer Info */}
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. Informations client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Type de client *
                   </label>
                   <div className="flex flex-wrap gap-x-4 gap-y-2"> {/* Adjusted for responsiveness */}
                     <label className="inline-flex items-center">
                       <input type="radio" name="customerType" value="particular" checked={formData.customerType === 'particular'} onChange={handleInputChange} className="form-radio" required />
                       <span className="ml-2">Particulier</span>
                     </label>
                     <label className="inline-flex items-center">
                       <input type="radio" name="customerType" value="professional" checked={formData.customerType === 'professional'} onChange={handleInputChange} className="form-radio" />
                       <span className="ml-2">Professionnel</span>
                     </label>
                   </div>
                 </div>
                 {isProfessional && ( // Conditionally render Company Name
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Raison sociale *
                      </label>
                      <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} required={isProfessional} className="input-field" />
                    </div>
                 )}
                 <div>
                   <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                   <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                   <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div className="md:col-span-2"> {/* Billing address spans both columns on medium screens */}
                   <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">Adresse de facturation *</label>
                   <input type="text" id="billingAddress" name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                   <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                   <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                   <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                   <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-field" />
                 </div>
              </div>

              {/* Section 2: Event Info */}
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">2. Informations sur l'événement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">Date de l'événement *</label>
                    <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                    <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 mb-1">Durée de location *</label>
                    <input type="text" id="eventDuration" name="eventDuration" value={formData.eventDuration} onChange={handleInputChange} required placeholder="Ex: 1 jour, Week-end, 3 jours" className="input-field" />
                 </div>
                 <div>
                    <label htmlFor="eventStartTime" className="block text-sm font-medium text-gray-700 mb-1">Heure de début *</label>
                    <input type="time" id="eventStartTime" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                    <label htmlFor="eventEndTime" className="block text-sm font-medium text-gray-700 mb-1">Heure de fin *</label>
                    <input type="time" id="eventEndTime" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités (approximatif) *</label>
                   <input type="number" id="guestCount" name="guestCount" value={formData.guestCount} onChange={handleInputChange} required min="0" className="input-field" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de l'événement *</label>
                   <div className="flex flex-wrap gap-x-4 gap-y-2">
                     <label className="inline-flex items-center">
                       <input type="radio" name="eventLocation" value="indoor" checked={formData.eventLocation === 'indoor'} onChange={handleInputChange} className="form-radio" required />
                       <span className="ml-2">Intérieur</span>
                     </label>
                     <label className="inline-flex items-center">
                       <input type="radio" name="eventLocation" value="outdoor" checked={formData.eventLocation === 'outdoor'} onChange={handleInputChange} className="form-radio" />
                       <span className="ml-2">Extérieur</span>
                     </label>
                   </div>
                 </div>
              </div>

               {/* Section 3: Delivery/Pickup */}
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">3. Livraison / Retrait</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode de récupération/livraison *
                  </label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <label className="inline-flex items-center">
                      <input type="radio" name="deliveryType" value="pickup" checked={!isDelivery} onChange={handleInputChange} className="form-radio" required />
                      <span className="ml-2">Retrait sur place (Click & Collect)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="deliveryType" value="eco" checked={formData.deliveryType === 'eco'} onChange={handleInputChange} className="form-radio" />
                      <span className="ml-2">Livraison éco</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="deliveryType" value="premium" checked={formData.deliveryType === 'premium'} onChange={handleInputChange} className="form-radio" />
                      <span className="ml-2">Livraison premium</span>
                    </label>
                  </div>
                </div>

                {/* Pickup Date (Conditional) */}
                {!isDelivery && (
                  <div>
                    <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">Date de retrait *</label>
                    <input type="date" id="pickupDate" name="pickupDate" value={formData.pickupDate} onChange={handleInputChange} required={!isDelivery} className="input-field" />
                  </div>
                )}

                {/* Delivery Fields (Conditional) */}
                {isDelivery && (
                  <>
                    <div>
                      <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Date de livraison *</label>
                      <input type="date" id="deliveryDate" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} required={isDelivery} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Créneau horaire de livraison *</label>
                      <select name="deliveryTimeSlot" value={formData.deliveryTimeSlot} onChange={handleInputChange} required={isDelivery} className="input-field">
                        <option value="before9">Avant 9h</option>
                        <option value="9to13">9h-13h</option>
                        <option value="13to19">13h-19h</option>
                      </select>
                    </div>
                     <div className="md:col-span-2">
                       <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison *</label>
                       <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} required={isDelivery} className="input-field" />
                     </div>
                     <div>
                       <label htmlFor="deliveryPostalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal de livraison *</label>
                       <input type="text" id="deliveryPostalCode" name="deliveryPostalCode" value={formData.deliveryPostalCode} onChange={handleInputChange} required={isDelivery} className="input-field" />
                     </div>
                     <div>
                       <label htmlFor="deliveryCity" className="block text-sm font-medium text-gray-700 mb-1">Ville de livraison *</label>
                       <input type="text" id="deliveryCity" name="deliveryCity" value={formData.deliveryCity} onChange={handleInputChange} required={isDelivery} className="input-field" />
                     </div>

                     {/* Access Info */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Accès extérieur *</label>
                       <div className="flex flex-wrap gap-x-4 gap-y-2">
                         <label className="inline-flex items-center">
                           <input type="radio" name="exteriorAccess" value="parking" checked={formData.exteriorAccess === 'parking'} onChange={handleInputChange} className="form-radio" required={isDelivery} />
                           <span className="ml-2">Parking</span>
                         </label>
                         <label className="inline-flex items-center">
                           <input type="radio" name="exteriorAccess" value="street" checked={formData.exteriorAccess === 'street'} onChange={handleInputChange} className="form-radio" />
                           <span className="ml-2">Rue</span>
                         </label>
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Accès intérieur *</label>
                       <div className="flex flex-wrap gap-x-4 gap-y-2">
                           <label className="inline-flex items-center">
                             <input type="radio" name="interiorAccess" value="flat" checked={formData.interiorAccess === 'flat'} onChange={handleInputChange} className="form-radio" required={isDelivery}/>
                             <span className="ml-2">Plain-pied</span>
                           </label>
                           <label className="inline-flex items-center">
                             <input type="radio" name="interiorAccess" value="stairs" checked={formData.interiorAccess === 'stairs'} onChange={handleInputChange} className="form-radio" />
                             <span className="ml-2">Escalier</span>
                           </label>
                           <label className="inline-flex items-center">
                             <input type="radio" name="interiorAccess" value="elevator" checked={isElevator} onChange={handleInputChange} className="form-radio" />
                             <span className="ml-2">Ascenseur</span>
                           </label>
                       </div>
                     </div>

                     {/* Elevator Dimensions (Conditional) */}
                     {isElevator && (
                       <>
                         <div>
                           <label htmlFor="elevatorWidth" className="block text-sm font-medium text-gray-700 mb-1">Largeur ascenseur (cm)</label>
                           <input type="number" id="elevatorWidth" name="elevatorWidth" value={formData.elevatorWidth} onChange={handleInputChange} min="0" className="input-field" />
                         </div>
                         <div>
                           <label htmlFor="elevatorHeight" className="block text-sm font-medium text-gray-700 mb-1">Hauteur ascenseur (cm)</label>
                           <input type="number" id="elevatorHeight" name="elevatorHeight" value={formData.elevatorHeight} onChange={handleInputChange} min="0" className="input-field" />
                         </div>
                         <div>
                           <label htmlFor="elevatorDepth" className="block text-sm font-medium text-gray-700 mb-1">Profondeur ascenseur (cm)</label>
                           <input type="number" id="elevatorDepth" name="elevatorDepth" value={formData.elevatorDepth} onChange={handleInputChange} min="0" className="input-field" />
                         </div>
                       </>
                     )}
                  </>
                )}
              </div>

              {/* Section 4: Return */}
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">4. Reprise du matériel</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                   <label htmlFor="pickupReturnDate" className="block text-sm font-medium text-gray-700 mb-1">Date de reprise *</label>
                   <input type="date" id="pickupReturnDate" name="pickupReturnDate" value={formData.pickupReturnDate} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div> {/* Placeholder for potential layout balance */} </div>
                 <div>
                   <label htmlFor="pickupReturnStartTime" className="block text-sm font-medium text-gray-700 mb-1">Début créneau reprise *</label>
                   <input type="time" id="pickupReturnStartTime" name="pickupReturnStartTime" value={formData.pickupReturnStartTime} onChange={handleInputChange} required className="input-field" />
                 </div>
                 <div>
                   <label htmlFor="pickupReturnEndTime" className="block text-sm font-medium text-gray-700 mb-1">Fin créneau reprise *</label>
                   <input type="time" id="pickupReturnEndTime" name="pickupReturnEndTime" value={formData.pickupReturnEndTime} onChange={handleInputChange} required className="input-field" />
                 </div>
               </div>

              {/* Section 5: Project Description & Terms */}
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">5. Votre projet et finalisation</h3>
               <div className="mb-6">
                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                   Description de votre projet (optionnel, max 1000 caractères)
                 </label>
                 <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} maxLength={1000} rows={4} className="input-field"></textarea>
                 <p className="text-sm text-gray-500 mt-1 text-right">
                   {formData.description.length}/1000 caractères
                 </p>
               </div>

               {/* Removed the duplicate "comments" field, assuming "description" covers this */}

               <div className="mb-6">
                   <label className="inline-flex items-center">
                     <input
                       type="checkbox"
                       name="termsAccepted"
                       checked={formData.termsAccepted}
                       onChange={handleInputChange}
                       className="form-checkbox h-5 w-5 text-primary focus:ring-primary-dark border-gray-300 rounded"
                       required // Add required attribute for basic HTML validation
                     />
                     <span className="ml-2 text-sm text-gray-700">
                       J'accepte les <Link to="/terms" target="_blank" className="underline hover:text-primary">conditions générales de location</Link> *
                     </span>
                   </label>
                 </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center text-black hover:underline order-2 md:order-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au panier
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto order-1 md:order-2"
                  disabled={!formData.termsAccepted} // Optionally disable submit until terms are accepted
                >
                  Envoyer ma demande de devis
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

// Add this to your global CSS or Tailwind config (e.g., index.css or App.css)
/*
.input-field {
  @apply w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary;
}

.btn-primary {
  @apply bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-primary-dark transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.form-radio {
  @apply h-4 w-4 text-primary focus:ring-primary-dark border-gray-300;
}

.form-checkbox {
   @apply h-4 w-4 text-primary focus:ring-primary-dark border-gray-300 rounded;
}

// Example primary color definition (adjust as needed)
:root {
  --color-primary: #3b82f6; // Example: Tailwind's blue-500
  --color-primary-dark: #2563eb; // Example: Tailwind's blue-600
}

.bg-primary { background-color: var(--color-primary); }
.text-primary { color: var(--color-primary); }
.hover\:bg-primary-dark:hover { background-color: var(--color-primary-dark); }
.focus\:ring-primary:focus { --tw-ring-color: var(--color-primary); }
.focus\:border-primary:focus { border-color: var(--color-primary); }
.text-primary { color: var(--color-primary); }
.focus\:ring-primary-dark:focus { --tw-ring-color: var(--color-primary-dark); }

*/