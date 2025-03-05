import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const ChangePasswordForm = () => {
  const { user, login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Xác thực mật khẩu cũ
      await login(user.email, values.old_password);

      // Cập nhật mật khẩu mới
      await userService.updateUser(user.id, {
        ...user,
        password: values.new_password
      });

      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      console.error('Change password failed:', error);
      message.error('Đổi mật khẩu thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="old_password"
        label="Mật khẩu hiện tại"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="new_password"
        label="Mật khẩu mới"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        label="Xác nhận mật khẩu mới"
        dependencies={['new_password']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('new_password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;