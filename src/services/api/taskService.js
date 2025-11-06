import { getApperClient } from "@/services/apperClient";

class TaskService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "due_date_c"}},
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
      console.error("Error fetching tasks:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.getRecordById('task_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "due_date_c"}},
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
      console.error(`Error fetching task ${id}:`, error.message);
      throw error;
    }
  }

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching tasks for contact ${contactId}:`, error.message);
      throw error;
    }
  }

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        title_c: taskData.title_c || taskData.title,
        completed_c: taskData.completed_c !== undefined ? taskData.completed_c : taskData.completed,
        due_date_c: taskData.due_date_c || taskData.dueDate,
        contact_id_c: taskData.contact_id_c || taskData.contactId
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

      const response = await apperClient.createRecord('task_c', {
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
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          throw new Error('Failed to create task');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating task:", error.message);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        Id: parseInt(id),
        title_c: taskData.title_c || taskData.title,
        completed_c: taskData.completed_c !== undefined ? taskData.completed_c : taskData.completed,
        due_date_c: taskData.due_date_c || taskData.dueDate,
        contact_id_c: taskData.contact_id_c || taskData.contactId
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

      const response = await apperClient.updateRecord('task_c', {
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
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          throw new Error('Failed to update task');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.deleteRecord('task_c', {
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
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          throw new Error('Failed to delete task');
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error.message);
      throw error;
    }
  }
}

export const taskService = new TaskService();