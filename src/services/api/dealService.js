import { getApperClient } from "@/services/apperClient";

class DealService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.getRecordById('deal_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error.message);
      throw error;
    }
  }

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        title_c: dealData.title_c || dealData.title,
        value_c: dealData.value_c || dealData.value,
        stage_c: dealData.stage_c || dealData.stage,
        probability_c: dealData.probability_c || dealData.probability,
        expected_close_date_c: dealData.expected_close_date_c || dealData.expectedCloseDate,
        contact_id_c: dealData.contact_id_c || dealData.contactId
      };

      // Remove undefined values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      // Ensure contact_id_c is integer if present
      if (cleanData.contact_id_c) {
        cleanData.contact_id_c = parseInt(cleanData.contact_id_c);
      }

      const response = await apperClient.createRecord('deal_c', {
        records: [cleanData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          throw new Error('Failed to create deal');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating deal:", error.message);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        Id: parseInt(id),
        title_c: dealData.title_c || dealData.title,
        value_c: dealData.value_c || dealData.value,
        stage_c: dealData.stage_c || dealData.stage,
        probability_c: dealData.probability_c || dealData.probability,
        expected_close_date_c: dealData.expected_close_date_c || dealData.expectedCloseDate,
        contact_id_c: dealData.contact_id_c || dealData.contactId
      };

      // Remove undefined values (keep Id)
      Object.keys(cleanData).forEach(key => {
        if (key !== 'Id' && cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      // Ensure contact_id_c is integer if present
      if (cleanData.contact_id_c) {
        cleanData.contact_id_c = parseInt(cleanData.contact_id_c);
      }

      const response = await apperClient.updateRecord('deal_c', {
        records: [cleanData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          throw new Error('Failed to update deal');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating deal ${id}:`, error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.deleteRecord('deal_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          throw new Error('Failed to delete deal');
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting deal ${id}:`, error.message);
      throw error;
    }
  }
}

export const dealService = new DealService();