import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const teamMembers = [
  {
    id: 1,
    name: "Eric",
    role: "Fondateur et Responsable Technique",
    image: "/images/default-product.svg",
    description: "Depuis la création de ESIL Events en 2004, Eric est le garant de la qualité technique de vos événements. Expert en sonorisation et éclairage, il conseille chaque client sur le choix du matériel et veille à ce que chaque installation soit parfaitement réalisée. Eric supervise également l'équipe technique pour assurer le bon déroulement de toutes les prestations."
  },
  {
    id: 2,
    name: "Amélie",
    role: "Responsable Commerciale",
    image: "/images/default-product.svg",
    description: "Amélie est votre interlocutrice privilégiée pour toutes vos demandes commerciales. Elle est là pour vous aider à trouver les solutions qui correspondent à vos besoins et à votre budget. Grâce à son expertise commerciale et sa connaissance du secteur événementiel, Amélie vous accompagne tout au long de votre projet, de la demande de devis à la finalisation de votre événement."
  },
  {
    id: 3,
    name: "Virginie",
    role: "Chargée de Projets Événementiels",
    image: "/images/default-product.svg",
    description: "Virginie gère l'ensemble des projets événementiels, de leur conception à leur réalisation. Elle est en charge de la planification, de la coordination des équipes et de la gestion de tous les détails pour que votre événement soit un succès. Son rôle est de s'assurer que tout soit organisé dans les moindres détails, afin que vous puissiez vous concentrer sur l'essentiel."
  },
  {
    id: 4,
    name: "Équipe Technique",
    role: "Techniciens Événementiels",
    image: "/images/default-product.svg",
    description: "Nos techniciens événementiels, responsables de l'installation et du bon fonctionnement du matériel technique. De la sonorisation à l'éclairage, en passant par la mise en place des scènes, ils assurent un service irréprochable. Leur savoir-faire et leur professionnalisme garantissent une prestation sans accroc."
  }
];

const services = [
  {
    title: "Location de matériel événementiel",
    color: "black",
    icon: (
      <img 
        src="public\images\Location-materiel.JPG" 
        alt="Matériel événementiel"
        className="w-8 h-8 object-cover"
      />
    ),
    description: "Nous proposons la location de matériel de sonorisation, d'éclairage, de scènes, de signalétique et plus encore. Que vous organisiez une soirée d'entreprise, un séminaire, une conférence ou un lancement de produit, nous vous aidons à choisir le matériel adapté à vos besoins.",
    additionalInfo: "Nos services incluent également la livraison, l'installation et la présence de techniciens spécialisés en son et lumière pour garantir la réussite de votre événement. Vous pouvez compter sur notre expertise pour faire de votre projet un véritable succès."
  },
  {
    title: "Location de jeux pour événements ludiques",
    color: "black",
    icon: (
      <img 
        src="public\images\Location-jeux.jpg"
        alt="Jeux événementiels" 
        className="w-8 h-8 object-cover"
      />
    ),
    description: "Pour des événements plus ludiques et interactifs, nous proposons une large gamme de jeux de type rétro et moderne : des arcades des années 80, des flippers, des tables de ping-pong, des paniers de basket, des jeux de coup de poing, des machines à pince et bien plus.",
    additionalInfo: "Ces animations sont idéales pour des fêtes d'entreprise, des salons ou des kermesses, et elles apportent une dimension conviviale et fun à vos événements."
  },
  {
    title: "Organisation complète d'événements",
    color: "black",
    icon: (
      <img 
        src="public\images\Soirer-entreprise.jpg"
        alt="Organisation d'événements"
        className="w-8 h-8 object-cover"
      />
    ),
    description: "En tant qu'agence événementielle, nous prenons en charge l'organisation complète de votre événement, de A à Z. Cela comprend la planification, la conception, l'organisation et la coordination de séminaires, conférences, lancements de produits ou tout autre type de manifestation.",
    additionalInfo: "Nous travaillons avec un large réseau de professionnels : artistes (magiciens, DJ, chanteurs, danseurs, comédiens), techniciens et prestataires pour créer des événements sur-mesure, à la hauteur de vos attentes."
  }
];

