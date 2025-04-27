import { useState, useEffect } from 'react';
import { QuoteRequest } from '../services/quoteRequestService';

interface UseQuoteRequestFiltersResult {
  filteredRequests: QuoteRequest[];
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
  resetFilters: () => void;
}

export const useQuoteRequestFilters = (quoteRequests: QuoteRequest[]): UseQuoteRequestFiltersResult => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>(quoteRequests);

  // Reset all filters to default values
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCustomerTypeFilter('all');
    setDeliveryTypeFilter('all');
    setDateFilter('all');
  };

  // Apply filters whenever filter criteria or source data changes
  useEffect(() => {
    let filtered = [...quoteRequests];

    // Filter by search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(request =>
        request.first_name?.toLowerCase().includes(term) ||
        request.last_name?.toLowerCase().includes(term) ||
        request.email?.toLowerCase().includes(term) ||
        request.company?.toLowerCase().includes(term) ||
        request.phone?.includes(term) ||
        request.id?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by customer type
    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.customer_type === customerTypeFilter);
    }

    // Filter by delivery type
    if (deliveryTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.delivery_type === deliveryTypeFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at || '');
        switch (dateFilter) {
          case 'today':
            return requestDate >= today;
          case 'week':
            return requestDate >= startOfWeek;
          case 'month':
            return requestDate >= startOfMonth;
          case 'year':
            return requestDate >= startOfYear;
          default:
            return true;
        }
      });
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, customerTypeFilter, deliveryTypeFilter, dateFilter, quoteRequests]);

  return {
    filteredRequests,
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
    resetFilters
  };
};