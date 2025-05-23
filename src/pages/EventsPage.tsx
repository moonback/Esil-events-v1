import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAllRealizations, Realization } from '../services/realizationService';
const teamMembers = [
  {
    id: 1,
    name: "Eric",
    role: "Fondateur & CEO",
    image: "/images/personnel/eric.png",
    description: "Depuis plus de 30 ans, Éric accompagne les entreprises et collectivités dans la réussite de leurs événements. Son expertise, sa vision et son exigence sont au cœur de notre engagement qualité. Avec lui, chaque projet commence sur des bases solides.",
    message: "👉 Une question ? Éric est toujours prêt à écouter et conseiller."
  },
  {
    id: 2,
    name: "Amélie",
    role: " Directrice des opérations (COO)",
    image: "/images/personnel/amelie.png",
    description: "Pilier de l'organisation interne, Amélie veille à ce que tout soit parfaitement orchestré, du premier contact à la dernière minute de l'événement. Elle coordonne les équipes et s'assure que tout se déroule dans le respect des délais, du budget et des attentes.",
    message: "👉 Envie d'un événement fluide et bien géré ? Amélie est là pour ça."
  },
  {
    id: 3,
    name: "Virginie",
    role: "Cheffe de projet événementiel",
    image: "/images/personnel/virginie.png",
    description: "Virginie est votre interlocutrice de terrain. Elle transforme vos idées en événements concrets, en encadrant son équipe avec efficacité et bonne humeur. Son sens du détail et son engagement font la différence à chaque étape.",
    message: "👉 Besoin d'un accompagnement personnalisé ? Virginie vous écoute."
  },
  {
    id: 4,
    name: "Équipe Technique",
    role: "Techniciens Événementiels",
    image: "/images/personnel/techniciens.jpg",
    description: "Discrets mais indispensables, nos techniciens assurent l'installation, les réglages et le bon déroulement technique de vos événements. Professionnels, à l'écoute et réactifs, ils sont aussi là pour vous conseiller sur site.",
    message: "👉 Un souci technique ? Ils anticipent avant même qu'il n'apparaisse."
  }
];
export const EventsPage: React.FC = () => {
  const [realizations, setRealizations] = useState<Realization[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les réalisations au montage du composant
  useEffect(() => {
    const fetchRealizations = async () => {
      try {
        const data = await getAllRealizations();
        setRealizations(data);
      } catch (err) {
        console.error('Erreur lors du chargement des réalisations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealizations();
  }, []);

  // Obtenir les catégories uniques
  const uniqueCategories = Array.from(
    new Set(realizations.map(realization => realization.category).filter(Boolean))
  ) as string[];

  // Animation variants
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
  
  const cardHover = {
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Fonction pour obtenir une image aléatoire pour une catégorie
  const getRandomImageForCategory = (category: string): string => {
    const categoryRealizations = realizations.filter(r => r.category === category);
    if (categoryRealizations.length === 0) return '/images/default-category.jpg';
    
    const randomRealization = categoryRealizations[Math.floor(Math.random() * categoryRealizations.length)];
    if (!randomRealization.images || randomRealization.images.length === 0) {
      return '/images/default-category.jpg';
    }
    
    return randomRealization.images[Math.floor(Math.random() * randomRealization.images.length)];
  };

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen overflow-hidden">
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
          
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        </div>
        
        <motion.div 
          className="container-custom mx-auto px-6 text-center relative z-10 py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            ESIL <span className="text-violet-300">Events</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Votre partenaire pour des événements <span className="font-semibold text-white">inoubliables</span>
          </motion.p>
          
          {/* Animated scroll indicator */}
          <motion.div 
            className="mt-16"
            animate={{ 
              y: [0, 10, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <svg className="h-8 w-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
{/* Section Team Members avec des cartes interactives et des animations */}
<motion.section 
        className="mb-32 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Notre équipe</span>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Rencontrez les visages de vos événements
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Découvrez les experts passionnés qui rendent chaque événement unique et mémorable grâce à leur savoir-faire et leur créativité.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {teamMembers.map((member) => (
              <motion.div 
                key={member.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group"
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="relative md:col-span-5 h-full">
                    <div className="h-full min-h-64 bg-gradient-to-br from-violet-600 to-indigo-800 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                    </div>
                  </div>
                  <div className="p-8 md:col-span-7">
                    <div className="flex flex-col h-full">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-violet-600 dark:text-violet-400 font-medium mb-4">{member.role}</p>
                        <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full mb-6"></div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">{member.description}</p>
                      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-violet-600 dark:text-violet-400 font-medium">{member.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* About Section avec design amélioré */}
      <motion.section 
        className="mb-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="container-custom mx-auto px-6 -mt-16 relative z-20">
          <div className="relative">
            {/* Formes décoratives */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
            
            <motion.div 
              className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90"
              variants={fadeInUp}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2 
                className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Créateurs d'expériences mémorables
              </motion.h2>
              
              <div className="space-y-6 text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                <motion.p variants={fadeInUp}>
                  Chez <span className="text-violet-600 font-semibold dark:text-violet-400">ESIL Events</span>, nous transformons vos idées en réalité. Plus qu'une simple agence événementielle, nous sommes des architectes de moments uniques qui marquent les esprits.
                </motion.p>
                
                <motion.p variants={fadeInUp}>
                  Que ce soit pour des séminaires, des soirées d'entreprise, des lancements de produits ou des événements interactifs, nous mettons notre expertise et notre passion à votre service pour créer des expériences sur-mesure.
                </motion.p>
                
                <motion.p variants={fadeInUp}>
                  Notre mission ? Vous offrir une gestion complète de votre projet événementiel, de la conception à la réalisation, en garantissant une expérience fluide et sans stress, où chaque détail est pensé pour émerveiller vos invités.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6 mt-10"
                variants={fadeInUp}
              >
                <div className="flex items-center border-2 border-violet-200 dark:border-violet-800 rounded-full py-3 px-6">
                  <span className="text-violet-600 dark:text-violet-400 font-bold text-xl mr-2">20+</span>
                  <span className="text-gray-600 dark:text-gray-300">années d'expérience</span>
                </div>
                <div className="flex items-center border-2 border-indigo-200 dark:border-indigo-800 rounded-full py-3 px-6">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mr-2">500+</span>
                  <span className="text-gray-600 dark:text-gray-300">événements réalisés</span>
                </div>
                <div className="flex items-center border-2 border-purple-200 dark:border-purple-800 rounded-full py-3 px-6">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xl mr-2">100%</span>
                  <span className="text-gray-600 dark:text-gray-300">satisfaction client</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      

      {/* Methodology Section améliorée */}
      <motion.section 
        className="mb-32 relative overflow-hidden py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transform -skew-y-3"></div>
        
        <div className="container-custom mx-auto px-6 relative z-10 pt-16">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Notre approche</span>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Notre <span className="text-violet-700 dark:text-violet-400">méthodologie</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Créer des événements exceptionnels n'est pas le fruit du hasard
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                step: "1",
                title: "Planification sur-mesure",
                subtitle: "Où tout commence",
                content: [
                  "Avant de lancer la machine, on prend le temps de comprendre vos attentes et vos objectifs. L'idée ? Créer une stratégie claire, parfaitement alignée avec vos envies et l'univers de votre marque.",
                  "Nous discutons, nous brainstormons, nous rêvons ensemble… et surtout, nous sommes à votre écoute pour nous assurer qu'on saisit exactement ce que vous voulez.",
                  "Une fois cette étape validée, vous pouvez être sûr que chaque aspect sera conçu sur-mesure : du lieu à l'animation, tout est fait pour que votre événement soit une expérience marquante."
                ],
                color: "violet"
              },
              {
                step: "2",
                title: "Création et innovation",
                subtitle: "Donnons vie à votre événement",
                content: [
                  "Une fois la planification en place, place à la création et à l'inspiration ! C'est le moment où nous mettons la main à la pâte pour que votre événement ait du panache.",
                  "Chez ESIL Events, nous adorons sortir des sentiers battus. Nous ne nous contentons pas de mettre en place un événement, nous créons un univers unique autour de lui.",
                  "Le storytelling devient notre arme secrète : nous savons comment captiver l'attention, susciter l'émotion, et surtout étonner vos invités."
                ],
                color: "indigo"
              },
              {
                step: "3",
                title: "Exécution parfaite",
                subtitle: "C'est le grand show !",
                content: [
                  "Le grand jour approche… Pas de panique ! Une fois que la créativité a fait son travail, il est temps de passer à la production.",
                  "Repérage des lieux, choix du traiteur, installation des scènes, mise en place des animations - nous nous occupons de tout.",
                  "Vous pourrez vous concentrer sur ce qui compte vraiment : profiter de votre événement pendant que nous gérons le reste avec professionnalisme."
                ],
                color: "purple"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-${item.color}-600`}
                variants={fadeInUp}
                whileHover="hover"
                // variants={cardHover}
              >
                <div className="p-8">
                  <div className={`flex items-center justify-center h-16 w-16 rounded-full bg-${item.color}-50 text-${item.color}-600 mb-6 mx-auto shadow-sm`}>
                    <span className="text-2xl font-bold">{item.step}</span>
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 text-center text-${item.color}-800`}>{item.title}</h3>
                  <h4 className={`text-lg font-medium mb-6 text-center text-${item.color}-600`}>{item.subtitle}</h4>
                  
                  <ul className="space-y-4">
                    {item.content.map((paragraph, pIndex) => (
                      <li key={pIndex} className="flex items-start">
                        <svg className={`flex-shrink-0 h-5 w-5 mt-1 mr-3 text-${item.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{paragraph}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        </motion.section>
          {/* Section des catégories de réalisations */}
      <motion.section 
        className="mb-32 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Nos Réalisations</span>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Découvrez nos <span className="text-violet-700 dark:text-violet-400">catégories</span> d'événements
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Explorez nos différentes catégories d'événements et découvrez comment nous transformons vos idées en réalité.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {uniqueCategories.map((category, index) => (
              <motion.div
                key={category}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link 
                  to={`/realisations?category=${encodeURIComponent(category)}`}
                  className="block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      {/* Image de fond */}
                      <img
                        src={getRandomImageForCategory(category)}
                        alt={category}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Overlay avec gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 to-indigo-900/80" />
                      <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center px-4">
                          {category}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {realizations.filter(r => r.category === category).length} événements
                        </span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-violet-600 dark:text-violet-400"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* Testimonials Carousel */}
      <motion.section className="container-custom mx-auto px-4 md:px-6 mt-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div 
            className="bg-gradient-to-r from-violet-700 to-indigo-800 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative"
            variants={fadeInUp}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('/images/confiance.png')] bg-cover bg-center" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Ils nous ont fait <span className="text-violet-300">confiance</span></h2>
              
              <motion.div 
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
                  <svg className="h-12 w-12 text-violet-300 mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  <p className="text-lg md:text-xl italic mb-8">
                    "ESIL Events a transformé notre séminaire annuel en une expérience inoubliable. Leur attention aux détails et leur créativité ont dépassé toutes nos attentes. Nous les recommandons sans hésitation !"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-white mr-4 overflow-hidden">
                      <img src="https://randomuser.me/api/portraits/women/43.jpg" alt="Client" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold">Sophie Martin</h4>
                      <p className="text-violet-200">Directrice Marketing, TechCorp</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex justify-center mt-8 space-x-2">
                {[1, 2, 3].map((dot) => (
                  <button key={dot} className={`h-2 w-8 rounded-full ${dot === 1 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
        </motion.section>
      {/* Why Choose Us Section */}
      <motion.section className="container-custom mx-auto px-4 md:px-6 mt-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Pourquoi choisir <span className="text-violet-700">ESIL Events</span> ?</h2>
            <div className="w-20 h-1 bg-violet-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Parce que nous ne sommes pas comme les autres !
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                ),
                title: "Planification sur-mesure",
                content: "Pas de 'formules pré-faites'. Nous créons un événement qui vous ressemble et qui dépasse vos attentes !",
                color: "violet"
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                ),
                title: "Créativité sans limites",
                content: "On aime repousser les frontières du possible pour rendre votre événement inoubliable (et fun !).",
                color: "indigo"
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ),
                title: "Exécution parfaite",
                content: "Pas de stress, tout est pris en charge de A à Z, et chaque détail est vérifié pour que vous n'ayez qu'à profiter.",
                color: "green"
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                ),
                title: "Équipe passionnée",
                content: "Des pros du fun, du spectacle et du sérieux en même temps - une équipe qui met tout son cœur dans chaque projet.",
                color: "red"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`bg-white rounded-xl shadow-sm p-8 border-l-4 border-${item.color}-500 hover:shadow-md transition-all duration-300`}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className={`flex items-center mb-6`}>
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-${item.color}-50 text-${item.color}-600 mr-4`}>
                    {item.icon}
                  </div>
                  <h3 className={`text-xl font-bold text-${item.color}-800`}>{item.title}</h3>
                </div>
                <p className="text-gray-600">{item.content}</p>
              </motion.div>
            ))}
          </motion.div>
          </motion.div>
        </motion.section>
      {/* CTA Section */}
      <motion.section className="container-custom mx-auto px-4 md:px-6 mt-32 mb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <motion.div 
            className="bg-gradient-to-r from-violet-900 to-indigo-800 rounded-2xl p-12 text-white text-center relative overflow-hidden"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center" />
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à créer un événement <span className="text-violet-300">inoubliable</span> ?</h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto">
                Contactez-nous dès maintenant pour discuter de votre projet et voyons ensemble comment marquer les esprits !
              </p>
              
              <Link to="/contact">
                <motion.button
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-violet-900 bg-white hover:bg-violet-50 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contactez notre équipe
                  <svg className="ml-3 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </motion.button>
              </Link>
              
              <p className="mt-8 text-violet-200">
                ESIL Events - Là où les idées prennent vie et les événements deviennent légendaires.
              </p>
            </div>
          </motion.div>
          </motion.div>
        </motion.section>
      
      
    </div>
  );
};
