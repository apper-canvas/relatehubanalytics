import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { salesOrderService } from '@/services/api/salesOrderService';
import { dealService } from '@/services/api/dealService';
import { contactService } from '@/services/api/contactService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SearchBar from '@/components/molecules/SearchBar';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';

function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    deal_id_c: '',
    contact_id_c: '',
    order_date_c: '',
    amount_c: '',
    description_c: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSalesOrders();
    loadDeals();
    loadContacts();
  }, []);

  async function loadSalesOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await salesOrderService.getAll();
      setSalesOrders(data);
    } catch (err) {
      setError('Failed to load sales orders');
      console.error('Error loading sales orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeals() {
    try {
      const data = await dealService.getAll();
      setDeals(data);
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  }

  async function loadContacts() {
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }

  function filterSalesOrders() {
    if (!searchTerm.trim()) return salesOrders;
    
    return salesOrders.filter(order =>
      order.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deal_id_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact_id_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function handleSearch(term) {
    setSearchTerm(term);
  }

  function handleAddOrder() {
    setEditingOrder(null);
    setFormData({
      Name: '',
      deal_id_c: '',
      contact_id_c: '',
      order_date_c: '',
      amount_c: '',
      description_c: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  function handleEditOrder(order) {
    setEditingOrder(order);
    setFormData({
      Name: order.Name || '',
      deal_id_c: order.deal_id_c?.Id || '',
      contact_id_c: order.contact_id_c?.Id || '',
      order_date_c: order.order_date_c || '',
      amount_c: order.amount_c || '',
      description_c: order.description_c || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm('Are you sure you want to delete this sales order? This action cannot be undone.')) {
      return;
    }

    const success = await salesOrderService.delete(orderId);
    if (success) {
      setSalesOrders(prev => prev.filter(order => order.Id !== orderId));
    }
  }

  function validateForm() {
    const errors = {};
    
    if (!formData.Name?.trim()) {
      errors.Name = 'Order name is required';
    }
    
    if (!formData.amount_c || parseFloat(formData.amount_c) <= 0) {
      errors.amount_c = 'Amount must be greater than 0';
    }
    
    if (!formData.order_date_c) {
      errors.order_date_c = 'Order date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let result;
      if (editingOrder) {
        result = await salesOrderService.update(editingOrder.Id, formData);
        if (result) {
          setSalesOrders(prev => prev.map(order => 
            order.Id === editingOrder.Id ? result : order
          ));
        }
      } else {
        result = await salesOrderService.create(formData);
        if (result) {
          setSalesOrders(prev => [result, ...prev]);
        }
      }

      if (result) {
        setIsModalOpen(false);
        setEditingOrder(null);
        setFormData({
          Name: '',
          deal_id_c: '',
          contact_id_c: '',
          order_date_c: '',
          amount_c: '',
          description_c: ''
        });
      }
    } catch (error) {
      console.error('Error saving sales order:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function formatCurrency(value) {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value));
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function getDealName(dealId) {
    const deal = deals.find(d => d.Id === dealId);
    return deal?.Name || deal?.title_c || 'Unknown Deal';
  }

  function getContactName(contactId) {
    const contact = contacts.find(c => c.Id === contactId);
    return contact?.Name || contact?.name_c || 'Unknown Contact';
  }

  const filteredOrders = filterSalesOrders();

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSalesOrders} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Manage your sales orders and track order fulfillment</p>
        </div>
        <Button onClick={handleAddOrder} className="flex items-center space-x-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Order</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search orders by name, description, deal, or contact..."
            className="w-full"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden p-0">
        {filteredOrders.length === 0 ? (
          <Empty
            icon="ShoppingCart"
            title="No sales orders found"
            description={searchTerm ? "No orders match your search criteria." : "Start by creating your first sales order."}
            action={!searchTerm ? { label: "Add Order", onClick: handleAddOrder } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Order Name
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.Id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.Name}
                          </div>
                          {order.description_c && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {order.description_c}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {order.deal_id_c?.Name || getDealName(order.deal_id_c) || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {order.contact_id_c?.Name || getContactName(order.contact_id_c) || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount_c)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDate(order.order_date_c)}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            className="text-gray-600 hover:text-primary"
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.Id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingOrder ? 'Edit Sales Order' : 'Add Sales Order'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    label="Order Name"
                    type="text"
                    value={formData.Name}
                    onChange={(value) => handleChange('Name', value)}
                    error={formErrors.Name}
                    required
                  />

                  <FormField
                    label="Deal"
                    type="select"
                    value={formData.deal_id_c}
                    onChange={(value) => handleChange('deal_id_c', value)}
                    options={deals.map(deal => ({ 
                      value: deal.Id, 
                      label: deal.Name || deal.title_c || `Deal ${deal.Id}`
                    }))}
                    placeholder="Select a deal"
                  />

                  <FormField
                    label="Contact"
                    type="select"
                    value={formData.contact_id_c}
                    onChange={(value) => handleChange('contact_id_c', value)}
                    options={contacts.map(contact => ({ 
                      value: contact.Id, 
                      label: contact.Name || contact.name_c || `Contact ${contact.Id}`
                    }))}
                    placeholder="Select a contact"
                  />

                  <FormField
                    label="Order Date"
                    type="date"
                    value={formData.order_date_c}
                    onChange={(value) => handleChange('order_date_c', value)}
                    error={formErrors.order_date_c}
                    required
                  />

                  <FormField
                    label="Amount"
                    type="number"
                    value={formData.amount_c}
                    onChange={(value) => handleChange('amount_c', value)}
                    error={formErrors.amount_c}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />

                  <FormField
                    label="Description"
                    type="textarea"
                    value={formData.description_c}
                    onChange={(value) => handleChange('description_c', value)}
                    placeholder="Order description and notes..."
                    rows={3}
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SalesOrders;