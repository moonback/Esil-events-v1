import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, Settings, CheckCircle, Phone, MapPin, Calendar, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const DeliveryPage: React.FC = () => {
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
  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 min-h-screen overflow-hidden">
      <SEO 
        title="Livraison & Installation Événementielle Professionnelle | ESIL Events"
        description="Service complet de livraison et installation de matériel événementiel en Île-de-France et partout en France. 3 formules adaptées : Retrait sur place, Livraison Économique et Solution Premium clé en main."
        keywords="livraison événementielle, installation matériel événementiel, logistique événementielle, retrait sur place Mantes-la-Ville, formule premium événement, livraison économique, transport équipements événements, France entière"
      />
      {/* Hero Section avec background animé */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white py-12 md:py-20 mb-8 md:mb-16 relative overflow-hidden"
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
          className="container-custom mx-auto px-4 md:px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Livraison & <span className="text-violet-300">Installation</span> Professionnelle
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto font-light px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Des solutions logistiques complètes pour vos événements en Île-de-France et partout en France
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="container-custom mx-auto px-4 md:px-6">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Les Solutions de livraison et d'installation de matériel événementiel chez ESIL Events</h2>
          <p className="text-base md:text-lg mb-4 md:mb-6">
            Chez ESIL Events, nous comprenons l'importance d'une logistique événementielle fluide et fiable.
          </p>
          <div className="w-20 h-1 bg-black mx-auto"></div>
        </div>
        
        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {/* Option 1 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-violet-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-48 md:h-56 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                <div className="text-white transform scale-150 opacity-30">
                  <Package className="w-24 h-24" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full p-5 shadow-lg text-violet-600 transform group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-violet-600 group-hover:text-violet-700 dark:text-violet-400 transition-colors duration-300">
                Retrait sur place
              </h3>
              <p className="text-green-600 font-bold mb-3 md:mb-4 text-base md:text-lg">Gratuit</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                Récupérez votre matériel directement dans notre entrepôt à Mantes-la-Ville.
              </p>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Économique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Flexible sur les horaires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Vérification du matériel sur place</span>
                </li>
              </ul>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Prévoir un véhicule adapté au volume du matériel loué.
              </p>
            </div>
          </motion.div>
          
          {/* Option 2 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-indigo-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-48 md:h-56 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
                <div className="text-white transform scale-150 opacity-30">
                  <Truck className="w-24 h-24" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full p-5 shadow-lg text-indigo-600 transform group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 transition-colors duration-300">
                Livraison Économique
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-bold mb-3 md:mb-4 text-base md:text-lg">Sur devis</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                Nous livrons sur site et vous participez au déchargement si nécessaire. Pensez à vérifier les accès (escaliers, ascenseurs, largeur des portes…).
              </p>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Livraison à l'adresse de votre choix</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Solution intermédiaire économique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Idéal pour les petites quantités</span>
                </li>
              </ul>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Tarif variable selon la distance et le volume.
              </p>
            </div>
          </motion.div>
          
          {/* Option 3 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-purple-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-48 md:h-56 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <div className="text-white transform scale-150 opacity-30">
                  <Truck className="w-24 h-24" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full p-5 shadow-lg text-purple-600 transform group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-purple-600 group-hover:text-purple-700 dark:text-purple-400 transition-colors duration-300">
                Formule Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-bold mb-3 md:mb-4 text-base md:text-lg">Sur devis</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
                Service clé en main : livraison, installation et démontage pris en charge par nos techniciens événementiels 7j/7 et 24h/24, partout en France.
              </p>
              <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Installation complète par nos techniciens</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Démontage et récupération inclus</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Assistance technique pendant l'événement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Idéal pour les installations complexes</span>
                </li>
              </ul>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Des frais supplémentaires peuvent s'appliquer pour les interventions de nuit, le week-end ou les longues distances.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Detailed Information */}
      <motion.section 
        className="mb-20 md:mb-32 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-12xl mx-auto">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Informations pratiques</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white">
              Tout ce que vous devez <span className="text-violet-700 dark:text-violet-400">savoir</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20">
            {/* Delivery Process */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                <Clock className="w-6 h-6 md:w-7 md:h-7 mr-3 text-violet-600" />
                Nos délais de livraison
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Pour garantir la disponibilité du matériel et une livraison dans les meilleures conditions, nous
                vous recommandons de réserver votre matériel selon les délais suivants :
              </p>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">1</div>
                    <div className="w-0.5 h-full bg-gradient-to-b from-violet-600 to-indigo-600 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Réservation</h3>
                    <p className="text-gray-600 dark:text-gray-300">Réservez au moins 72h à l'avance (1 semaine pour la formule premium). Périodes de pointe : réservez plusieurs semaines à l'avance.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">2</div>
                    <div className="w-0.5 h-full bg-gradient-to-b from-violet-600 to-indigo-600 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Préparation</h3>
                    <p className="text-gray-600 dark:text-gray-300">Nous préparons votre matériel et vous contactons pour confirmer les détails de livraison.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">3</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Livraison/Installation</h3>
                    <p className="text-gray-600 dark:text-gray-300">Notre équipe intervient selon le créneau convenu pour livrer ou installer votre matériel.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Important Notes */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                <HardHat className="w-7 h-7 mr-3 text-orange-500" />
                Informations techniques
              </h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                    <MapPin className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Zones d'intervention</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Île-de-France : livraison sans majoration. Province : supplément kilométrique selon distance. Nous intervenons dans toute la France métropolitaine.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Horaires spéciaux</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Livraisons possibles 7j/7. Majorations pour interventions entre 20h-8h, week-ends et jours fériés.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                    <CheckCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Conditions d'accès</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Merci de nous signaler toute contrainte d'accès (étages, ascenseur, portes étroites, parkings...) lors de la réservation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="mb-20 md:mb-32 relative overflow-hidden py-12 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transform -skew-y-3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 pt-8">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Nos avantages</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white">
              Pourquoi choisir <span className="text-violet-700 dark:text-violet-400">ESIL Events</span> ?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <motion.div 
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="mr-6">
                  <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-4 rounded-2xl text-white shadow-lg">
                    <Settings className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Flexibilité</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Que vous choisissiez un service économique ou premium, nous adaptons notre prestation à vos besoins.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="mr-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl text-white shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Professionnalisme</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nos équipes de techniciens événementiels sont expérimentées et assurent un service de qualité, avec le sourire :)
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="mr-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-2xl text-white shadow-lg">
                    <MapPin className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Couverture Nationale</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nos services sont disponibles partout en France, même dans les zones les plus éloignées.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="mr-6">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-700 p-4 rounded-2xl text-white shadow-lg">
                    <Package className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Service clé en main</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Profitez de nos solutions tout-en-un, de la livraison à l'installation, en passant par le démontage.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="relative h-[400px] md:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/images/event-delivery.jpg" 
                alt="Installation événementielle professionnelle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Expertise technique</h3>
                <p className="text-white/80">Notre équipe assure une installation parfaite de votre matériel</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center relative overflow-hidden mb-16 md:mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
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
        </div>
        
        <div className="relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 md:mb-6"
            variants={fadeInUp}
          >
            Prêt à organiser votre <span className="text-violet-300">événement</span> ?
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-light"
            variants={fadeInUp}
          >
            Contactez-nous pour une solution de livraison adaptée à vos besoins
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={fadeInUp}
          >
            <Link 
              to="/contact" 
              className="w-full sm:w-auto bg-white text-violet-600 hover:bg-gray-100 font-bold py-3 md:py-4 px-6 md:px-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            >
              Demander un devis
            </Link>
            <Link 
              to="/products" 
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-violet-600 font-bold py-3 md:py-4 px-6 md:px-10 rounded-full transition-all duration-300 flex items-center justify-center hover:shadow-xl hover:scale-105"
            >
              Découvrir nos produits
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryPage;
