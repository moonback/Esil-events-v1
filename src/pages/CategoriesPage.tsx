import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { getAllCategories, type Category } from '../services/categoryService';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>('technique');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Fonction pour obtenir le nom d'affichage d'une catégorie
  const getDisplayName = (category: Category) => {
    if (category.slug === 'technique') {
      return 'Son / Light / Video';
    }
    return category.name;
  };

  // Définition des animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Charger les catégories au montage du composant
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
        // Si la catégorie technique n'existe pas, on prend la première catégorie
        if (!data.find(cat => cat.slug === 'technique')) {
          setActiveCategory(data[0]?.slug || null);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Trouver la catégorie active
  const getActiveCategory = () => {
    return categories.find(cat => cat.slug === activeCategory) || null;
  };

  const activeCat = getActiveCategory();
  const activeSubcategories = activeCat?.subcategories || [];

  // Fonction pour gérer le clic sur une catégorie
  const handleCategoryClick = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    setIsMenuOpen(true);
  };

  return (
    <div>
      <SEO 
        title="ESIL Events - Nos Catégories de Produits"
        description="Découvrez notre gamme complète de produits événementiels : mobilier, jeux, signalétique et matériel technique. Location de matériel professionnel pour tous vos événements."
        keywords="catégories événementiel, location matériel, mobilier événementiel, jeux événementiel, signalétique, matériel technique"
        image="/images/logo.png"
      />

      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-20 mb-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div 
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500 opacity-10"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-indigo-500 opacity-10"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 20, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 12,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-1/4 w-40 h-40 rounded-full bg-violet-400 opacity-10"
            animate={{ 
              x: [0, 40, 0], 
              y: [0, 30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <motion.div 
          className="container mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl pt-20  md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Nos produits <span className="text-violet-300">à la location</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
Bienvenue dans notre univers de la location
événementielle !
Que vous organisez une soirée d'entreprise, un mariage, un
salon professionnel ou un anniversaire inoubliable, nous avons
tout ce qu'il vous faut pour créer une ambiance unique et
marquante.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Section Introduction avec design amélioré */}
      <motion.section 
        className="mb-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-12xl mx-auto px-6">
          <div className="relative">
            {/* Formes décoratives */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
            
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
              <motion.h2 
                className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Que recherchez-vous pour votre événement ?
              </motion.h2>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6"
                variants={fadeInUp}
              >
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="flex items-center border-2 border-violet-200 dark:border-violet-800 rounded-full py-3 px-6 hover:bg-violet-50 transition-colors"
                  >
                    {/* <img 
                      src={`/images/icons/${category.slug}.svg`}
                      alt={category.name}
                      className="w-6 h-6 mr-2"
                    /> */}
                    <span className="text-gray-600 dark:text-gray-300">{getDisplayName(category)}</span>
                  </button>
                ))}
              </motion.div>

              {/* Menu déroulant des catégories */}
              {isMenuOpen && activeCat && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-violet-800">{getDisplayName(activeCat)}</h3>
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSubcategories.map((subCategory) => (
                      <div key={subCategory.id} className="space-y-2">
                        <h4 className="font-medium text-violet-700">{subCategory.name}</h4>
                        {subCategory.subsubcategories?.map((subSubCategory) => (
                          <Link
                            key={subSubCategory.id}
                            to={`/products/${activeCat.slug}/${subCategory.slug}/${subSubCategory.slug}`}
                            className="block text-gray-600 hover:text-violet-700 transition-colors"
                          >
                            <span className="text-violet-400 mr-1">•</span> {subSubCategory.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      
    </div>
  );
};

export default CategoriesPage; 