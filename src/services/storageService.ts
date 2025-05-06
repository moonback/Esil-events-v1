import { supabase } from './supabaseClient';

// Nom du bucket pour les images de produits et réalisations
export const BUCKET_NAME = 'product-images';

/**
 * Télécharge un fichier vers Supabase Storage et retourne l'URL publique
 * @param file Le fichier à télécharger
 * @param folder Le dossier dans lequel stocker le fichier (ex: 'products', 'realizations')
 * @returns L'URL publique du fichier téléchargé
 */
export const uploadFile = async (file: File, folder: string = 'products'): Promise<string> => {
  try {
    console.log(`Démarrage du téléchargement de l'image: ${file.name} dans le dossier ${folder}`);
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log('Téléchargement du fichier avec le nom:', fileName);

    // Télécharger le fichier
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Erreur de téléchargement:', uploadError);
      if (uploadError.message.includes('row-level security policy')) {
        throw new Error('Vous n\'avez pas la permission de télécharger des images. Veuillez contacter un administrateur.');
      }
      throw new Error(`Erreur lors du téléchargement de l'image: ${uploadError.message}`);
    }

    if (!data) {
      console.error('Aucune donnée retournée lors du téléchargement');
      throw new Error('Erreur lors du téléchargement de l\'image');
    }

    console.log('Téléchargement réussi, récupération de l\'URL publique');

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Impossible de générer l\'URL publique de l\'image');
    }

    console.log('Téléchargement de l\'image terminé:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur dans uploadFile:', error);
    throw error;
  }
};

/**
 * Supprime un fichier de Supabase Storage
 * @param url L'URL publique du fichier à supprimer
 * @returns void
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extraire le chemin du fichier de l'URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Le chemin du fichier est généralement après le nom du bucket dans l'URL
    // Format typique: /storage/v1/object/public/bucket-name/folder/filename.ext
    const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('Format d\'URL non reconnu:', url);
      throw new Error('Format d\'URL non reconnu');
    }
    
    // Reconstruire le chemin relatif du fichier (tout ce qui vient après le nom du bucket)
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    console.log(`Suppression du fichier: ${filePath} du bucket ${BUCKET_NAME}`);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
    
    console.log('Fichier supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteFile:', error);
    throw error;
  }
};

/**
 * Convertit un objet File en base64 pour prévisualisation
 * @param file Le fichier à convertir
 * @returns Une promesse qui résout avec la chaîne base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};