const AboutPage = () => {
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
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* SEO Component */}
      <SEO 
        title="À propos d'ESIL Events - Notre histoire et notre équipe"
        description="Découvrez l'histoire d'ESIL Events, notre équipe d'experts et nos services d'organisation d'événements professionnels et de location de matériel événementiel."
        keywords="ESIL Events, agence événementielle, équipe événementielle, organisation événements, location matériel, histoire entreprise"
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
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Notre <span className="text-violet-300">Histoire</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Que ce soit pour la location de matériel technique, l'animation ludique
            d'événements ou l'organisation complète d'événements, nous mettons notre expertise au service de
            votre réussite.
          </motion.p>
        </motion.div>
      </motion.div>
      
      {/* Section Introduction avec design amélioré */}
      <motion.section 
        className="mb-24 relative"
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
                L'excellence au service de vos événements depuis 2004
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                Chez <span className="text-violet-600 font-semibold">ESIL Events</span>, nous créons des expériences inoubliables grâce à notre savoir-faire technique et notre créativité. Qu'il s'agisse de concevoir des ambiances lumineuses spectaculaires, de créer des espaces sonores immersifs ou d'imaginer des animations originales, nous transformons vos idées en réalités qui marquent les esprits.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6"
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
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Section Services Améliorée */}
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
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Nos prestations</span>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Notre Expertise : <span className="text-violet-700 dark:text-violet-400">Louer, créer, éblouir !</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Découvrez nos différentes activités qui font notre force et qui répondent à tous vos besoins événementiels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-t-4 border-${service.color}-500 group`}
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <div className="h-56 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${service.color}-600 to-${service.color}-800 flex items-center justify-center`}>
                    <img 
                      src={service.icon.props.src}
                      alt={service.icon.props.alt}
                      className="w-full h-full object-cover opacity-100"
                    />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-4 text-${service.color}-600 group-hover:text-${service.color}-700 dark:text-${service.color}-400 transition-colors duration-300`}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {service.description}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {service.additionalInfo}
                  </p>
                  <div className="mt-6">
                    <a href="#" className={`inline-flex items-center text-${service.color}-600 font-medium`}>
                      En savoir plus
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section Pourquoi Nous Choisir Améliorée */}
      <motion.section 
        className="mb-32 relative overflow-hidden py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transform -skew-y-3"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-16">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Nos avantages</span>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Pourquoi choisir <span className="text-violet-700 dark:text-violet-400">ESIL Events</span> ?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Avantages Cards */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <div className="mr-6">
                <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-4 rounded-2xl text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Expertise et expérience</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Plus de 20 ans d'expérience dans la gestion technique et organisationnelle des événements.
                  Notre expertise fait de chaque événement un moment unique et inoubliable, adapté à vos besoins spécifiques.
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
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Service sur-mesure</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Des solutions personnalisées pour chaque client, adaptées à vos besoins spécifiques.
                  Un accompagnement complet pour garantir la qualité de service et la satisfaction de vos attentes.
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
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Flexibilité et réactivité</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Une équipe disponible et réactive pour répondre à vos demandes, même de dernière minute.
                  Des solutions adaptables selon vos besoins partout en France, pour une tranquillité d'esprit absolue.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <div className="mr-6">
                <div className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 p-4 rounded-2xl text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Une équipe passionnée</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Des professionnels dévoués qui travaillent ensemble pour faire de votre événement un succès.
                  Une expertise technique et créative au service de votre projet, avec une passion communicative.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

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
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">{member.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section Partenaires avec Design Amélioré */}
      <motion.section 
        className="py-20 mb-32 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black transform skew-y-2"></div>
        
        <div className="max-w-12xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <span className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">Nos réalisations</span>
            <h2 className="text-4xl font-bold mb-6 text-white">
              Séminaires, soirées d’entreprise,
              conférences et plus
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Nous accompagnons les entreprises dans
            l’organisation d’événements sur-mesure,
            retrouvez nos projets récents que nous avons
            eu le plaisir de concevoir et coordonner.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-center border border-gray-700 hover:border-violet-500 transition-colors duration-300"
                whileHover={{ scale: 1.05, borderColor: "#8B5CF6" }}
                variants={scaleIn}
              >
                <img 
                  src={`https://placehold.co/200x100/gray/white?text=Partner+${index}`} 
                  alt={`Partner ${index}`} 
                  className="max-h-16 transition-opacity filter grayscale hover:grayscale-0 hover:opacity-100 opacity-80"
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* <motion.div 
            className="text-center mt-16"
            variants={fadeInUp}
          >
            <a href="#" className="inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors font-medium">
              Voir tous nos partenaires
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
          </motion.div> */}
        </div>
      </motion.section>

      {/* CTA Section Améliorée */}
      <motion.section 
        className="mb-20 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-12xl mx-auto ">
          <div className="relative overflow-hidden">
            {/* Background avec dégradé animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-700 overflow-hidden">
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
                  Prêt à transformer votre <span className="text-violet-200">prochain événement</span> en expérience mémorable ?
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-violet-100 mb-12 font-light"
                  variants={fadeInUp}
                >
                  Que ce soit pour la location de matériel, l'animation de vos événements ou une gestion complète, 
                  ESIL Events est là pour vous accompagner à chaque étape. Contactez-nous dès aujourd'hui pour 
                  discuter de votre projet.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
                  variants={fadeInUp}
                >
                  <motion.a 
                    href="/products" 
                    className="bg-white text-violet-700 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Demander un devis</span>
                    <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </motion.a>
                  
                  <motion.a 
                    // href="tel:07.85.95.97.23" 
                    className="text-white border-2 border-white hover:bg-white hover:text-violet-700 px-8 py-4 rounded-full font-bold flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>07.85.95.97.23</span>
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer Banner */}
      <motion.div 
        className="bg-gray-50 dark:bg-gray-800 py-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Suivez-nous sur les réseaux sociaux pour découvrir nos dernières réalisations
          </h3>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
