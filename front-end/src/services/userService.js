import { apiClient } from './apiClient';

export const userService = {
  async signIn(email, password) {
    try {
      const response = await apiClient.post('/users/signin', { email, password });
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Email hoặc mật khẩu không đúng');
    }
  },

  async getUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error('Không thể tải danh sách người dùng');
    }
  },

  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  async resetPassword(id) {
    try {
      const newPassword = '123456';
      await apiClient.put(`/users/${id}/reset-password`, { password: newPassword });
      return newPassword;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};
