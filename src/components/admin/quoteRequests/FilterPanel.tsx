import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  customerTypeFilter: string;
  setCustomerTypeFilter: (type: string) => void;
  deliveryTypeFilter: string;
  setDeliveryTypeFilter: (type: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  customerTypeFilter,
  setCustomerTypeFilter,
  deliveryTypeFilter,
  setDeliveryTypeFilter,
  dateFilter,
  setDateFilter,
  onReset
}) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email, société, ID..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center h-full border border-gray-200 rounded-md p-2">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Filtres supplémentaires */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">Type de client</label>
          <select
            id="customerType"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            <option value="all">Tous les clients</option>
            <option value="professional">Professionnels</option>
            <option value="individual">Particuliers</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="deliveryType" className="block text-sm font-medium text-gray-700 mb-1">Type de livraison</label>
          <select
            id="deliveryType"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={deliveryTypeFilter}
            onChange={(e) => setDeliveryTypeFilter(e.target.value)}
          >
            <option value="all">Toutes livraisons</option>
            <option value="pickup">Retrait</option>
            <option value="eco">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <select
            id="dateFilter"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Utilisez les filtres pour affiner votre recherche
        </div>
        {(searchTerm || statusFilter !== 'all' || customerTypeFilter !== 'all' || deliveryTypeFilter !== 'all' || dateFilter !== 'all') && (
          <button
            onClick={onReset}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;