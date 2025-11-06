import { getApperClient } from "@/services/apperClient";

class ContactService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.fetchRecords('contact_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "notes_c"}},
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
      console.error("Error fetching contacts:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.getRecordById('contact_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "notes_c"}},
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
      console.error(`Error fetching contact ${id}:`, error.message);
      throw error;
    }
  }

  async create(contactData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        name_c: contactData.name_c || contactData.name,
        company_c: contactData.company_c || contactData.company,
        email_c: contactData.email_c || contactData.email,
        phone_c: contactData.phone_c || contactData.phone,
        tags_c: contactData.tags_c || contactData.tags,
        notes_c: contactData.notes_c || contactData.notes
      };

      // Remove undefined values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      const response = await apperClient.createRecord('contact_c', {
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
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          throw new Error('Failed to create contact');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating contact:", error.message);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Only include updateable fields
      const cleanData = {
        Id: parseInt(id),
        name_c: contactData.name_c || contactData.name,
        company_c: contactData.company_c || contactData.company,
        email_c: contactData.email_c || contactData.email,
        phone_c: contactData.phone_c || contactData.phone,
        tags_c: contactData.tags_c || contactData.tags,
        notes_c: contactData.notes_c || contactData.notes
      };

      // Remove undefined values (keep Id)
      Object.keys(cleanData).forEach(key => {
        if (key !== 'Id' && cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      const response = await apperClient.updateRecord('contact_c', {
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
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          throw new Error('Failed to update contact');
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      const response = await apperClient.deleteRecord('contact_c', {
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
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          throw new Error('Failed to delete contact');
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error.message);
      throw error;
    }
  }
}

export const contactService = new ContactService();