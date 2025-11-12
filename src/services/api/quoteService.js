import { getApperClient } from '@/services/apperClient';
import mockQuotes from '../mockData/quotes.json';

// Mock service implementation since no quote table exists in database
class QuoteService {
  constructor() {
    this.quotes = [...mockQuotes];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    try {
      return [...this.quotes].sort((a, b) => new Date(b.quote_date) - new Date(a.quote_date));
    } catch (error) {
      console.error("Error fetching quotes:", error);
      throw new Error("Failed to fetch quotes");
    }
  }

  async getById(id) {
    await this.delay();
    try {
      const quote = this.quotes.find(q => q.Id === parseInt(id));
      if (!quote) {
        throw new Error("Quote not found");
      }
      return { ...quote };
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error);
      throw error;
    }
  }

  async create(quoteData) {
    await this.delay();
    try {
      const newQuote = {
        ...quoteData,
        Id: Math.max(...this.quotes.map(q => q.Id), 0) + 1,
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString()
      };
      
      this.quotes.push(newQuote);
      return { ...newQuote };
    } catch (error) {
      console.error("Error creating quote:", error);
      throw new Error("Failed to create quote");
    }
  }

  async update(id, quoteData) {
    await this.delay();
    try {
      const index = this.quotes.findIndex(q => q.Id === parseInt(id));
      if (index === -1) {
        throw new Error("Quote not found");
      }
      
      this.quotes[index] = {
        ...this.quotes[index],
        ...quoteData,
        Id: parseInt(id),
        modified_date: new Date().toISOString()
      };
      
      return { ...this.quotes[index] };
    } catch (error) {
      console.error(`Error updating quote ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    await this.delay();
    try {
      const index = this.quotes.findIndex(q => q.Id === parseInt(id));
      if (index === -1) {
        throw new Error("Quote not found");
      }
      
      this.quotes.splice(index, 1);
      return true;
    } catch (error) {
      console.error(`Error deleting quote ${id}:`, error);
      throw error;
    }
  }

  async search(term) {
    await this.delay();
    try {
      if (!term) return this.getAll();
      
      const searchTerm = term.toLowerCase();
      return this.quotes.filter(quote => 
        quote.company?.toLowerCase().includes(searchTerm) ||
        quote.contact?.toLowerCase().includes(searchTerm) ||
        quote.deal?.toLowerCase().includes(searchTerm) ||
        quote.status?.toLowerCase().includes(searchTerm) ||
        quote.delivery_method?.toLowerCase().includes(searchTerm) ||
        quote.billing_address?.bill_to_name?.toLowerCase().includes(searchTerm) ||
        quote.shipping_address?.ship_to_name?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Error searching quotes:", error);
      throw new Error("Failed to search quotes");
    }
  }
}

// Export singleton instance
export const quoteService = new QuoteService();

// Export individual methods for flexibility
export const {
  getAll,
  getById,
  create,
  update,
  delete: deleteQuote,
  search
} = quoteService;