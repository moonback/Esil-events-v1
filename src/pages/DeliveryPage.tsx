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
          className="container-custom mx-auto px-6 text-center relative z-10"
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
            Livraison & <span className="text-violet-300">Installation</span> Professionnelle
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Des solutions logistiques complètes pour vos événements en Île-de-France et partout en France
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="container-custom mx-auto">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Les Solutions de livraison et d'installation de matériel événementiel chez
          ESIL Events </h2>
          <p className="text-lg mb-6">
          Chez ESIL Events, nous comprenons l'importance d'une logistique événementielle fluide et
fiable. C'est pourquoi nous vous proposons trois formules de livraison et installation
adaptées à vos besoins pour garantir le succès de vos événements professionnels, qu'il s'agisse
de soirées d'entreprise, séminaires, conférences ou autres manifestations. Découvrez nos
solutions pour une gestion simplifiée de votre matériel événementiel.          </p>
          <div className="w-20 h-1 bg-black mx-auto"></div>
        </div>
        
        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Option 1 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-violet-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-56 overflow-hidden relative">
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
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-violet-600 group-hover:text-violet-700 dark:text-violet-400 transition-colors duration-300">
                Retrait sur place
              </h3>
              <p className="text-green-600 font-bold mb-4 text-lg">Gratuit</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Récupérez votre matériel directement dans notre entrepôt à Mantes-la-Ville. Du lundi au vendredi de 9h30 à 12h et 14h15 à 16h.
              </p>
              <ul className="space-y-3 mb-6">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Prévoir un véhicule adapté au volume du matériel loué.
              </p>
            </div>
          </motion.div>
          
          {/* Option 2 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-indigo-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-56 overflow-hidden relative">
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
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 transition-colors duration-300">
                Livraison Économique
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-bold mb-4 text-lg">Sur devis</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Nous livrons sur site et vous participez au déchargement si nécessaire. Pensez à vérifier les accès (escaliers, ascenseurs, largeur des portes…).
              </p>
              <ul className="space-y-3 mb-6">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tarif variable selon la distance et le volume.
              </p>
            </div>
          </motion.div>
          
          {/* Option 3 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-purple-500 group"
            variants={scaleIn}
            whileHover={{ y: -10 }}
          >
            <div className="h-56 overflow-hidden relative">
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
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-600 group-hover:text-purple-700 dark:text-purple-400 transition-colors duration-300">
                Formule Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-bold mb-4 text-lg">Sur devis</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Service clé en main : livraison, installation et démontage pris en charge par nos techniciens événementiels 7j/7 et 24h/24, partout en France.
              </p>
              <ul className="space-y-3 mb-6">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Des frais supplémentaires peuvent s'appliquer pour les interventions de nuit, le week-end ou les longues distances.
              </p>
            </div>
          </motion.div>
            </div>
          </div>
        
        {/* Detailed Information */}
        <motion.section 
          className="mb-32 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="max-w-12xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Informations pratiques</span>
              <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
                Tout ce que vous devez <span className="text-violet-700 dark:text-violet-400">savoir</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {/* Delivery Process */}
              <motion.div 
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  <Clock className="w-7 h-7 mr-3 text-violet-600" />
                  Nos délais de livraison : Planifiez votre événement en toute sérénité 
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
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
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
  className="mb-32 relative overflow-hidden py-16"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={staggerContainer}
>
  <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transform -skew-y-3"></div>
  
  <div className="max-w-7xl mx-auto px-6 relative z-10 pt-8">
    <motion.div 
      className="text-center mb-16"
      variants={fadeInUp}
    >
      <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Nos avantages</span>
      <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
        Pourquoi choisir <span className="text-violet-700 dark:text-violet-400">ESIL Events</span> ?
      </h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">
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
        className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl"
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
{/* National Coverage Section */}
<motion.section 
  className="mb-32 relative overflow-hidden"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={fadeIn}
