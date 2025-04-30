import { createClient } from '@supabase/supabase-js';

export interface SitemapEntry {
  id: string;
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/**
 * Récupère le contenu du fichier sitemap.xml
 */
export const getSitemap = async (): Promise<string> => {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabaseClient
      .from('site_config')
      .select('value')
      .eq('key', 'sitemap')
      .single();

    if (error) throw error;
    if (!data?.value) {
      throw new Error('Sitemap non trouvé dans la base de données');
    }

    return data.value;
  } catch (error) {
    console.error('Erreur dans getSitemap:', error);
    throw error;
  }
};

/**
 * Parse le contenu XML du sitemap et retourne un tableau d'entrées
 */
export const parseSitemapXml = (xmlContent: string): SitemapEntry[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Extraire les entrées
    const urlElements = xmlDoc.getElementsByTagName('url');
    const entries: SitemapEntry[] = [];
    
    for (let i = 0; i < urlElements.length; i++) {
      const urlElement = urlElements[i];
      const loc = urlElement.getElementsByTagName('loc')[0]?.textContent || '';
      const lastmod = urlElement.getElementsByTagName('lastmod')[0]?.textContent || '';
      const changefreq = urlElement.getElementsByTagName('changefreq')[0]?.textContent || '';
      const priority = urlElement.getElementsByTagName('priority')[0]?.textContent || '';
      
      entries.push({
        id: `entry-${i}`,
        loc,
        lastmod,
        changefreq,
        priority
      });
    }
    
    return entries;
  } catch (error) {
    console.error('Erreur dans parseSitemapXml:', error);
    throw error;
  }
};

/**
 * Génère le contenu XML du sitemap à partir d'un tableau d'entrées
 */
export const generateSitemapXml = (entries: SitemapEntry[]): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

/**
 * Sauvegarde le contenu du sitemap via l'API
 */
export const saveSitemap = async (sitemapXml: string): Promise<void> => {
  try {
    if (!sitemapXml || typeof sitemapXml !== 'string') {
      throw new Error('Le contenu du sitemap est invalide');
    }

    // Valider le format XML
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sitemapXml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('Le format XML du sitemap est invalide');
      }
    } catch (xmlError) {
      console.error('Erreur de validation XML:', xmlError);
      throw new Error('Le format XML du sitemap est invalide');
    }

    // Utilisation de Supabase pour stocker la configuration
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Configuration Supabase manquante');
    }

    // Vérifier si la table site_config existe et est accessible
    const { data: checkData, error: checkError } = await supabaseClient
      .from('site_config')
      .select('count')
      .single();

    if (checkError) {
      console.error('Erreur lors de la vérification de la table site_config:', checkError);
      throw new Error(`Erreur d'accès à la base de données: ${checkError.message}`);
    }

    // Sauvegarder le sitemap dans Supabase
    const { error: upsertError } = await supabaseClient
      .from('site_config')
      .upsert({ key: 'sitemap', value: sitemapXml }, { onConflict: 'key' });

    if (upsertError) {
      console.error('Erreur lors de l\'upsert dans site_config:', upsertError);
      throw new Error(`Erreur lors de la sauvegarde dans la base de données: ${upsertError.message}`);
    }

    // Mise à jour du fichier physique via l'API
    const response = await fetch('/api/admin/sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/json'
      },
      body: sitemapXml
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur de l\'API lors de la sauvegarde du sitemap:', errorData);
      throw new Error(`Erreur lors de la sauvegarde du sitemap: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur dans saveSitemap:', error);
    throw error;
  }
};