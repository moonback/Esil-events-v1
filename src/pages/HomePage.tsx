import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, Package, Truck } from 'lucide-react';
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
      <Helmet>
        <title>ESIL Events | Location de Matériel Événementiel & Agence Événementielle</title>
        <meta name="description" content="ESIL Events, votre partenaire événementiel depuis 30 ans. Location de matériel, organisation d'événements d'entreprise, solutions clé en main pour vos événements professionnels." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ESIL Events | Location de Matériel Événementiel & Agence Événementielle" />
        <meta property="og:description" content="Location de matériel événementiel et organisation d'événements professionnels. Sonorisation, éclairage, mobilier et plus encore." />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://esil-events.fr" />
        
        
        {/* Additional SEO tags */}
        <meta name="keywords" content="location matériel événementiel, agence événementielle, sonorisation, éclairage, mobilier événementiel, organisation événement entreprise, location jeux, signalétique événementielle" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ESIL Events" />
        <link rel="canonical" href="https://esil-events.fr" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ESIL Events",
            "description": "Location de matériel événementiel et organisation d'événements professionnels",
            "url": "https://esil-events.fr",
            "logo": "https://esil-events.fr/images/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33-620-461-385",
              "contactType": "customer service",
              "areaServed": "FR",
              "availableLanguage": "French"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mantes-la-Ville",
              "addressRegion": "Île-de-France",
              "addressCountry": "FR"
            },
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61574583021091",
              "https://www.instagram.com/esil-events"
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Section with Video and Animated Elements */}
      <section className="relative h-screen overflow-hidden">
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
        
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            ESIL <span className="text-violet-300">Créateur d'Événements</span> Inoubliables
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white mb-8 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Votre événement de A à Z : Location, Installation, Régie Son & Lumière, Animation
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link 
                to="/agence-evenementielle" 
                className="btn-primary inline-flex items-center gap-2 group"
              >
                Notre Agence évènementielle
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="absolute inset-0 bg-violet-400 opacity-20 blur-lg rounded-full transform scale-150 -z-10" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link 
                to="/products/" 
                className="btn-secondary inline-flex items-center gap-2 group"
              >
                Nos produits à la location
                <Package className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="absolute inset-0 bg-indigo-400 opacity-20 blur-lg rounded-full transform scale-150 -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section avec design amélioré */}
      <motion.section 
        className="section bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="container-custom relative z-10">
          {/* Formes décoratives */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 blur-3xl z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 blur-3xl z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
                ESIL Events : Partenaire pour des événements d'Entreprise sur-mesure
              </h2>
              <p className="mb-4 text-gray-600">
                Depuis plus de 30 ans, ESIL Events accompagne les entreprises dans la conception et la réalisation de leurs événements professionnels. De la planification stratégique à l'exécution terrain, nous orchestrons chaque détail pour garantir des séminaires d'entreprise, conférences, cérémonies internes et soirées d'exception à la hauteur de vos ambitions.
              </p>
              <p className="text-gray-600">
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
                src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Événement d'entreprise" 
                className="rounded-lg shadow-xl w-full h-auto relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Products Section avec animations */}
      <motion.section 
        className="section bg-gray-100 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Forme décorative en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 transform -skew-y-3"></div>
        
        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 uppercase tracking-wider mb-2">Nos produits</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Louez votre <span className="text-violet-700">matériel évènementiel</span> !
            </h2>
            <p className="text-center mb-6 max-w-3xl mx-auto text-gray-600">
              ESIL Events met à votre disposition une large gamme d'équipements professionnels, disponibles en location avec ou sans installation, pour tous vos événements !
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mobilier & Deco */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                <Link to="/products/mobilier" className="flex items-center text-violet-600 font-medium hover:text-violet-800 transition-colors">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Jeux */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                <Link to="/products/jeux" className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Signalétique */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1588412079929-790b9f593d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                <Link to="/products/signaletique" className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Technique */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
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
                <Link to="/products/technique" className="flex items-center text-fuchsia-600 font-medium hover:text-fuchsia-800 transition-colors">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact CTA Section avec design amélioré */}
      <motion.section 
        className="section relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container-custom">
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
                  duration: 15, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="relative z-10 py-16 px-8 md:py-24 md:px-12">
              <div className="max-w-4xl mx-auto text-center">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight"
                  variants={fadeInUp}
                >
                  Parlons de votre <span className="text-violet-200">projet</span> !
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-violet-100 mb-12 font-light"
                  variants={fadeInUp}
                >
                  Chaque événement est unique et mérite une exécution parfaite. Chez ESIL Events, nous transformons vos idées en expériences marquantes, en combinant créativité, expertise technique et gestion rigoureuse.
                  <br /><br />
                  <span className="font-semibold">Vous avez un projet en tête ? Discutons-en et créons ensemble un événement à la hauteur de vos ambitions.</span>
                </motion.p>
                
                <motion.div 
                  className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
                  variants={fadeInUp}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/contact" 
                      className="bg-white text-violet-700 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
                    >
                      <span>Discuter de mon événement</span>
                      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </motion.div>
                  
                  <motion.a 
                    href="tel:+33620461385" 
                    className="text-white border-2 border-white hover:bg-white hover:text-violet-700 px-8 py-4 rounded-full font-bold flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>Nous appeler</span>
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Delivery Options Section avec animations */}
      <motion.section 
        className="section bg-gray-100 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Forme décorative en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 transform skew-y-2"></div>
        
        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 uppercase tracking-wider mb-2">Nos services</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="text-violet-700">Livraison et installation</span> du matériel événementiel : 3 formules au choix !
            </h2>
            <p className="mb-6 max-w-4xl mx-auto text-center text-gray-600">
              Chez ESIL Events, nous vous proposons trois solutions adaptées à vos besoins pour la livraison et l'installation de votre matériel événementiel. Que ce soit pour une soirée d'exception, un séminaire d'entreprise, une conférence ou toute autre manifestation professionnelle, choisissez la formule qui vous convient :
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Option 1 */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-r from-violet-600 to-violet-800 text-white p-4 flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-violet-700">Retrait sur place</h2>
                <p className="text-green-600 font-bold mb-4">Gratuit</p>
                <p className="mb-4 text-gray-600">
                  Récupérez votre matériel directement dans notre entrepôt à Mantes-la-Ville. Du lundi au vendredi de 9h30 à 12h et 14h15 à 16h.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Économique</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Flexible sur les horaires</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Vérification du matériel sur place</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500">
                  Prévoir un véhicule adapté au volume du matériel loué.
                </p>
              </div>
            </motion.div>

            {/* Option 2 */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-indigo-700">Livraison Économique</h2>
                <p className="text-gray-600 font-bold mb-4">Sur devis</p>
                <p className="mb-4 text-gray-600">
                  Nous livrons sur site et vous participez au déchargement si nécessaire. Pensez à vérifier les accès (escaliers, ascenseurs, largeur des portes…).
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Livraison à l'adresse de votre choix</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Solution intermédiaire économique</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Idéal pour les petites quantités</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500">
                  Tarif variable selon la distance et le volume.
                </p>
              </div>
            </motion.div>

            {/* Option 3 */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              variants={scaleIn}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-purple-700">Formule Premium</h2>
                <p className="text-gray-600 font-bold mb-4">Sur devis</p>
                <p className="mb-4 text-gray-600">
                  Service clé en main : livraison, installation et démontage pris en charge par nos techniciens événementiels 7j/7 et 24h/24, partout en France.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Installation complète par nos techniciens</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Démontage et récupération inclus</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Assistance technique pendant l'événement</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">Idéal pour les installations complexes</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500">
                  Des frais supplémentaires peuvent s'appliquer pour les interventions de nuit, le week-end ou les longues distances.
                </p>
              </div>
            </motion.div>
          </div>

          <p className="mt-8 text-center text-sm">
            Des frais supplémentaires peuvent s'appliquer pour les interventions de nuit, le week-end ou les longues distances.
          </p>

          {/* <div className="text-center mt-8">
            <Link to="/delivery" className="btn-secondary inline-block">
              En savoir plus
            </Link>
          </div> */}
        </div>
      </motion.section>

      {/* Contact CTA Section avec design amélioré */}
      <motion.section 
        className="section relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container-custom">
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
                  duration: 15, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Contenu du CTA */}
            <div className="relative z-10 py-16 px-6 md:px-12 text-center">
              <motion.div
                variants={fadeInUp}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Prêt à créer un événement <span className="text-violet-200">inoubliable</span> ?
                </h2>
                <p className="text-white text-lg mb-8 opacity-90">
                  Contactez notre équipe d'experts pour discuter de votre projet et obtenir un devis personnalisé. Nous vous accompagnons dans chaque étape de votre événement.  
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/contact" className="btn-primary inline-flex items-center">
                      Demander un devis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <a href="tel:+33620461385" className="btn-secondary inline-flex items-center">
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