>
  <div className="max-w-12xl mx-auto px-6">
    <div className="relative">
      {/* Forme décorative */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-100 rounded-full opacity-50 dark:opacity-20 blur-3xl z-0"></div>
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-100 rounded-full opacity-60 dark:opacity-20 blur-3xl z-0"></div>
      
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
        <motion.h2 
          className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent"
          variants={fadeInUp}
        >
          Livraison et installation partout en France
        </motion.h2>
        
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          variants={fadeInUp}
        >
          Chez <span className="text-violet-600 font-semibold">ESIL Events</span>, nous mettons un point d'honneur à offrir des solutions de livraison
          flexibles, non seulement en Île-de-France, mais également partout en France. Grâce à notre
          équipe mobile et notre flotte de véhicules, nous sommes capables de répondre à vos besoins
          logistiques, que vous soyez à Paris, Lyon, Marseille, Toulouse, ou même dans des régions
          plus éloignées.
        </motion.p>
        
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          variants={fadeInUp}
        >
          Nos solutions sont conçues pour garantir que vos événements se déroulent
          dans les meilleures conditions, où que vous soyez. En choisissant ESIL Events, vous optez pour un partenaire fiable, capable de s'adapter aux
          particularités de chaque région et de livrer dans des délais respectés.
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-10"
          variants={fadeInUp}
        >
          <div className="flex items-center border-2 border-violet-200 dark:border-violet-800 rounded-full py-3 px-6">
            <span className="text-violet-600 dark:text-violet-400 font-bold text-xl mr-2">24/7</span>
            <span className="text-gray-600 dark:text-gray-300">disponibilité</span>
          </div>
          <div className="flex items-center border-2 border-indigo-200 dark:border-indigo-800 rounded-full py-3 px-6">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl mr-2">100%</span>
            <span className="text-gray-600 dark:text-gray-300">France métropolitaine</span>
          </div>
          <div className="flex items-center border-2 border-purple-200 dark:border-purple-800 rounded-full py-3 px-6">
            <span className="text-purple-600 dark:text-purple-400 font-bold text-xl mr-2">0</span>
            <span className="text-gray-600 dark:text-gray-300">stress pour vous</span>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
</motion.section>
        {/* Testimonials */}
        {/* <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Ils nous ont fait confiance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "La formule premium a été parfaite pour notre congrès. Installation impeccable et équipe très professionnelle.",
                author: "Michel D., Directeur événementiel"
              },
              {
                quote: "Livraison toujours ponctuelle et matériel en parfait état. Un partenaire fiable pour nos nombreux événements.",
                author: "Sarah L., Agence de communication"
              },
              {
                quote: "Retrait sur place très simple avec une équipe qui nous a bien conseillé pour le chargement. Je recommande !",
                author: "Thomas P., Association étudiante"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-yellow-400 mb-4">★★★★★</div>
                <p className="italic mb-6 text-gray-700">"{testimonial.quote}"</p>
                <p className="font-medium text-gray-900">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div> */}
        
        {/* FAQ */}
        {/* <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Questions fréquentes</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {[
              {
                question: "Quels sont les délais de réservation ?",
                answer: "Nous recommandons de réserver au moins 72h à l'avance pour les livraisons standard et 1 semaine pour la formule premium. En période de forte demande (mai à septembre), prévoyez plusieurs semaines à l'avance."
              },
              {
                question: "Puis-je modifier ma commande après réservation ?",
                answer: "Oui, sous réserve de disponibilité. Les modifications sont possibles jusqu'à 48h avant la livraison pour la formule premium et 24h pour les autres formules."
              },
              {
                question: "Que faire en cas de retard ou d'annulation ?",
                answer: "En cas de retard de votre part, des frais supplémentaires peuvent s'appliquer. Pour les annulations, merci de nous prévenir au moins 72h à l'avance pour éviter des frais."
              },
              {
                question: "Proposez-vous des services supplémentaires ?",
                answer: "Oui, nous proposons également la gestion complète de votre événement, la fourniture de personnel technique et des solutions sur-mesure. Contactez-nous pour en discuter."
              }
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <div className="p-6 hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-bold text-lg flex justify-between items-center">
                    {item.question}
                    <span className="text-gray-400">+</span>
                  </h3>
                  <p className="mt-2 text-gray-600">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* CTA Section avec design amélioré */}
        <motion.div 
          className="bg-gradient-to-br from-violet-900 via-black to-indigo-900 text-white rounded-3xl p-12 text-center relative overflow-hidden mb-20"
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
              className="text-4xl font-bold mb-4"
              variants={fadeInUp}
            >
              Prêt à organiser votre <span className="text-violet-300">événement</span> ?
            </motion.h2>
            <motion.p 
              className="text-xl mb-10 max-w-2xl mx-auto font-light"
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
                className="bg-white text-violet-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
              >
                Demander un devis
              </Link>
              <Link 
                to="/categories" 
                className="border-2 border-white text-white hover:bg-white hover:text-violet-600 font-bold py-4 px-10 rounded-full transition-all duration-300 flex items-center justify-center hover:shadow-xl hover:scale-105"
              >
                Découvrir nos produits
              </Link>
            </motion.div>
          </div>
        </motion.div>
        

        {/* Focus on Delivery Modes avec design amélioré */}
        <motion.section 
          className="mb-32 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="max-w-12xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">En détail</span>
              <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
                Focus sur nos <span className="text-violet-700 dark:text-violet-400">3 modes</span> de livraison
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Découvrez en détail nos solutions logistiques pour votre événement
              </p>
            </motion.div>

            {/* Pickup Option */}
            <motion.div 
              className="mb-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden relative"
              variants={fadeInUp}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 dark:bg-violet-900/20 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-2xl mr-4">
                    <Package className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400">Retrait sur Place</h3>
                </div>
                
                <h4 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Une solution pratique et économique</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      La formule Retrait sur place est idéale si vous avez la possibilité de récupérer votre matériel
                      directement à notre entrepôt de Mantes-la-Ville. Cette option est non seulement gratuite,
                      mais elle vous offre également une grande flexibilité, puisque vous êtes en charge de
                      l'acheminement et de l'installation de votre matériel.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Vous pourrez ainsi vérifier tout le matériel en amont, et vous avez la liberté de l'emporter à votre rythme.
                      Cependant, il est important de noter que cette solution nécessite un véhicule adapté pour
                      transporter le matériel. En fonction du volume de votre commande, nous vous conseillons de
                      choisir un véhicule suffisamment spacieux pour éviter toute contrainte lors du transport.
                    </p>
                  </div>
                  
                  <div className="bg-violet-50 dark:bg-violet-900/10 rounded-2xl p-6">
                    <h5 className="font-bold text-lg mb-4 text-violet-700 dark:text-violet-400">Points clés</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Gratuit</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Horaires flexibles</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Vérification sur place</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Conseils de chargement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Economic Delivery */}
            <motion.div 
              className="mb-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden relative"
              variants={fadeInUp}
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full opacity-50 -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-2xl mr-4">
                    <Truck className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Livraison Économique</h3>
                </div>
                
                <h4 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Une option flexible et accessible</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Notre formule de Livraison Économique est une solution pratique et abordable pour les
                      événements de taille modeste. Nous assurons la livraison de votre matériel directement sur le
                      site de votre événement. Cette option vous permet de bénéficier d'un service de qualité à un
                      tarif avantageux, tout en restant flexible sur les horaires.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Lors de la livraison, il vous sera demandé de participer au déchargement si nécessaire. Il est
                      essentiel de vérifier les conditions d'accès (escaliers, ascenseurs, portes larges, etc.) pour que
                      nous puissions adapter nos méthodes de livraison. En fonction des contraintes spécifiques de
                      votre lieu, nous pouvons vous conseiller sur les meilleures pratiques pour garantir une
                      livraison rapide et sécurisée.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6">
                    <h5 className="font-bold text-lg mb-4 text-indigo-700 dark:text-indigo-400">Points clés</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Sur devis</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Livraison à l'adresse de votre choix</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Idéal pour les petites quantités</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Tarif selon distance et volume</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Premium Formula */}
            <motion.div 
              className="mb-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden relative"
              variants={fadeInUp}
            >
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-50 translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl mr-4">
                    <Settings className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">Formule Premium</h3>
                </div>
                
                <h4 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Le service clé en main, partout, à tout moment</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Pour ceux qui souhaitent un service complet et sans stress, notre formule Premium est la
                      solution idéale. Disponible 7j/7 et 24h/24, ce service clé en main inclut la livraison,
                      l'installation, et le démontage du matériel par nos techniciens spécialisés. Nous prenons en
                      charge chaque étape de la logistique événementielle pour que vous puissiez vous concentrer
                      sur l'essentiel : la réussite de votre événement.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Cette formule est particulièrement recommandée pour les installations complexes qui
                      nécessitent un savoir-faire technique ou pour les événements où chaque détail doit être
                      parfaitement maîtrisé. Nos équipes s'occupent de tout, y compris de l'assistance technique
                      pendant l'événement pour résoudre toute éventualité rapidement.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6">
                    <h5 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">Points clés</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Sur devis personnalisé</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Installation complète par nos techniciens</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Démontage et récupération inclus</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">Assistance technique pendant l'événement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
{/* Image Gallery Section */}
<div className="mb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="relative h-[400px]">
      <img 
        src="/images/delivery-1.jpg" 
        alt="Service de livraison ESIL Events" 
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
    </div>
    <div className="relative h-[400px]">
      <img 
        src="/images/delivery-2.jpg" 
        alt="Installation professionnelle ESIL Events" 
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
    </div>
  </div>
