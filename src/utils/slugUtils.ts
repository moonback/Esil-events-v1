/**
 * Utilitaires pour la gestion des slugs
 */

/**
 * Génère un slug à partir d'une chaîne de caractères
 * @param text - Le texte à convertir en slug
 * @returns Le slug généré
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques
    .replace(/--+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+/, '') // Supprime les tirets au début
    .replace(/-+$/, ''); // Supprime les tirets à la fin
};

/**
 * Génère un slug unique en ajoutant un suffixe numérique si nécessaire
 * @param baseSlug - Le slug de base
 * @param existingSlugs - Liste des slugs existants
 * @returns Un slug unique
 */
export const generateUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};