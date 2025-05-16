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
      {/* Details Header - Improved with more prominent status */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">Détails de la demande</h2>
          <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
            {getStatusLabel(selectedRequest.status)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">ID: {selectedRequest.id?.substring(0,8).toUpperCase() || 'N/A'}</span>
          <span className="mx-2">•</span>
          <span>Reçu le: {formatDate(selectedRequest.created_at)}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex flex-wrap gap-2 justify-end">
        <button 
          onClick={() => handleUpdateStatus(selectedRequest.id || '', 'approved')}
          disabled={loading || selectedRequest.status === 'approved'}
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 border border-green-200 text-sm font-medium transition-all disabled:opacity-50"
        >
          Approuver
        </button>
        <button 
          onClick={() => handleUpdateStatus(selectedRequest.id || '', 'rejected')}
          disabled={loading || selectedRequest.status === 'rejected'}
          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 border border-red-200 text-sm font-medium transition-all disabled:opacity-50"
        >
          Rejeter
        </button>
        <button 
          onClick={handlePrint}
          disabled={loading}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium transition-all disabled:opacity-50"
        >
          Imprimer
        </button>
        <button 
          onClick={handleExportPDF}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 border border-blue-200 text-sm font-medium transition-all disabled:opacity-50"
        >
          Exporter PDF
        </button>
      </div>

      {/* Details Content - Reorganized for better scanning */}
      <div className="p-6 space-y-6">
        {/* Two-column layout for key information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" /> Informations client
            </h3>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Nom</span> <span className="font-medium text-gray-900">{selectedRequest.first_name} {selectedRequest.last_name}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{selectedRequest.customer_type === 'professional' ? 'Professionnel' : 'Particulier'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Société</span> <span className="font-medium text-gray-900">{selectedRequest.company || '-'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg truncate"><span className="text-gray-600 block mb-1">Email</span> <span className="font-medium text-gray-900">{selectedRequest.email || '-'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Téléphone</span> <span className="font-medium text-gray-900">{selectedRequest.phone || '-'}</span></div>
            </div>
          </div>

          {/* Event Info */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" /> Détails de l'événement
            </h3>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.event_date ? formatDate(selectedRequest.event_date.toString()).split(' ')[0] : '-'}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Durée</span> <span className="font-medium text-gray-900">{selectedRequest.event_duration || '-'}</span></div>
              <div className="grid grid-cols-2 gap-x-3">
                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Début</span> <span className="font-medium text-gray-900">{selectedRequest.event_start_time || '-'}</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Fin</span> <span className="font-medium text-gray-900">{selectedRequest.event_end_time || '-'}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-x-3">
                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Invités</span> <span className="font-medium text-gray-900">{selectedRequest.guest_count || '-'}</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Lieu</span> <span className="font-medium text-gray-900">{selectedRequest.event_location === 'indoor' ? 'Intérieur' : 'Extérieur'}</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Description */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" /> Description
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium text-gray-900">{selectedRequest.description || '-'}</span>
          </div>
        </div>

        {/* Billing Address */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" /> Adresse de facturation
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium text-gray-900">{[selectedRequest.billing_address, selectedRequest.postal_code, selectedRequest.city].filter(Boolean).join(', ') || '-'}</span>
          </div>
        </div>

        {/* Items - Improved table styling */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" /> Articles demandés
          </h3>
          {selectedRequest.items && selectedRequest.items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-indigo-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Article</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">Qté</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">Prix U.</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total</th>
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
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Type</span> <span className="font-medium text-gray-900">{getDeliveryTypeLabel(selectedRequest.delivery_type || undefined)}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Date</span> <span className="font-medium text-gray-900">{selectedRequest.delivery_date ? formatDate(selectedRequest.delivery_date).split(' ')[0] : '-'}</span></div>
            <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Créneau</span> <span className="font-medium text-gray-900">{getTimeSlotLabel(selectedRequest.delivery_time_slot || undefined)}</span></div>
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
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Extérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.exterior_access || undefined)}</span></div>
              <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Intérieur</span> <span className="font-medium text-gray-900">{getAccessLabel(selectedRequest.interior_access || undefined)}</span></div>
              {selectedRequest.interior_access === 'elevator' && (
                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Largeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_width ? `${selectedRequest.elevator_width} cm` : '-'}</span></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Profondeur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_depth ? `${selectedRequest.elevator_depth} cm` : '-'}</span></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-600 block mb-1">Hauteur</span> <span className="font-medium text-gray-900">{selectedRequest.elevator_height ? `${selectedRequest.elevator_height} cm` : '-'}</span></div>
                </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
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
    </div>
  );
};

export { QuoteRequestDetails };