import { useState } from 'react';
import { FormData } from '../components/cart/types';

const useCheckoutForm = (onSubmitSuccess: () => void) => {
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

    // Description et durée
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
    deliveryTimeSlot: 'before9',
    deliveryAddress: '',
    deliveryPostalCode: '',
    deliveryCity: '',
    exteriorAccess: 'parking',
    interiorAccess: 'flat',
    elevatorWidth: '',
    elevatorHeight: '',
    elevatorDepth: '',

    // Étape 4
    pickupReturnDate: '',
    pickupReturnStartTime: '',
    pickupReturnEndTime: '',

    // Étape 5
    comments: '',
    termsAccepted: false
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Gestion spéciale pour les cases à cocher
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      // Gestion des champs numériques
      const isNumberInput = type === 'number';
      const processedValue = isNumberInput && value !== '' ? parseFloat(value) : value;

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!formData.termsAccepted) {
      alert("Veuillez accepter les conditions générales.");
      return;
    }

    // Marquer le formulaire comme soumis et appeler le callback de succès
    setFormSubmitted(true);
    onSubmitSuccess();
  };

  // Variables pour le rendu conditionnel
  const isDelivery = formData.deliveryType !== 'pickup';
  const isElevator = formData.interiorAccess === 'elevator';
  const isProfessional = formData.customerType === 'professional';

  return {
    formData,
    setFormData,
    formSubmitted,
    setFormSubmitted,
    handleInputChange,
    handleSubmit,
    isDelivery,
    isElevator,
    isProfessional
  };
};

export default useCheckoutForm;