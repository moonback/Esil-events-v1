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
          <h2 className="text-3xl font-bold mb-6">Nos services de livraison</h2>
          <p className="text-lg mb-6">
            ESIL Events vous propose des solutions adaptées à chaque besoin, du retrait sur place à l'installation clé en main par nos techniciens spécialisés. Nous garantissons une logistique sans faille pour votre événement.
          </p>
          <div className="w-20 h-1 bg-black mx-auto"></div>
        </div>
        
        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Option 1 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="bg-blue-600 text-white p-6 flex items-center">
              <Package className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-bold">Retrait sur place</h2>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold mb-4 text-blue-600">Gratuit</p>
              <p className="mb-6 text-gray-700">
                Récupérez votre matériel dans notre entrepôt à Mantes-la-Ville (78)
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Économique et flexible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Vérification du matériel avec notre équipe</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Horaires adaptés à vos besoins</span>
                </li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Prévoir :</strong> Un véhicule adapté au volume et notre équipe vous aidera au chargement
                </p>
              </div>
            </div>
          </div>
          
          {/* Option 2 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="bg-purple-600 text-white p-6 flex items-center">
              <Truck className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-bold">Livraison Standard</h2>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold mb-4 text-purple-600">À partir de 50€ HT</p>
              <p className="mb-6 text-gray-700">
                Livraison sur site avec déchargement par nos soins
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Livraison à l'adresse de votre événement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Déchargement par notre équipe</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Solution idéale pour les locations simples</span>
                </li>
              </ul>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Important :</strong> Vérifiez les accès (escaliers, ascenseurs, largeur des portes)
                </p>
              </div>
            </div>
          </div>
          
          {/* Option 3 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="bg-green-600 text-white p-6 flex items-center">
              <Settings className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-bold">Formule Premium</h2>
            </div>
            <div className="p-6">
              <p className="text-3xl font-bold mb-4 text-green-600">Sur devis</p>
              <p className="mb-6 text-gray-700">
                Service clé en main avec installation professionnelle
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Installation et démontage par nos techniciens</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Assistance technique pendant l'événement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Solution idéale pour les événements complexes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Disponible 7j/7 dans toute la France</span>
                </li>
              </ul>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Recommandé pour :</strong> les grandes installations, les événements professionnels et les lieux complexes
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Delivery Process */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-blue-600" />
              Processus de livraison
            </h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Réservation</h3>
                  <p className="text-gray-600">Réservez au moins 72h à l'avance (1 semaine pour la formule premium). Périodes de pointe : réservez plusieurs semaines à l'avance.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Préparation</h3>
                  <p className="text-gray-600">Nous préparons votre matériel et vous contactons pour confirmer les détails de livraison.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
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
        
        {/* Testimonials */}
        <div className="mb-20">
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
        </div>
        
        {/* FAQ */}
        <div className="mb-20">
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
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à organiser votre événement ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contactez-nous pour une solution de livraison adaptée à vos besoins
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/contact" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              Demander un devis
            </Link>
            <a 
              href="tel:+33123456789" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Nous appeler
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;