import axios from 'axios';

const DataService = {
  async postDataNoAuth(url, data) {
    try {
      const response = await axios.post(url, data);
      return response.data.message;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async getDataNoAuth(url) {
    try {
      const response = await axios.get(url);
      return response.data.message;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async patchDataNoAuth(url,data) {
    try {
      const response = await axios.patch(url,data);
      return response.data.message;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async deleteDataNoAuth(url) {
    try {
      const response = await axios.delete(url);
      return response.data.message;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async handleError(error) {
    if (error.response) throw error.response.data.message;
    throw error.message;
  },
};

export default DataService;
