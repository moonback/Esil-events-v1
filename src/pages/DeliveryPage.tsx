import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, Settings, CheckCircle, Phone, MapPin, Calendar, HardHat } from 'lucide-react';

const DeliveryPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 mb-16">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Livraison & Installation Professionnelle</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Des solutions logistiques complètes pour vos événements en Île-de-France et partout en France
          </p>
        </div>
      </div>

      <div className="container-custom mx-auto">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Les Solutions de livraison et d’installation de matériel événementiel chez
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
        
        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Delivery Process */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-violet-600" />
              Nos délais de livraison : Planifiez votre événement en toute sérénité 
            </h3>
            <p className="text-gray-600 mb-6">
              Pour garantir la disponibilité du matériel et une livraison dans les meilleures conditions, nous
              vous recommandons de réserver votre matériel selon les délais suivants :
            </p>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Réservation</h3>
                  <p className="text-gray-600">Réservez au moins 72h à l'avance (1 semaine pour la formule premium). Périodes de pointe : réservez plusieurs semaines à l'avance.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">2</div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Préparation</h3>
                  <p className="text-gray-600">Nous préparons votre matériel et vous contactons pour confirmer les détails de livraison.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">3</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Livraison/Installation</h3>
                  <p className="text-gray-600">Notre équipe intervient selon le créneau convenu pour livrer ou installer votre matériel.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Notes */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <HardHat className="w-6 h-6 mr-3 text-orange-500" />
              Informations techniques
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-orange-500 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Zones d'intervention</h3>
                  <p className="text-gray-600">
                    Île-de-France : livraison sans majoration. Province : supplément kilométrique selon distance. Nous intervenons dans toute la France métropolitaine.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-orange-500 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Horaires spéciaux</h3>
                  <p className="text-gray-600">
                    Livraisons possibles 7j/7. Majorations pour interventions entre 20h-8h, week-ends et jours fériés.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-orange-500 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Conditions d'accès</h3>
                  <p className="text-gray-600">
                    Merci de nous signaler toute contrainte d'accès (étages, ascenseur, portes étroites, parkings...) lors de la réservation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
{/* Why Choose Us Section */}
<div className="mb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">
        Pourquoi ESIL Events est le choix idéal pour vos événements ?
      </h2>
      <div className="space-y-6">
        <div className="flex items-start">
          <Settings className="w-6 h-6 text-violet-600 mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold mb-2">Flexibilité</h3>
            <p className="text-gray-600">
              Que vous choisissiez un service économique ou premium, nous adaptons notre prestation à vos besoins.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-violet-600 mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold mb-2">Professionnalisme</h3>
            <p className="text-gray-600">
              Nos équipes de techniciens événementiels sont expérimentées et assurent un service de qualité, avec le sourire :)
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <MapPin className="w-6 h-6 text-violet-600 mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold mb-2">Couverture Nationale</h3>
            <p className="text-gray-600">
              Nos services sont disponibles partout en France, même dans les zones les plus éloignées.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Package className="w-6 h-6 text-violet-600 mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold mb-2">Service clé en main</h3>
            <p className="text-gray-600">
              Profitez de nos solutions tout-en-un, de la livraison à l'installation, en passant par le démontage.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="relative h-[500px]">
      <img 
        src="/images/event-setup.jpg" 
        alt="Installation événementielle professionnelle" 
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
    </div>
  </div>
</div>
{/* National Coverage Section */}
<div className="mb-20">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-6">Livraison et installation partout en France</h2>
    <p className="text-lg mb-6">
      Chez ESIL Events, nous mettons un point d'honneur à offrir des solutions de livraison
      flexibles, non seulement en Île-de-France, mais également partout en France. Grâce à notre
      équipe mobile et notre flotte de véhicules, nous sommes capables de répondre à vos besoins
      logistiques, que vous soyez à Paris, Lyon, Marseille, Toulouse, ou même dans des régions
      plus éloignées. Nos solutions sont conçues pour garantir que vos événements se déroulent
      dans les meilleures conditions, où que vous soyez.
    </p>
    <p className="text-lg">
      En choisissant ESIL Events, vous optez pour un partenaire fiable, capable de s'adapter aux
      particularités de chaque région et de livrer dans des délais respectés. Peu importe où se trouve
      votre événement, nous assurons la livraison de votre matériel événementiel avec la même
      efficacité.
    </p>
  </div>
