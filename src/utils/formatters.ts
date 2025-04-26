/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate une date en format français
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Date invalide';
  }
};

/**
 * Retourne la classe CSS pour la couleur du statut
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'approved': return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Retourne le libellé du statut
 */
export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'approved': return 'Approuvé';
    case 'rejected': return 'Rejeté';
    case 'completed': return 'Terminé';
    default: return 'Nouveau';
  }
};

/**
 * Retourne le libellé du type de livraison
 */
export const getDeliveryTypeLabel = (type?: string): string => {
  switch (type) {
    case 'pickup': return 'Retrait sur place';
    case 'eco': return 'Livraison standard';
    case 'premium': return 'Livraison premium';
    default: return 'Non spécifié';
  }
};

/**
 * Retourne le libellé du créneau horaire
 */
export const getTimeSlotLabel = (slot?: string): string => {
  switch (slot) {
    case 'before9': return 'Avant 9h';
    case '9to13': return '9h - 13h';
    case '13to19': return '13h - 19h';
    default: return 'Non spécifié';
  }
};

/**
 * Retourne le libellé du type d'accès
 */
export const getAccessLabel = (access?: string): string => {
  switch (access) {
    case 'parking': return 'Parking';
    case 'street': return 'Rue';
    case 'stairs': return 'Escaliers';
    case 'flat': return 'Plain-pied';
    case 'elevator': return 'Ascenseur';
    default: return 'Non spécifié';
  }
};