</div>

{/* Access Verification */}
<motion.div 
  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-20"
  variants={fadeInUp}
>
  <div className="flex items-center mb-8">
    <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-2xl mr-4">
      <HardHat className="w-8 h-8 text-orange-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Vérification des Accès : Garantissez une livraison sans accroc</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <div className="flex items-start">
        <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-full mr-4">
          <MapPin className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Points d'accès</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Vérifiez les accès au lieu de l'événement, notamment les marches, escaliers, ascenseurs étroits ou portes étroites. Ces contraintes peuvent compliquer le transport et l'installation du matériel.
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mr-4">
          <Settings className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Équipements spécifiques</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Certains équipements nécessitent un espace de manœuvre plus large ou des équipements spécifiques (chariots élévateurs, rampes). Une vérification des dimensions est essentielle.
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
          <Truck className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Stationnement</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Vérifiez les zones de stationnement à proximité pour permettre un déchargement rapide. En cas de difficulté d'accès, nous pouvons organiser des solutions alternatives.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6">
      <h3 className="font-bold text-xl mb-4 text-orange-700 dark:text-orange-400">Points clés à vérifier</h3>
      <ul className="space-y-4">
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">Largeur des portes et couloirs</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">Hauteur des plafonds et passages</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">Présence d'ascenseurs et leur capacité</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">Accès pour les véhicules de livraison</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">Zones de déchargement disponibles</span>
        </li>
      </ul>
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
          En cas de doute, notre équipe peut effectuer une évaluation à distance ou discuter des solutions possibles pour garantir une installation sans retard.
        </p>
      </div>
    </div>
  </div>
</motion.div>

          
    </div>
  );
};

export default DeliveryPage;
