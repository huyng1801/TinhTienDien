import { apiClient } from './apiClient';

export const calculationService = {
  async saveCalculation(data, userId) {
    try {
      if (!userId) throw new Error('Người dùng chưa đăng nhập');

      const calculationData = {
        customer_id: data.customerInfo.customerId,
        customer_name: data.customerInfo.customerName,
        meter_count: data.customerInfo.meterCount,
        devices: data.deviceInventory,
        compensation_data: data.compensationData,
        monthly_devices: data.monthlyDevices,
        paid_electricity: Object.fromEntries(
          data.compensationData.map((period) => [
            period.key,
            data.monthlyDevices[period.key]?.paidElectricity || 0,
          ])
        ),
        created_by: userId,
      };
      const response = await apiClient.post('/calculations', calculationData);
      return response.data;
    } catch (error) {
      console.error('Save calculation error:', error);
      throw error;
    }
  },

  async getCalculations() {
    try {
      const response = await apiClient.get('/calculations');
      return response.data;
    } catch (error) {
      console.error('Get calculations error:', error);
      throw error;
    }
  },

  async getCalculationByUserId(UserId) {
    try {
      const response = await apiClient.get(`/calculations/${UserId}`);
      return response.data;
    } catch (error) {
      console.error('Get calculation error:', error);
      throw error;
    }
  },

  async deleteCalculation(customerId) {
    try {
      await apiClient.delete(`/calculations/${customerId}`);
      return true;
    } catch (error) {
      console.error('Delete calculation error:', error);
      throw error;
    }
  },
};
