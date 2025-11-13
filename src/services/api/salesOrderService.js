import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class SalesOrderService {
  constructor() {
    this.tableName = 'sales_order_c';
    this.updateableFields = [
      'Name',
      'deal_id_c',
      'contact_id_c', 
      'order_date_c',
      'amount_c',
      'description_c'
    ];
    this.allFields = [
      { field: { Name: 'Id' }},
      { field: { Name: 'Name' }},
      { field: { Name: 'deal_id_c' }},
      { field: { Name: 'contact_id_c' }},
      { field: { Name: 'order_date_c' }},
      { field: { Name: 'amount_c' }},
      { field: { Name: 'description_c' }},
      { field: { Name: 'CreatedOn' }},
      { field: { Name: 'ModifiedOn' }}
    ];
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const params = {
        fields: this.allFields,
        orderBy: [{ fieldName: 'ModifiedOn', sorttype: 'DESC' }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching sales orders:', error?.response?.data?.message || error.message);
      toast.error('Failed to load sales orders');
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const params = {
        fields: this.allFields
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching sales order ${id}:`, error?.response?.data?.message || error.message);
      toast.error('Failed to load sales order');
      return null;
    }
  }

  async create(salesOrderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Filter to only updateable fields and handle lookup fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (salesOrderData[field] !== undefined && salesOrderData[field] !== null && salesOrderData[field] !== '') {
          if (field === 'deal_id_c' || field === 'contact_id_c') {
            // Handle lookup fields - ensure we send only the ID
            filteredData[field] = typeof salesOrderData[field] === 'object' 
              ? salesOrderData[field].Id 
              : parseInt(salesOrderData[field]);
          } else {
            filteredData[field] = salesOrderData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Sales order created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating sales order:', error?.response?.data?.message || error.message);
      toast.error('Failed to create sales order');
      return null;
    }
  }

  async update(id, salesOrderData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Filter to only updateable fields and handle lookup fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (salesOrderData[field] !== undefined && salesOrderData[field] !== null && salesOrderData[field] !== '') {
          if (field === 'deal_id_c' || field === 'contact_id_c') {
            // Handle lookup fields - ensure we send only the ID
            filteredData[field] = typeof salesOrderData[field] === 'object' 
              ? salesOrderData[field].Id 
              : parseInt(salesOrderData[field]);
          } else {
            filteredData[field] = salesOrderData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Sales order updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating sales order:', error?.response?.data?.message || error.message);
      toast.error('Failed to update sales order');
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} sales orders:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Sales order deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting sales order:', error?.response?.data?.message || error.message);
      toast.error('Failed to delete sales order');
      return false;
    }
  }
}

export const salesOrderService = new SalesOrderService();