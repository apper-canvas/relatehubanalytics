import { getApperClient } from "@/services/apperClient";

class ActivityService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.getRecordById('activity_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
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
      console.error(`Error fetching activity ${id}:`, error.message);
      throw error;
    }
  }

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching activities for contact ${contactId}:`, error.message);
      throw error;
    }
  }

  async getByDealId(dealId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "deal_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)]
        }],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching activities for deal ${dealId}:`, error.message);
      throw error;
    }
  }

  async create(activityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        contact_id_c: activityData.contact_id_c || activityData.contactId,
        deal_id_c: activityData.deal_id_c || activityData.dealId,
        type_c: activityData.type_c || activityData.type,
        description_c: activityData.description_c || activityData.description,
        timestamp_c: activityData.timestamp_c || activityData.timestamp
      };

      // Remove undefined values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      // Ensure IDs are integers if present
      if (cleanData.contact_id_c) {
        cleanData.contact_id_c = parseInt(cleanData.contact_id_c);
      }
      if (cleanData.deal_id_c) {
        cleanData.deal_id_c = parseInt(cleanData.deal_id_c);
      }

      const response = await apperClient.createRecord('activity_c', {
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
          console.error(`Failed to create ${failed.length} activities:`, failed);
          throw new Error('Failed to create activity');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating activity:", error.message);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        Id: parseInt(id),
        contact_id_c: activityData.contact_id_c || activityData.contactId,
        deal_id_c: activityData.deal_id_c || activityData.dealId,
        type_c: activityData.type_c || activityData.type,
        description_c: activityData.description_c || activityData.description,
        timestamp_c: activityData.timestamp_c || activityData.timestamp
      };

      // Remove undefined values (keep Id)
      Object.keys(cleanData).forEach(key => {
        if (key !== 'Id' && cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      // Ensure IDs are integers if present
      if (cleanData.contact_id_c) {
        cleanData.contact_id_c = parseInt(cleanData.contact_id_c);
      }
      if (cleanData.deal_id_c) {
        cleanData.deal_id_c = parseInt(cleanData.deal_id_c);
      }

      const response = await apperClient.updateRecord('activity_c', {
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
          console.error(`Failed to update ${failed.length} activities:`, failed);
          throw new Error('Failed to update activity');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating activity ${id}:`, error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.deleteRecord('activity_c', {
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
          console.error(`Failed to delete ${failed.length} activities:`, failed);
          throw new Error('Failed to delete activity');
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting activity ${id}:`, error.message);
      throw error;
    }
  }
}

export const activityService = new ActivityService();