import React from 'react';
import { Search, Filter, ArrowDownUp } from 'lucide-react';

interface FilterSearchBarProps {
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
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const FilterSearchBar: React.FC<FilterSearchBarProps> = ({
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
  sortOrder,
  setSortOrder
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email, société..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 mr-2">Filtres:</span>
          </div>
          
          {/* Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
            <option value="completed">Terminé</option>
          </select>
          
          {/* Type de client */}
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les clients</option>
            <option value="professional">Professionnels</option>
            <option value="individual">Particuliers</option>
          </select>
          
          {/* Type de livraison */}
          <select
            value={deliveryTypeFilter}
            onChange={(e) => setDeliveryTypeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Toutes livraisons</option>
            <option value="pickup">Retrait</option>
            <option value="eco">Standard</option>
            <option value="premium">Premium</option>
          </select>
          
          {/* Filtre par date */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Toutes dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          
          {/* Tri par date */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownUp className="h-4 w-4 mr-1" />
            {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { FilterSearchBar };