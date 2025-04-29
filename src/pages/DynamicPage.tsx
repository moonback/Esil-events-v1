import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPageBySlug } from '../services/pageService';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet-async';

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState<{
    title: string;
    content: string;
    meta_description?: string;
    meta_keywords?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const page = await getPageBySlug(slug);
        
        if (!page) {
          setError('Page non trouvée');
          // Rediriger vers la page 404 après un court délai
          setTimeout(() => navigate('/not-found'), 2000);
          return;
        }
        
        // Vérifier si la page est publiée
        if (page.status !== 'published') {
          setError('Cette page n\'est pas disponible actuellement');
          return;
        }
        
        setPageContent({
          title: page.title,
          content: page.content,
          meta_description: page.meta_description,
          meta_keywords: page.meta_keywords
        });
      } catch (err) {
        console.error('Erreur lors du chargement de la page:', err);
        setError('Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
  }, [slug, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
            <p className="mb-10z">Vous allez être redirigé vers la page d'accueil...</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {pageContent && (
        <>
          <Helmet>
            <title>{pageContent.title} | ESIL Events</title>
            {pageContent.meta_description && (
              <meta name="description" content={pageContent.meta_description} />
            )}
            {pageContent.meta_keywords && (
              <meta name="keywords" content={pageContent.meta_keywords} />
            )}
          </Helmet>
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">{pageContent.title}</h1>
            <div className="max-w-7xl mx-auto">
              <div 
                className="prose prose-lg prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: pageContent.content }}
              />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DynamicPage;