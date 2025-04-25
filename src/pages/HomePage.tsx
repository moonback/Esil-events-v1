import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, Package, Truck } from 'lucide-react';

const HomePage: React.FC = () => {
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
              "https://www.instagram.com/esilevents"
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Section with Video */}
      <section className="relative h-screen">
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
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            ESIL Créateur d'Événements Inoubliables
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl">
            Votre événement de A à Z : Location, Installation, Régie Son & Lumière, Animation
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/agence-evenementielle" className="btn-primary">
              Notre Agence évènementille
            </Link>
            <Link to="/products/" className="btn-secondary">
              Nos produits à la location
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ESIL Events : <span className="text-violet-700">Partenaire pour des événements</span> d'Entreprise sur-mesure
              </h2>
              <p className="mb-4">
                Depuis plus de 30 ans, ESIL Events accompagne les entreprises dans la conception et la réalisation de leurs événements professionnels. De la planification stratégique à l'exécution terrain, nous orchestrons chaque détail pour garantir des séminaires d'entreprise, conférences, cérémonies internes et soirées d'exception à la hauteur de vos ambitions.
              </p>
              <p>
                Notre expertise couvre aussi la location de matériel événementiel : sonorisation, éclairage, scène, mobilier et signalétique. Grâce à nos solutions clé en main, nous assurons l'installation, la régie son & lumière et la coordination de vos prestations pour un événement sans fausse note.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Événement d'entreprise" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section bg-gray-100">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Louez votre<span className="text-violet-700"> matériel évènementiel</span>  !
          </h2>
          {/* <h3 className="text-xl md:text-2xl font-medium mb-8 text-center">
            Besoin de matériel pour organiser un événement réussi ?
          </h3> */}
          <p className="text-center mb-12 max-w-3xl mx-auto">
            ESIL Events met à votre disposition une large gamme d'équipements professionnels, disponibles en location avec ou sans installation, pour tous vos événements !
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mobilier & Deco */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Mobilier & Déco" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">MOBILIER & DECO</h3>
                <p className="text-sm mb-4">
                  Offrez à vos invités une ambiance unique avec notre sélection de mobilier et de décoration en location : tables, chaises, mobiliers lumineux, décorations thématiques (vintage, fête foraine, super-héros...). Créez un cadre mémorable pour vos événements !
                </p>
                <Link to="/products/mobilier" className="flex items-center text-black font-medium hover:underline">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Jeux */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Jeux" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">JEUX</h3>
                <p className="text-sm mb-4">
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
                <Link to="/products/jeux" className="flex items-center text-black font-medium hover:underline">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Signalétique */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1588412079929-790b9f593d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Signalétique" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">SIGNALETIQUE</h3>
                <p className="text-sm mb-4">
                  Facilitez l'orientation de vos invités avec
                  notre matériel de signalétique :
                  panneaux directionnels, totems, stands,
                  et banderoles sur mesure. Idéal pour
                  vos salons, lancements de produits et
                  autres événements professionnels, pour
                  une communication claire et impactante.                
                </p>
                <Link to="/products/signaletique" className="flex items-center text-black font-medium hover:underline">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Technique */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Technique" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">TECHNIQUE</h3>
                <p className="text-sm mb-4">
                  Mettez en lumière vos événements avec
                  notre matériel technique : éclairage,
                  sonorisation, vidéo et scènes. Parfait
                  pour des prises de parole, conférences,
                  concerts ou soirées dansantes, nous
                  vous fournissons tout le nécessaire pour
                  garantir le succès de vos animations.                
                </p>
                <Link to="/products/technique" className="flex items-center text-black font-medium hover:underline">
                  Découvrir <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="section bg-black">
        <div className="container-custom">
          <div className="bg-black text-white rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Parlons de votre projet !
            </h2>
            <p className="mb-8 max-w-3xl mx-auto">
              Chaque événement est unique et mérite une exécution parfaite. Chez ESIL Events, nous transformons vos idées en expériences marquantes, en combinant créativité, expertise technique et gestion rigoureuse.
              <br /><br />
              <span className="font-bold text-purple-600">Vous avez un projet en tête ? Discutons-en et créons ensemble un événement à la hauteur de vos ambitions.</span>
            </p>
            <Link to="/contact" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
              Discuter de mon événement
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Options Section */}
      <section className="section bg-gray-100">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          <span className="text-violet-700">Livraison et installation</span> du matériel événementiel : 3 formules au choix !
          </h2>
          <p className="mb-12 max-w-4xl mx-auto text-center">
            Chez ESIL Events, nous vous proposons trois solutions adaptées à vos besoins pour la livraison et l'installation de votre matériel événementiel. Que ce soit pour une soirée d'exception, un séminaire d'entreprise, une conférence ou toute autre manifestation professionnelle, choisissez la formule qui vous convient :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Option 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-black text-white p-4 flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Retrait sur place</h2>
              <p className="text-green-600 font-bold mb-4">Gratuit</p>
              <p className="mb-4">
                Récupérez votre matériel directement dans notre entrepôt à Mantes-la-Ville. Du lundi au vendredi de 9h30 à 12h et 14h15 à 16h.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Économique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Flexible sur les horaires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Vérification du matériel sur place</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Prévoir un véhicule adapté au volume du matériel loué.
              </p>
            </div>
          </div>

            {/* Option 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-black text-white p-4 flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Livraison Économique</h2>
              <p className="text-gray-600 font-bold mb-4">Sur devis</p>
              <p className="mb-4">
                Nous livrons sur site et vous participez au déchargement si nécessaire. Pensez à vérifier les accès (escaliers, ascenseurs, largeur des portes…).
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Livraison à l'adresse de votre choix</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Solution intermédiaire économique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Idéal pour les petites quantités</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Tarif variable selon la distance et le volume.
              </p>
            </div>
          </div>

            {/* Option 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-black text-white p-4 flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">Formule Premium</h2>
              <p className="text-gray-600 font-bold mb-4">Sur devis</p>
              <p className="mb-4">
                Service clé en main : livraison, installation et démontage pris en charge par nos techniciens événementiels 7j/7 et 24h/24, partout en France.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Installation complète par nos techniciens</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Démontage et récupération inclus</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Assistance technique pendant l'événement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-violet-600 mr-2 mt-0.5" />
                  <span>Idéal pour les installations complexes</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Des frais supplémentaires peuvent s'appliquer pour les interventions de nuit, le week-end ou les longues distances.
              </p>
            </div>
          </div>
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
      </section>
    </div>
  );
};

export default HomePage;
