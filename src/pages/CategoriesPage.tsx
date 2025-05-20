import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const CategoriesPage: React.FC = () => {
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

  return (
    <div>
      <SEO 
        title="ESIL Events - Nos Catégories de Produits"
        description="Découvrez notre gamme complète de produits événementiels : mobilier, jeux, signalétique et matériel technique. Location de matériel professionnel pour tous vos événements."
        keywords="catégories événementiel, location matériel, mobilier événementiel, jeux événementiel, signalétique, matériel technique"
        image="/images/logo.png"
      />

      <motion.section 
        className="section bg-gray-100 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Forme décorative en arrière-plan */}
        <div className="absolute inset-0 bg-black transform -skew-y-3"></div>
        
        <div className="container-custom relative z-10 py-16">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 uppercase tracking-wider mb-2">Nos catégories</span>
            <h2 className="text-3xl text-white md:text-4xl font-bold mb-6 text-center">
              Découvrez nos catégories de produits
            </h2>
            <p className="text-center text-white mb-6 max-w-3xl mx-auto text-gray-600">
              ESIL Events met à votre disposition une large gamme d'équipements professionnels, disponibles en location avec ou sans installation, pour tous vos événements !
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mobilier & Deco */}
            <Link to="/products/mobilier" className="block">
              <motion.div 
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="\images\3.png" 
                    alt="Mobilier & Déco" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-violet-700 group-hover:text-violet-800 transition-colors">MOBILIER & DECO</h3>
                  <p className="text-sm mb-4 text-gray-600">
                    Offrez à vos invités une ambiance unique avec notre sélection de mobilier et de décoration en location : tables, chaises, mobiliers lumineux, décorations thématiques (vintage, fête foraine, super-héros...). Créez un cadre mémorable pour vos événements !
                  </p>
                  <div className="flex items-center text-violet-600 font-medium hover:text-violet-800 transition-colors">
                    Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Jeux */}
            <Link to="/products/jeux" className="block">
              <motion.div 
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="\images\1.png" 
                    alt="Jeux" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-indigo-700 group-hover:text-indigo-800 transition-colors">JEUX</h3>
                  <p className="text-sm mb-4 text-gray-600">
                    Offrez à vos invités une expérience
                    ludique inoubliable avec notre gamme
                    de jeux en location : bornes d'arcade,
                    baby-foot, flippers, air hockey, coups de
                    poing, paniers de basket et même des
                    machines à pinces pour distribuer des
                    cadeaux. Des animations fun et
                    interactives qui feront le succès de votre
                    événement !                
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Signalétique */}
            <Link to="/products/signaletique" className="block">
              <motion.div 
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="\images\2.png" 
                    alt="Signalétique" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-purple-700 group-hover:text-purple-800 transition-colors">SIGNALETIQUE</h3>
                  <p className="text-sm mb-4 text-gray-600">
                    Facilitez l'orientation de vos invités avec
                    notre matériel de signalétique :
                    panneaux directionnels, totems, stands,
                    et banderoles sur mesure. Idéal pour
                    vos salons, lancements de produits et
                    autres événements professionnels, pour
                    une communication claire et impactante.                
                  </p>
                  <div className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors">
                    Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Technique */}
            <Link to="/products/technique" className="block">
              <motion.div 
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="\images\4.png" 
                    alt="Technique" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-fuchsia-700 group-hover:text-fuchsia-800 transition-colors">TECHNIQUE</h3>
                  <p className="text-sm mb-4 text-gray-600">
                    Mettez en lumière vos événements avec
                    notre matériel technique : éclairage,
                    sonorisation, vidéo et scènes. Parfait
                    pour des prises de parole, conférences,
                    concerts ou soirées dansantes, nous
                    vous fournissons tout le nécessaire pour
                    garantir le succès de vos animations.                
                  </p>
                  <div className="flex items-center text-fuchsia-600 font-medium hover:text-fuchsia-800 transition-colors">
                    Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CategoriesPage; 