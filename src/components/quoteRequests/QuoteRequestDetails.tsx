import React from 'react';
import { QuoteRequest } from '../../services/quoteRequestService';
import { Users, Package, Calendar, Clock, MapPin, Truck, FileText } from 'lucide-react';
import { formatDate, getDeliveryTypeLabel, getTimeSlotLabel, getAccessLabel } from '../../utils/formatters';

interface QuoteRequestDetailsProps {
  selectedRequest: QuoteRequest;
}

const QuoteRequestDetails: React.FC<QuoteRequestDetailsProps> = ({ selectedRequest }) => {
  // Calcul du montant total
  const totalAmount = (selectedRequest.items?.reduce((total, item) => 
    total + ((item.quantity || 0) * (item.price || 0)), 0) || 0).toFixed(2);

  return (
    <div className="space-y-5">
      {/* Client Info */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" /> Informations client
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><span className="text-gray-500">Nom:</span> <span className="font-medium text-gray-800">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
          <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
          <div><span className="text-gray-500">Société:</span> <span className="font-medium text-gray-800">{selectedRequest.company || '-'}</span></div>
          <div className="truncate"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedRequest.email || '-'}</span></div>
          <div><span className="text-gray-500">Téléphone:</span> <span className="font-medium text-gray-800">{selectedRequest.phone || '-'}</span></div>
          <div className="sm:col-span-2 truncate"><span className="text-gray-500">Facturation:</span> <span className="font-medium text-gray-800">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span></div>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" /> Détails de l'événement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</span></div>
          <div><span className="text-gray-500">Durée:</span> <span className="font-medium text-gray-800">{selectedRequest.event_duration || '-'}</span></div>
          <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.event_start_time || '-'}</span></div>
          <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.event_end_time || '-'}</span></div>
          <div><span className="text-gray-500">Invités:</span> <span className="font-medium text-gray-800">{selectedRequest.guest_count || '-'}</span></div>
          <div><span className="text-gray-500">Lieu:</span> <span className="font-medium text-gray-800">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
        </div>
        {selectedRequest.description && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Description:</p>
            <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{selectedRequest.description}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-indigo-500" /> Articles demandés
        </h3>
        {selectedRequest.items && selectedRequest.items.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix U.</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {selectedRequest.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">{item.name || 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 text-center">{item.quantity || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 text-right">{(item.price || 0).toFixed(2)}€</td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800 text-right">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={3} className="px-3 py-2 text-sm text-gray-800 text-right">Total TTC Indicatif</td>
                  <td className="px-3 py-2 text-sm font-bold text-indigo-700 text-right">
                    {totalAmount}€
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Aucun article spécifique listé dans cette demande.</p>
        )}
      </div>

      {/* Delivery / Pickup */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-indigo-500" /> Livraison / Retrait
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</span></div>
          <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</span></div>
          <div><span className="text-gray-500">Créneau:</span> <span className="font-medium text-gray-800">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</span></div>
          <div className="sm:col-span-2 truncate"><span className="text-gray-500">Adresse Livr.:</span> <span className="font-medium text-gray-800">{[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></div>
        </div>
      </div>

      {/* Access Info */}
      {(selectedRequest.exterior_access || selectedRequest.interior_access) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-500" /> Accès
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><span className="text-gray-500">Extérieur:</span> <span className="font-medium text-gray-800">{getAccessLabel(selectedRequest.exterior_access)}</span></div>
            <div><span className="text-gray-500">Intérieur:</span> <span className="font-medium text-gray-800">{getAccessLabel(selectedRequest.interior_access)}</span></div>
            {selectedRequest.interior_access === 'elevator' && (
              <>
                <div><span className="text-gray-500">Asc. L:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</span></div>
                <div><span className="text-gray-500">Asc. P:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</span></div>
                <div><span className="text-gray-500">Asc. H:</span> <span className="font-medium text-gray-800">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</span></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pickup Return */}
      {(selectedRequest.pickup_return_date || selectedRequest.pickup_return_start_time) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" /> Détails reprise
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_date ? formatDate(selectedRequest.pickup_return_date).split(' ')[0] : '-'}</span></div>
            <div><span className="text-gray-500">Début:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_start_time || '-'}</span></div>
            <div><span className="text-gray-500">Fin:</span> <span className="font-medium text-gray-800">{selectedRequest.pickup_return_end_time || '-'}</span></div>
          </div>
        </div>
      )}

      {/* Comments */}
      {selectedRequest.comments && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" /> Commentaires client
          </h3>
          <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
            {selectedRequest.comments}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteRequestDetails;