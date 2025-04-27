import React from 'react';
import { Users, Calendar, Package, Truck, MapPin, Clock, FileText } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { QuoteRequestActions } from './QuoteRequestActions';
import { formatDate, getStatusColor, getStatusLabel, getDeliveryTypeLabel, getTimeSlotLabel, getAccessLabel } from './QuoteRequestUtils';

interface QuoteRequestDetailsProps {
  selectedRequest: QuoteRequest;
  handleUpdateStatus: (id: string, status: string) => Promise<void>;
  handleExportPDF: () => void;
  handlePrint: () => void;
  handleGenerateResponse: () => void;
  generatingResponse: boolean;
  loading: boolean;
}

const QuoteRequestDetails: React.FC<QuoteRequestDetailsProps> = ({
  selectedRequest,
  handleUpdateStatus,
  handleExportPDF,
  handlePrint,
  handleGenerateResponse,
  generatingResponse,
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Details Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Détails de la demande</h2>
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
            {getStatusLabel(selectedRequest.status)}
          </span>
        </div>
        <p className="text-sm text-gray-500">ID: {selectedRequest.id?.substring(0,8).toUpperCase() || 'N/A'} • Reçu le: {formatDate(selectedRequest.created_at)}</p>
      </div>

      {/* Details Content */}
      <div className="p-6 space-y-6">
        {/* Client Info */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Informations client
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Nom</span> <span className="font-medium text-gray-900">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Société</span> <span className="font-medium text-gray-900">{selectedRequest.company || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg truncate"><span className="text-gray-600 block mb-1">Email</span> <span className="font-medium text-gray-900">{selectedRequest.email || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Téléphone</span> <span className="font-medium text-gray-900">{selectedRequest.phone || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2"><span className="text-gray-600 block mb-1">Facturation</span> <span className="font-medium text-gray-900">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span></div>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" /> Détails de l'événement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.event_date ? formatDate(selectedRequest.event_date).split(' ')[0] : '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Durée</span> <span className="font-medium text-gray-900">{selectedRequest.event_duration || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Début</span> <span className="font-medium text-gray-900">{selectedRequest.event_start_time || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Fin</span> <span className="font-medium text-gray-900">{selectedRequest.event_end_time || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Invités</span> <span className="font-medium text-gray-900">{selectedRequest.guest_count || '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Lieu</span> <span className="font-medium text-gray-900">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
          </div>
          {selectedRequest.description && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
              <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">{selectedRequest.description}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" /> Articles demandés
          </h3>
          {selectedRequest.items && selectedRequest.items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix U.</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {selectedRequest.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.name || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-800 text-center">{item.quantity || 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-800 text-right">{(item.price || 0).toFixed(2)}€</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 text-right">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}€</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">Total TTC Indicatif</td>
                    <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right">
                      {(selectedRequest.items.reduce((total, item) => total + ((item.quantity || 0) * (item.price || 0)), 0)).toFixed(2)}€
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
              Aucun article spécifique listé dans cette demande.
            </div>
          )}
        </div>

        {/* Delivery / Pickup */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" /> Livraison / Retrait
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{getDeliveryTypeLabel(selectedRequest.delivery_type)}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Créneau</span> <span className="font-medium text-gray-900">{getTimeSlotLabel(selectedRequest.delivery_time_slot)}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2"><span className="text-gray-600 block mb-1">Adresse Livraison</span> <span className="font-medium text-gray-900">{[selectedRequest.delivery_address, selectedRequest.delivery_postal_code, selectedRequest.delivery_city].filter(Boolean).join(', ') || '-'}</span></div>
          </div>
        </div>

        {/* Access Info */}
        {(selectedRequest.exterior_access || selectedRequest.interior_access) && (
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> Accès
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Extérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.exterior_access)}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Intérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.interior_access)}</span></div>
              {selectedRequest.interior_access === 'elevator' && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Largeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</span></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Profondeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</span></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Ascenseur Hauteur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</span></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pickup Return */}
        {(selectedRequest.pickup_return_date || selectedRequest.pickup_return_start_time) && (
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" /> Détails reprise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_date ? formatDate(selectedRequest.pickup_return_date).split(' ')[0] : '-'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Début</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_start_time || '-'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Fin</span> <span className="font-medium text-gray-900">{selectedRequest.pickup_return_end_time || '-'}</span></div>
            </div>
          </div>
        )}

        {/* Comments */}
        {selectedRequest.comments && (
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> Commentaires client
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
              {selectedRequest.comments}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <QuoteRequestActions 
        selectedRequest={selectedRequest}
        handleUpdateStatus={handleUpdateStatus}
        handleExportPDF={handleExportPDF}
        handlePrint={handlePrint}
        handleGenerateResponse={handleGenerateResponse}
        generatingResponse={generatingResponse}
        loading={loading}
      />
    </div>
  );
};

export { QuoteRequestDetails };