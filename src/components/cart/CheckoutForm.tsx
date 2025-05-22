import React, { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CheckoutFormProps, FormData } from './types';
import CartSummaryPreview from './CartSummaryPreview';
import { useCart } from '../../context/CartContext';

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData = {}
}) => {
  // Récupérer les articles du panier
  const { items } = useCart();
  // Utiliser le hook personnalisé pour gérer le formulaire
  const [formData, setFormData] = React.useState<FormData>({
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

    // Description et durée
    description: '',
    eventDuration: '',

    // Étape 2
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    guestCount: 0,
    eventLocation: 'Intérieur',

    // Étape 3
    deliveryType: 'pickup',
    pickupDate: '',
    deliveryDate: '',
    deliveryTimeSlot: 'before9',
    deliveryAddress: '',
    deliveryPostalCode: '',
    deliveryCity: '',
    exteriorAccess: 'parking',
    interiorAccess: 'rdc',
    elevatorWidth: '',
    elevatorHeight: '',
    elevatorDepth: '',

    // Étape 4
    pickupReturnDate: '',
    pickupReturnStartTime: '',
    pickupReturnEndTime: '',

    // Étape 5
    comments: '',
    termsAccepted: false,
    
    // Fusionner avec les données initiales si fournies
    ...initialData
  });
  const [termsError, setTermsError] = React.useState(false);
  const [dateErrors, setDateErrors] = React.useState({
    deliveryAfterEvent: false,
    pickupBeforeDelivery: false
  });
  const [fieldErrors, setFieldErrors] = React.useState({
    email: false,
    phone: false,
    guestCount: false,
    timeSlot: false
  });

  // Ajout des styles globaux pour les champs de formulaire
  const inputFieldClass = "input-field border border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 transition-colors duration-200";

  // Fonction de validation des dates
  const validateDates = () => {
    const errors = {
      deliveryAfterEvent: false,
      pickupBeforeDelivery: false
    };

    if (formData.eventDate && formData.deliveryDate) {
      errors.deliveryAfterEvent = new Date(formData.deliveryDate) > new Date(formData.eventDate);
    }

    if (formData.deliveryDate && formData.pickupReturnDate) {
      errors.pickupBeforeDelivery = new Date(formData.pickupReturnDate) < new Date(formData.deliveryDate);
    }

    setDateErrors(errors);
    return !errors.deliveryAfterEvent && !errors.pickupBeforeDelivery;
  };

  // Validation des champs
  const validateFields = () => {
    const errors = {
      email: false,
      phone: false,
      guestCount: false,
      timeSlot: false
    };

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    errors.email = !emailRegex.test(formData.email);

    // Validation téléphone (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    errors.phone = !phoneRegex.test(formData.phone);

    // Validation nombre d'invités
    errors.guestCount = formData.guestCount <= 0;

    // Validation créneau horaire
    if (formData.eventStartTime && formData.eventEndTime) {
      const startTime = new Date(`2000-01-01T${formData.eventStartTime}`);
      const endTime = new Date(`2000-01-01T${formData.eventEndTime}`);
      errors.timeSlot = startTime >= endTime;
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      const isNumberInput = type === 'number';
      const processedValue = isNumberInput && value !== '' ? parseFloat(value) : value;

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }

    // Valider les dates après chaque changement
    if (['eventDate', 'deliveryDate', 'pickupReturnDate'].includes(name)) {
      setTimeout(validateDates, 0);
    }

    // Valider les autres champs après chaque changement
    if (['email', 'phone', 'guestCount', 'eventStartTime', 'eventEndTime'].includes(name)) {
      setTimeout(validateFields, 0);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      setTermsError(true);
      return;
    }

    if (!validateDates() || !validateFields()) {
      return;
    }

    setTermsError(false);
    onSubmit(formData);
  };

  // Variables pour le rendu conditionnel
  const isDelivery = formData.deliveryType !== 'pickup';
  const isElevator = formData.interiorAccess === 'elevator';
  const isProfessional = formData.customerType === 'professional';

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Finaliser votre demande de devis</h2>
      
      {/* Afficher le récapitulatif du panier */}
      <CartSummaryPreview items={items} />

      <form onSubmit={handleSubmit}>
        {/* Section 1: Customer Info */}
        <h3 className="text-lg text-violet-800 font-semibold mb-4 border-b pb-2">1. Informations client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {isProfessional && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Raison sociale *
              </label>
              <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} required={isProfessional} className={inputFieldClass} />
            </div>
          )}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de client *
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
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
          <div className="w-full">
            <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">Adresse de facturation *</label>
            <textarea 
              id="billingAddress" 
              name="billingAddress" 
              value={formData.billingAddress} 
              onChange={handleInputChange} 
              required 
              className={`${inputFieldClass} min-h-[100px] resize-y w-full`}
              placeholder="Entrez votre adresse complète"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
            <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              required 
              className={`${inputFieldClass} ${fieldErrors.phone ? 'border-red-500' : ''}`}
              placeholder="Ex: 06 12 34 56 78"
            />
            {fieldErrors.phone && (
              <p className="mt-2 text-sm text-red-600">
                Veuillez entrer un numéro de téléphone valide (format français)
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
              className={`${inputFieldClass} ${fieldErrors.email ? 'border-red-500' : ''}`}
            />
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600">
                Veuillez entrer une adresse email valide
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Event Info */}
        <h3 className="text-lg text-violet-800 font-semibold mb-4 border-b pb-2">2. Informations sur l'événement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">Date de l'événement *</label>
            <input 
              type="date" 
              id="eventDate" 
              name="eventDate" 
              value={formData.eventDate} 
              onChange={handleInputChange} 
              required 
              className={inputFieldClass} 
            />
          </div>
          <div>
            <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 mb-1">Durée de location *</label>
            <input type="text" id="eventDuration" name="eventDuration" value={formData.eventDuration} onChange={handleInputChange} required placeholder="Ex: 1 jour, Week-end, 3 jours" className={inputFieldClass} />
          </div>
          <div>
            <label htmlFor="eventStartTime" className="block text-sm font-medium text-gray-700 mb-1">Heure de début *</label>
            <input 
              type="time" 
              id="eventStartTime" 
              name="eventStartTime" 
              value={formData.eventStartTime} 
              onChange={handleInputChange} 
              required 
              className={`${inputFieldClass} ${fieldErrors.timeSlot ? 'border-red-500' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="eventEndTime" className="block text-sm font-medium text-gray-700 mb-1">Heure de fin *</label>
            <input 
              type="time" 
              id="eventEndTime" 
              name="eventEndTime" 
              value={formData.eventEndTime} 
              onChange={handleInputChange} 
              required 
              className={`${inputFieldClass} ${fieldErrors.timeSlot ? 'border-red-500' : ''}`}
            />
            {fieldErrors.timeSlot && (
              <p className="mt-2 text-sm text-red-600">
                L'heure de fin doit être après l'heure de début
              </p>
            )}
          </div>
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités (approximatif) *</label>
            <input 
              type="number" 
              id="guestCount" 
              name="guestCount" 
              value={formData.guestCount} 
              onChange={handleInputChange} 
              required 
              min="1" 
              className={`${inputFieldClass} ${fieldErrors.guestCount ? 'border-red-500' : ''}`}
            />
            {fieldErrors.guestCount && (
              <p className="mt-2 text-sm text-red-600">
                Le nombre d'invités doit être supérieur à 0
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de l'événement *</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="inline-flex items-center">
                <input type="radio" name="eventLocation" value="Intérieur" checked={formData.eventLocation === 'Intérieur'} onChange={handleInputChange} className="form-radio" required />
                <span className="ml-2">Intérieur</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="eventLocation" value="Extérieur" checked={formData.eventLocation === 'Extérieur'} onChange={handleInputChange} className="form-radio" />
                <span className="ml-2">Extérieur</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Delivery/Pickup */}
        <h3 className="text-lg text-violet-800 font-semibold mb-4 border-b pb-2">3. Livraison / Retrait</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de récupération/livraison *
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="inline-flex items-center">
                <input type="radio" name="deliveryType" value="pickup" checked={formData.deliveryType === 'pickup'} onChange={handleInputChange} className="form-radio" required />
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
              <input type="date" id="pickupDate" name="pickupDate" value={formData.pickupDate} onChange={handleInputChange} required={!isDelivery} className={inputFieldClass} />
            </div>
          )}

          {/* Delivery Fields (Conditional) */}
          {isDelivery && (
            <>
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">Date de livraison *</label>
                <input 
                  type="date" 
                  id="deliveryDate" 
                  name="deliveryDate" 
                  value={formData.deliveryDate} 
                  onChange={handleInputChange} 
                  required={isDelivery} 
                  className={inputFieldClass} 
                />
                {dateErrors.deliveryAfterEvent && (
                  <p className="mt-2 text-sm text-red-600">
                    La date de livraison ne peut pas être après la date de l'événement
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Créneau horaire de livraison *</label>
                <select name="deliveryTimeSlot" value={formData.deliveryTimeSlot} onChange={handleInputChange} required={isDelivery} className={inputFieldClass}>
                  <option value="before9">Avant 9h</option>
                  <option value="9to13">9h-13h</option>
                  <option value="13to19">13h-19h</option>
                </select>
              </div>
              <div className="w-full">
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison *</label>
                <textarea 
                  id="deliveryAddress" 
                  name="deliveryAddress" 
                  value={formData.deliveryAddress} 
                  onChange={handleInputChange} 
                  required={isDelivery} 
                  className={`${inputFieldClass} min-h-[100px] resize-y w-full`}
                  placeholder="Entrez l'adresse complète de livraison"
                />
              </div>
              <div>
                <label htmlFor="deliveryPostalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal de livraison *</label>
                <input type="text" id="deliveryPostalCode" name="deliveryPostalCode" value={formData.deliveryPostalCode} onChange={handleInputChange} required={isDelivery} className={inputFieldClass} />
              </div>
              <div>
                <label htmlFor="deliveryCity" className="block text-sm font-medium text-gray-700 mb-1">Ville de livraison *</label>
                <input type="text" id="deliveryCity" name="deliveryCity" value={formData.deliveryCity} onChange={handleInputChange} required={isDelivery} className={inputFieldClass} />
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
                    <input type="radio" name="exteriorAccess" value="rue" checked={formData.exteriorAccess === 'rue'} onChange={handleInputChange} className="form-radio" />
                    <span className="ml-2">Rue</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accès intérieur *</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="inline-flex items-center">
                    <input type="radio" name="interiorAccess" value="rdc" checked={formData.interiorAccess === 'rdc'} onChange={handleInputChange} className="form-radio" required={isDelivery}/>
                    <span className="ml-2">Plain-pied</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="interiorAccess" value="escaliers" checked={formData.interiorAccess === 'escaliers'} onChange={handleInputChange} className="form-radio" />
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
                    <input type="number" id="elevatorWidth" name="elevatorWidth" value={formData.elevatorWidth} onChange={handleInputChange} min="0" className={inputFieldClass} />
                  </div>
                  <div>
                    <label htmlFor="elevatorHeight" className="block text-sm font-medium text-gray-700 mb-1">Hauteur ascenseur (cm)</label>
                    <input type="number" id="elevatorHeight" name="elevatorHeight" value={formData.elevatorHeight} onChange={handleInputChange} min="0" className={inputFieldClass} />
                  </div>
                  <div>
                    <label htmlFor="elevatorDepth" className="block text-sm font-medium text-gray-700 mb-1">Profondeur ascenseur (cm)</label>
                    <input type="number" id="elevatorDepth" name="elevatorDepth" value={formData.elevatorDepth} onChange={handleInputChange} min="0" className={inputFieldClass} />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Section 4: Return */}
        <h3 className="text-lg text-violet-800 font-semibold mb-4 border-b pb-2">4. Reprise du matériel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="pickupReturnDate" className="block text-sm font-medium text-gray-700 mb-1">Date de reprise *</label>
            <input 
              type="date" 
              id="pickupReturnDate" 
              name="pickupReturnDate" 
              value={formData.pickupReturnDate} 
              onChange={handleInputChange} 
              required 
              className={inputFieldClass} 
            />
            {dateErrors.pickupBeforeDelivery && (
              <p className="mt-2 text-sm text-red-600">
                La date de reprise ne peut pas être avant la date de livraison
              </p>
            )}
          </div>
          <div> {/* Placeholder pour l'équilibre de la mise en page */} </div>
          <div>
            <label htmlFor="pickupReturnStartTime" className="block text-sm font-medium text-gray-700 mb-1">Début créneau reprise *</label>
            <input type="time" id="pickupReturnStartTime" name="pickupReturnStartTime" value={formData.pickupReturnStartTime} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
          <div>
            <label htmlFor="pickupReturnEndTime" className="block text-sm font-medium text-gray-700 mb-1">Fin créneau reprise *</label>
            <input type="time" id="pickupReturnEndTime" name="pickupReturnEndTime" value={formData.pickupReturnEndTime} onChange={handleInputChange} required className={inputFieldClass} />
          </div>
        </div>

        {/* Section 5: Project Description & Terms */}
        <h3 className="text-lg text-violet-800 font-semibold mb-4 border-b pb-2">5. Votre projet et finalisation</h3>
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description de votre projet (optionnel, max 1000 caractères)
          </label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            maxLength={1000} 
            rows={4} 
            className={`${inputFieldClass} w-full resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors`}
            placeholder="Décrivez votre projet en détail..."
          ></textarea>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Soyez précis pour nous aider à mieux répondre à vos besoins
            </p>
            <p className="text-sm text-gray-500">
              {formData.description.length}/1000 caractères
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={(e) => {
                handleInputChange(e);
                setTermsError(false);
              }}
              className="form-checkbox h-5 w-5 text-primary focus:ring-primary-dark border-gray-300 rounded"
              required
            />
            <span className="ml-2 text-sm text-gray-700">
              J'accepte les <Link to="/terms" target="_blank" className="underline hover:text-primary">conditions générales de location</Link> *
            </span>
          </label>
          {termsError && (
            <p className="mt-2 text-sm text-red-600">
              Vous devez accepter les conditions générales de location pour continuer
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center text-black hover:underline order-2 md:order-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au panier
          </button>
          <button
            type="submit"
            className="btn-primary w-full md:w-auto order-1 md:order-2"
            disabled={!formData.termsAccepted}
          >
            Envoyer ma demande de devis
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;