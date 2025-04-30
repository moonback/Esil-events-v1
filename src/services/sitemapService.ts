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
    const response = await fetch('/sitemap.xml');
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du sitemap: ${response.status}`);
    }
    return await response.text();
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
    // Utilisation de Supabase pour stocker la configuration
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabaseClient
      .from('site_config')
      .upsert({ key: 'sitemap', value: sitemapXml }, { onConflict: 'key' });

    if (error) throw error;

    // Dans un environnement de production, vous devriez également mettre à jour le fichier physique
    // Cela nécessiterait un endpoint API côté serveur
    const response = await fetch('/api/admin/sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: sitemapXml
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la sauvegarde du sitemap: ${response.status}`);
    }
  } catch (error) {
    console.error('Erreur dans saveSitemap:', error);
    throw error;
  }
};