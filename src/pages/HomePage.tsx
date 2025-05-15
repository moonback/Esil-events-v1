import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, CheckCircle, Diamond, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
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
      {/* SEO Component */}
      <SEO 
        title="ESIL Events - Créateur d'Événements Inoubliables"
        description="ESIL Events vous accompagne dans l'organisation de vos événements professionnels et particuliers. Location de matériel, installation, régie son & lumière et animation."
        keywords="événementiel, organisation événements, ESIL Events, location matériel, sonorisation, éclairage, scène, mobilier"
        image="/images/logo.png"
      />
      
      {/* Hero Section with Video and Animated Elements */}
      <section className="relative h-[90vh] sm:h-screen overflow-hidden">
        <video 
          className="header-video w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div 
            className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 sm:w-64 h-32 sm:h-64 rounded-full bg-purple-500 opacity-10"
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
            className="absolute bottom-5 sm:bottom-10 right-10 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-indigo-500 opacity-10"
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
            className="absolute top-20 sm:top-40 right-1/4 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-violet-400 opacity-10"
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
        
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            ESIL <span className="text-violet-300">Créateur d'Événements</span> Inoubliables
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-10 max-w-3xl sm:max-w-4xl lg:max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Votre événement de A à Z : Location, Installation, Régie Son & Lumière, Animation ...
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="relative group w-full sm:w-auto"
            >
              <Link 
                to="/agence-evenementielle" 
                className="bg-black hover:bg-violet-600 text-white inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Notre Agence événementielle
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-20 blur-xl rounded-full transform scale-150 -z-10 group-hover:opacity-30 transition-opacity duration-300" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="relative group w-full sm:w-auto"
            >
              <Link 
                to="/products/" 
                className="bg-violet-600 hover:bg-black text-white inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Nos produits à la location
                <Package className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-20 blur-xl rounded-full transform scale-150 -z-10 group-hover:opacity-30 transition-opacity duration-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section avec design amélioré */}
      <motion.section 
        className="section bg-white relative overflow-hidden py-12 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Formes décoratives */}
          <div className="absolute -top-10 -right-10 w-32 sm:w-64 h-32 sm:h-64 bg-violet-100 rounded-full opacity-50 blur-3xl z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-100 rounded-full opacity-60 blur-3xl z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
                ESIL Events : Partenaire pour des événements d'Entreprise sur-mesure
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Depuis plus de 30 ans, ESIL Events accompagne les entreprises dans la conception et la réalisation de leurs événements professionnels. De la planification stratégique à l'exécution terrain, nous orchestrons chaque détail pour garantir des séminaires d'entreprise, conférences, cérémonies internes et soirées d'exception à la hauteur de vos ambitions.
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Notre expertise couvre aussi la location de matériel événementiel : sonorisation, éclairage, scène, mobilier et signalétique. Grâce à nos solutions clé en main, nous assurons l'installation, la régie son & lumière et la coordination de vos prestations pour un événement sans fausse note.
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-start gap-6 mt-8"
                variants={fadeInUp}
              >
                <div className="flex items-center border-2 border-violet-200 rounded-full py-3 px-6">
                  <span className="text-violet-600 font-bold text-xl mr-2">30+</span>
                  <span className="text-gray-600">années d'expérience</span>
                </div>
                <div className="flex items-center border-2 border-indigo-200 rounded-full py-3 px-6">
                  <span className="text-indigo-600 font-bold text-xl mr-2">1000+</span>
                  <span className="text-gray-600">événements réalisés</span>
                </div>
              </motion.div>
            </motion.div>
            <motion.div 
              variants={scaleIn}
              className="relative"
            >
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg opacity-30 blur-sm transform rotate-3"></div>
              <img 
                src="\images\esil-events.JPG" 
                alt="Événement d'entreprise" 
                className="rounded-lg shadow-xl w-full h-auto relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Products Section avec animations */}
      <motion.section 
        className="section bg-gray-100 relative overflow-hidden py-12 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Forme décorative en arrière-plan */}
        <div className="absolute inset-0 bg-black transform -skew-y-3"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-xs sm:text-sm font-semibold text-violet-600 uppercase tracking-wider mb-2 sm:mb-3">Nos produits</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center text-white">
              Louez votre matériel évènementiel !
            </h2>
            <p className="text-center text-gray-300 mb-6 max-w-2xl sm:max-w-3xl mx-auto text-sm sm:text-base">
              ESIL Events met à votre disposition une large gamme d'équipements professionnels, disponibles en location avec ou sans installation, pour tous vos événements !
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Mobilier & Deco */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-40 sm:h-48 overflow-hidden relative">
                <img 
                  src="\images\3.png" 
                  alt="Mobilier & Déco" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-violet-700 group-hover:text-violet-800 transition-colors">MOBILIER & DECO</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-600">
                  Offrez à vos invités une ambiance unique avec notre sélection de mobilier et de décoration en location : tables, chaises, mobiliers lumineux, décorations thématiques (vintage, fête foraine, super-héros...). Créez un cadre mémorable pour vos événements !
                </p>
                <Link to="/products/mobilier" className="flex items-center text-violet-600 font-medium hover:text-violet-800 transition-colors text-sm sm:text-base">
                  Découvrir <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Jeux */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-40 sm:h-48 overflow-hidden relative">
                <img 
                  src="\images\1.png" 
                  alt="Jeux" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-indigo-700 group-hover:text-indigo-800 transition-colors">JEUX</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-600">
                  Offrez à vos invités une expérience ludique inoubliable avec notre gamme de jeux en location : bornes d'arcade, baby-foot, flippers, air hockey, coups de poing, paniers de basket et même des machines à pinces pour distribuer des cadeaux. Des animations fun et interactives qui feront le succès de votre événement !
                </p>
                <Link to="/products/jeux" className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors text-sm sm:text-base">
                  Découvrir <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Signalétique */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-40 sm:h-48 overflow-hidden relative">
                <img 
                  src="\images\2.png" 
                  alt="Signalétique" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-purple-700 group-hover:text-purple-800 transition-colors">SIGNALETIQUE</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-600">
                  Facilitez l'orientation de vos invités avec notre matériel de signalétique : panneaux directionnels, totems, stands, et banderoles sur mesure. Idéal pour vos salons, lancements de produits et autres événements professionnels, pour une communication claire et impactante.
                </p>
                <Link to="/products/signaletique" className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors text-sm sm:text-base">
                  Découvrir <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Technique */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-40 sm:h-48 overflow-hidden relative">
                <img 
                  src="\images\4.png" 
                  alt="Technique" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-fuchsia-700 group-hover:text-fuchsia-800 transition-colors">TECHNIQUE</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-600">
                  Mettez en lumière vos événements avec notre matériel technique : éclairage, sonorisation, vidéo et scènes. Parfait pour des prises de parole, conférences, concerts ou soirées dansantes, nous vous fournissons tout le nécessaire pour garantir le succès de vos animations.
                </p>
                <Link to="/products/technique" className="flex items-center text-fuchsia-600 font-medium hover:text-fuchsia-800 transition-colors text-sm sm:text-base">
                  Découvrir <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact CTA Section avec design amélioré */}
      <motion.section 
        className="section relative overflow-hidden py-12 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative overflow-hidden">
            {/* Background avec dégradé animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-700 overflow-hidden rounded-xl">
              <motion.div 
                className="absolute top-0 left-0 right-0 bottom-0 opacity-20"
                animate={{ 
                  background: [
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)",
                    "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)",
                    "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)",
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)"
                  ]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Contenu du CTA */}
            <div className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 md:px-12 text-center">
              <motion.div
                variants={fadeInUp}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Prêt à créer un événement <span className="text-violet-200">inoubliable</span> ?
                </h2>
                <p className="text-white text-base sm:text-lg mb-6 sm:mb-8 opacity-90">
                  Contactez notre équipe d'experts pour discuter de votre projet et obtenir un devis personnalisé. Nous vous accompagnons dans chaque étape de votre événement.  
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Link to="/contact" className="btn-primary inline-flex items-center justify-center w-full sm:w-auto">
                      Demander un devis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <a href="tel:+33620461385" className="btn-secondary inline-flex items-center justify-center w-full sm:w-auto">
                      Nous appeler
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
