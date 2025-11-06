import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { quoteService } from '@/services/api/quoteService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SearchBar from '@/components/molecules/SearchBar';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    deal: '',
    contact_id: '',
    deal_id: '',
    quote_date: '',
    status: 'Draft',
    delivery_method: 'Email',
    expires_on: '',
    billing_address: {
      bill_to_name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    },
    shipping_address: {
      ship_to_name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    },
    quote_value: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [sameAsBilling, setSameAsBilling] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = [...quotes];

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.deal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.delivery_method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddQuote = () => {
    setEditingQuote(null);
    setFormData({
      company: '',
      contact: '',
      deal: '',
      contact_id: '',
      deal_id: '',
      quote_date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      delivery_method: 'Email',
      expires_on: '',
      billing_address: {
        bill_to_name: '',
        street: '',
        city: '',
        state: '',
        country: 'USA',
        pincode: ''
      },
      shipping_address: {
        ship_to_name: '',
        street: '',
        city: '',
        state: '',
        country: 'USA',
        pincode: ''
      },
      quote_value: ''
    });
    setFormErrors({});
    setSameAsBilling(false);
    setIsModalOpen(true);
  };

  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setFormData({
      company: quote.company || '',
      contact: quote.contact || '',
      deal: quote.deal || '',
      contact_id: quote.contact_id || '',
      deal_id: quote.deal_id || '',
      quote_date: quote.quote_date || '',
      status: quote.status || 'Draft',
      delivery_method: quote.delivery_method || 'Email',
      expires_on: quote.expires_on || '',
      billing_address: {
        bill_to_name: quote.billing_address?.bill_to_name || '',
        street: quote.billing_address?.street || '',
        city: quote.billing_address?.city || '',
        state: quote.billing_address?.state || '',
        country: quote.billing_address?.country || 'USA',
        pincode: quote.billing_address?.pincode || ''
      },
      shipping_address: {
        ship_to_name: quote.shipping_address?.ship_to_name || '',
        street: quote.shipping_address?.street || '',
        city: quote.shipping_address?.city || '',
        state: quote.shipping_address?.state || '',
        country: quote.shipping_address?.country || 'USA',
        pincode: quote.shipping_address?.pincode || ''
      },
      quote_value: quote.quote_value || ''
    });
    setFormErrors({});
    setSameAsBilling(false);
    setIsModalOpen(true);
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await quoteService.delete(quoteId);
      setQuotes(prev => prev.filter(q => q.Id !== quoteId));
      toast.success('Quote deleted successfully');
    } catch (error) {
      toast.error('Failed to delete quote');
      console.error("Error deleting quote:", error);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.contact.trim()) errors.contact = 'Contact is required';
    if (!formData.deal.trim()) errors.deal = 'Deal is required';
    if (!formData.quote_date) errors.quote_date = 'Quote date is required';
    if (!formData.expires_on) errors.expires_on = 'Expiry date is required';
    
    // Billing address validation
    if (!formData.billing_address.bill_to_name.trim()) {
      errors.bill_to_name = 'Bill to name is required';
    }
    if (!formData.billing_address.street.trim()) {
      errors.billing_street = 'Billing street is required';
    }
    if (!formData.billing_address.city.trim()) {
      errors.billing_city = 'Billing city is required';
    }
    if (!formData.billing_address.state.trim()) {
      errors.billing_state = 'Billing state is required';
    }
    if (!formData.billing_address.pincode.trim()) {
      errors.billing_pincode = 'Billing pincode is required';
    }
    
    // Shipping address validation (if different from billing)
    if (!sameAsBilling) {
      if (!formData.shipping_address.ship_to_name.trim()) {
        errors.ship_to_name = 'Ship to name is required';
      }
      if (!formData.shipping_address.street.trim()) {
        errors.shipping_street = 'Shipping street is required';
      }
      if (!formData.shipping_address.city.trim()) {
        errors.shipping_city = 'Shipping city is required';
      }
      if (!formData.shipping_address.state.trim()) {
        errors.shipping_state = 'Shipping state is required';
      }
      if (!formData.shipping_address.pincode.trim()) {
        errors.shipping_pincode = 'Shipping pincode is required';
      }
    }

    // Validate expiry date is after quote date
    if (formData.quote_date && formData.expires_on) {
      if (new Date(formData.expires_on) <= new Date(formData.quote_date)) {
        errors.expires_on = 'Expiry date must be after quote date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the form errors');
      return;
    }

    try {
      let submissionData = { ...formData };
      
      // If same as billing, copy billing to shipping
      if (sameAsBilling) {
        submissionData.shipping_address = {
          ship_to_name: formData.billing_address.bill_to_name,
          street: formData.billing_address.street,
          city: formData.billing_address.city,
          state: formData.billing_address.state,
          country: formData.billing_address.country,
          pincode: formData.billing_address.pincode
        };
      }

      // Convert quote_value to number if provided
      if (submissionData.quote_value) {
        submissionData.quote_value = parseFloat(submissionData.quote_value);
      }

      if (editingQuote) {
        await quoteService.update(editingQuote.Id, submissionData);
        setQuotes(prev => prev.map(q => 
          q.Id === editingQuote.Id 
            ? { ...q, ...submissionData }
            : q
        ));
        toast.success('Quote updated successfully');
      } else {
        const newQuote = await quoteService.create(submissionData);
        setQuotes(prev => [newQuote, ...prev]);
        toast.success('Quote created successfully');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingQuote ? 'Failed to update quote' : 'Failed to create quote');
      console.error("Error saving quote:", error);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('billing_address.')) {
      const addressField = field.replace('billing_address.', '');
      setFormData(prev => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('shipping_address.')) {
      const addressField = field.replace('shipping_address.', '');
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSameAsBillingChange = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shipping_address: {
          ship_to_name: prev.billing_address.bill_to_name,
          street: prev.billing_address.street,
          city: prev.billing_address.city,
          state: prev.billing_address.state,
          country: prev.billing_address.country,
          pincode: prev.billing_address.pincode
        }
      }));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Expired': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadQuotes} />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage and track your business quotes</p>
        </div>
        <Button onClick={handleAddQuote} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search quotes by company, contact, deal..."
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Empty 
          message="No quotes found"
          description="Create your first quote or adjust your search criteria"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredQuotes.map((quote) => (
                    <motion.tr
                      key={quote.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quote.company}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.contact}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.deal}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(quote.quote_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(quote.expires_on)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(quote.quote_value)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.delivery_method}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuote(quote)}
                          >
                            <ApperIcon name="Edit" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuote(quote.Id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingQuote ? 'Edit Quote' : 'Create Quote'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <ApperIcon name="X" size={20} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Company"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      error={formErrors.company}
                      required
                    />
                    <FormField
                      label="Contact"
                      value={formData.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      error={formErrors.contact}
                      required
                    />
                    <FormField
                      label="Deal"
                      value={formData.deal}
                      onChange={(e) => handleChange('deal', e.target.value)}
                      error={formErrors.deal}
                      required
                    />
                    <FormField
                      label="Quote Value"
                      type="number"
                      step="0.01"
                      value={formData.quote_value}
                      onChange={(e) => handleChange('quote_value', e.target.value)}
                    />
                    <FormField
                      label="Quote Date"
                      type="date"
                      value={formData.quote_date}
                      onChange={(e) => handleChange('quote_date', e.target.value)}
                      error={formErrors.quote_date}
                      required
                    />
                    <FormField
                      label="Expires On"
                      type="date"
                      value={formData.expires_on}
                      onChange={(e) => handleChange('expires_on', e.target.value)}
                      error={formErrors.expires_on}
                      required
                    />
                    <FormField
                      label="Status"
                      type="select"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      options={[
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Sent', label: 'Sent' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Rejected', label: 'Rejected' },
                        { value: 'Expired', label: 'Expired' }
                      ]}
                    />
                    <FormField
                      label="Delivery Method"
                      type="select"
                      value={formData.delivery_method}
                      onChange={(e) => handleChange('delivery_method', e.target.value)}
                      options={[
                        { value: 'Email', label: 'Email' },
                        { value: 'Mail', label: 'Mail' },
                        { value: 'Pickup', label: 'Pickup' },
                        { value: 'Delivery', label: 'Delivery' }
                      ]}
                    />
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Bill To Name"
                        value={formData.billing_address.bill_to_name}
                        onChange={(e) => handleChange('billing_address.bill_to_name', e.target.value)}
                        error={formErrors.bill_to_name}
                        required
                      />
                      <div></div>
                      <FormField
                        label="Street"
                        value={formData.billing_address.street}
                        onChange={(e) => handleChange('billing_address.street', e.target.value)}
                        error={formErrors.billing_street}
                        required
                        className="md:col-span-2"
                      />
                      <FormField
                        label="City"
                        value={formData.billing_address.city}
                        onChange={(e) => handleChange('billing_address.city', e.target.value)}
                        error={formErrors.billing_city}
                        required
                      />
                      <FormField
                        label="State"
                        value={formData.billing_address.state}
                        onChange={(e) => handleChange('billing_address.state', e.target.value)}
                        error={formErrors.billing_state}
                        required
                      />
                      <FormField
                        label="Country"
                        value={formData.billing_address.country}
                        onChange={(e) => handleChange('billing_address.country', e.target.value)}
                      />
                      <FormField
                        label="Pincode"
                        value={formData.billing_address.pincode}
                        onChange={(e) => handleChange('billing_address.pincode', e.target.value)}
                        error={formErrors.billing_pincode}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sameAsBilling}
                          onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Same as billing address</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Ship To Name"
                        value={formData.shipping_address.ship_to_name}
                        onChange={(e) => handleChange('shipping_address.ship_to_name', e.target.value)}
                        error={formErrors.ship_to_name}
                        required={!sameAsBilling}
                        disabled={sameAsBilling}
                      />
                      <div></div>
                      <FormField
                        label="Street"
                        value={formData.shipping_address.street}
                        onChange={(e) => handleChange('shipping_address.street', e.target.value)}
                        error={formErrors.shipping_street}
                        required={!sameAsBilling}
                        disabled={sameAsBilling}
                        className="md:col-span-2"
                      />
                      <FormField
                        label="City"
                        value={formData.shipping_address.city}
                        onChange={(e) => handleChange('shipping_address.city', e.target.value)}
                        error={formErrors.shipping_city}
                        required={!sameAsBilling}
                        disabled={sameAsBilling}
                      />
                      <FormField
                        label="State"
                        value={formData.shipping_address.state}
                        onChange={(e) => handleChange('shipping_address.state', e.target.value)}
                        error={formErrors.shipping_state}
                        required={!sameAsBilling}
                        disabled={sameAsBilling}
                      />
                      <FormField
                        label="Country"
                        value={formData.shipping_address.country}
                        onChange={(e) => handleChange('shipping_address.country', e.target.value)}
                        disabled={sameAsBilling}
                      />
                      <FormField
                        label="Pincode"
                        value={formData.shipping_address.pincode}
                        onChange={(e) => handleChange('shipping_address.pincode', e.target.value)}
                        error={formErrors.shipping_pincode}
                        required={!sameAsBilling}
                        disabled={sameAsBilling}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingQuote ? 'Update Quote' : 'Create Quote'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quotes;