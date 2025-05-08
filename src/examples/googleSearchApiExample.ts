/**
 * Exemple d'utilisation de l'API Google Custom Search
 * 
 * Ce fichier montre comment utiliser l'API Google Custom Search pour rechercher
 * la position d'un site web pour un mot-clé donné.
 */

import { GOOGLE_SEARCH_CONFIG, isGoogleSearchConfigValid } from '../config/googleSearchApi';

/**
 * Recherche un mot-clé avec l'API Google Custom Search et affiche les résultats
 * @param keyword Le mot-clé à rechercher
 * @param domain Le domaine à rechercher dans les résultats
 */
async function searchKeywordExample(keyword: string, domain: string): Promise<void> {
  console.log(`Recherche du mot-clé "${keyword}" pour le domaine "${domain}"...`);
  
  // Vérifier si la configuration est valide
  if (!isGoogleSearchConfigValid()) {
    console.error('Configuration API invalide. Veuillez configurer GOOGLE_SEARCH_API_KEY et GOOGLE_SEARCH_ENGINE_ID dans le fichier .env');
    return;
  }
  
  try {
    // Construire l'URL de l'API
    const searchUrl = new URL(GOOGLE_SEARCH_CONFIG.BASE_URL);
    searchUrl.searchParams.append('key', GOOGLE_SEARCH_CONFIG.API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_SEARCH_CONFIG.SEARCH_ENGINE_ID);
    searchUrl.searchParams.append('q', keyword);
    searchUrl.searchParams.append('num', GOOGLE_SEARCH_CONFIG.MAX_RESULTS.toString());
    
    console.log(`URL de l'API: ${searchUrl.toString()}`);
    
    // Effectuer la requête
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API:', errorData);
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Afficher les informations de recherche
    console.log('Informations de recherche:');
    console.log(`- Nombre total de résultats: ${data.searchInformation?.totalResults || 'N/A'}`);
    console.log(`- Temps de recherche: ${data.searchInformation?.searchTime || 'N/A'} secondes`);
    
    // Vérifier si des résultats ont été trouvés
    if (!data.items || data.items.length === 0) {
      console.log('Aucun résultat trouvé');
      return;
    }
    
    // Afficher les résultats
    console.log('\nRésultats de recherche:');
    data.items.forEach((item: any, index: number) => {
      console.log(`\n[${index + 1}] ${item.title}`);
      console.log(`URL: ${item.link}`);
      console.log(`Extrait: ${item.snippet}`);
      
      // Vérifier si ce résultat correspond au domaine recherché
      if (item.link.includes(domain)) {
        console.log(`✅ TROUVÉ! Le domaine ${domain} est en position ${index + 1}`);
      }
    });
    
    // Rechercher la position du domaine
    let position = 0;
    for (let i = 0; i < data.items.length; i++) {
      if (data.items[i].link.includes(domain)) {
        position = i + 1;
        break;
      }
    }
    
    // Afficher le résultat final
    if (position > 0) {
      console.log(`\n✅ Le domaine ${domain} est en position ${position} pour le mot-clé "${keyword}"`);
    } else {
      console.log(`\n❌ Le domaine ${domain} n'a pas été trouvé dans les ${GOOGLE_SEARCH_CONFIG.MAX_RESULTS} premiers résultats pour le mot-clé "${keyword}"`);
    }
    
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
  }
}

// Exemple d'utilisation
// Pour exécuter cet exemple, utilisez: ts-node googleSearchApiExample.ts
// searchKeywordExample('location matériel événementiel', 'esil-events.com');