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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 transition-all duration-300 hover:shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email, société, ID..."
            className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center h-full border-2 border-gray-200 rounded-lg p-2 hover:border-indigo-500 transition-all duration-200">
            <Filter className="h-5 w-5 text-gray-400 mr-3" />
            <select
              className="block w-full pl-3 pr-10 py-2.5 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="transition-all duration-200 hover:transform hover:scale-102">
          <label htmlFor="customerType" className="block text-sm font-semibold text-gray-700 mb-2">Type de client</label>
          <select
            id="customerType"
            className="block w-full pl-4 pr-10 py-3 border-2 border-gray-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            <option value="all">Tous les clients</option>
            <option value="professional">Professionnels</option>
            <option value="individual">Particuliers</option>
          </select>
        </div>
        
        <div className="transition-all duration-200 hover:transform hover:scale-102">
          <label htmlFor="deliveryType" className="block text-sm font-semibold text-gray-700 mb-2">Type de livraison</label>
          <select
            id="deliveryType"
            className="block w-full pl-4 pr-10 py-3 border-2 border-gray-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
            value={deliveryTypeFilter}
            onChange={(e) => setDeliveryTypeFilter(e.target.value)}
          >
            <option value="all">Toutes livraisons</option>
            <option value="pickup">Retrait</option>
            <option value="eco">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div className="transition-all duration-200 hover:transform hover:scale-102">
          <label htmlFor="dateFilter" className="block text-sm font-semibold text-gray-700 mb-2">Période</label>
          <select
            id="dateFilter"
            className="block w-full pl-4 pr-10 py-3 border-2 border-gray-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
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
      
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 italic">
          Utilisez les filtres pour affiner votre recherche
        </div>
        {(searchTerm || statusFilter !== 'all' || customerTypeFilter !== 'all' || deliveryTypeFilter !== 'all' || dateFilter !== 'all') && (
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;