</div>
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

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à organiser votre événement ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contactez-nous pour une solution de livraison adaptée à vos besoins
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/contact" 
              className="bg-white text-violet-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              Demander un devis
            </Link>
            {/* <a 
              href="tel:+33123456789" 
              className="border-2 border-white text-white hover:bg-white hover:text-violet-600 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Nous appeler
            </a> */}
          </div>
        </div>
        

        {/* Focus on Delivery Modes */}
        <div className="mb-20 mt-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Focus sur nos 3 modes de livraison</h2>
          
          {/* Pickup Option */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-violet-600">Retrait sur Place : Une solution pratique et économique</h3>
            <p className="mb-4">
              La formule Retrait sur place est idéale si vous avez la possibilité de récupérer votre matériel
              directement à notre entrepôt de Mantes-la-Ville. Cette option est non seulement gratuite,
              mais elle vous offre également une grande flexibilité, puisque vous êtes en charge de
              l'acheminement et de l'installation de votre matériel. Vous pourrez ainsi vérifier tout le
              matériel en amont, et vous avez la liberté de l'emporter à votre rythme.
            </p>
            <p>
              Cependant, il est important de noter que cette solution nécessite un véhicule adapté pour
              transporter le matériel. En fonction du volume de votre commande, nous vous conseillons de
              choisir un véhicule suffisamment spacieux pour éviter toute contrainte lors du transport. Si
              vous avez des doutes sur la capacité de votre véhicule, n'hésitez pas à nous consulter, nous
              serons heureux de vous guider.
            </p>
          </div>

          {/* Economic Delivery */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-violet-600">Livraison Économique : Une option flexible et accessible</h3>
            <p className="mb-4">
              Notre formule de Livraison Économique est une solution pratique et abordable pour les
              événements de taille modeste. Nous assurons la livraison de votre matériel directement sur le
              site de votre événement. Cette option vous permet de bénéficier d'un service de qualité à un
              tarif avantageux, tout en restant flexible sur les horaires.
            </p>
            <p className="mb-4">
              Lors de la livraison, il vous sera demandé de participer au déchargement si nécessaire. Il est
              essentiel de vérifier les conditions d'accès (escaliers, ascenseurs, portes larges, etc.) pour que
              nous puissions adapter nos méthodes de livraison. En fonction des contraintes spécifiques de
              votre lieu, nous pouvons vous conseiller sur les meilleures pratiques pour garantir une
              livraison rapide et sécurisée.
            </p>
            <p>
              Si votre événement se situe à une distance importante de notre entrepôt ou si des contraintes
              d'accès sont présentes, des frais supplémentaires peuvent être appliqués. Mais avec un peu de
              préparation, nous pouvons offrir un service sur mesure qui répondra parfaitement à vos
              besoins.
            </p>
          </div>

          {/* Premium Formula */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-violet-600">Formule Premium : Le service clé en main, partout, à tout moment</h3>
            <p className="mb-4">
              Pour ceux qui souhaitent un service complet et sans stress, notre formule Premium est la
              solution idéale. Disponible 7j/7 et 24h/24, ce service clé en main inclut la livraison,
              l'installation, et le démontage du matériel par nos techniciens spécialisés. Nous prenons en
              charge chaque étape de la logistique événementielle pour que vous puissiez vous concentrer
              sur l'essentiel : la réussite de votre événement.
            </p>
            <p className="mb-4">
              Cette formule est particulièrement recommandée pour les installations complexes qui
              nécessitent un savoir-faire technique ou pour les événements où chaque détail doit être
              parfaitement maîtrisé. Nos équipes s'occupent de tout, y compris de l'assistance technique
              pendant l'événement pour résoudre toute éventualité rapidement. Si votre événement se
              déroule dans un délai particulièrement court ou dans des zones éloignées, notre équipe
              s'adapte et garantit une prestation à la hauteur de vos attentes.
            </p>
            <p>
              Cependant, il est important de noter que cette formule inclut un tarif variable en fonction de
              plusieurs facteurs, notamment les heures d'intervention (nuit, week-end) et la distance à
              parcourir. Nous vous fournissons toujours un devis personnalisé avant toute intervention.
            </p>
          </div>

          {/* Access Verification */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Vérification des Accès : Garantissez une livraison sans accroc</h2>
            <p className="mb-4">
              Afin de garantir une livraison, il est impératif de vérifier les accès au lieu de l'événement,
              surtout si des marches, escaliers, ascenseurs étroits ou des portes étroites sont présents.
              Ces contraintes peuvent rendre le transport et l'installation du matériel plus complexes. C'est
              pourquoi nous vous encourageons à bien nous renseigner sur ces éléments lors de votre
              demande.
            </p>
            <p className="mb-4">
              Certains de nos jeux ou équipements peuvent nécessiter un espace de manœuvre plus large,
              ou des équipements spécifiques (comme des chariots élévateurs ou des rampes). Une
              vérification des dimensions des portes et des accès doit être effectuée pour éviter tout
              problème le jour J. En cas de doute, nous sommes à votre disposition pour effectuer une
              évaluation à distance ou discuter des solutions possibles.
            </p>
            <p>
              Nous vous conseillons également de vérifier les zones de stationnement à proximité pour
              permettre un déchargement rapide. En cas de difficulté d'accès, nous pourrons organiser des
              équipements ou des moyens alternatifs pour garantir une installation sans retard.
            </p>
          </div>
        </div>      </div>
    </div>
  );
};

export default DeliveryPage;
