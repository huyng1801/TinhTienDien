import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const ProfileForm = () => {
  const { user, login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        full_name: user.full_name
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(user.id, {
        ...user,
        full_name: values.full_name
      });
      
      // Cập nhật thông tin user trong context
      await login(user.email, values.confirm_password);
      
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Update profile failed:', error);
      message.error('Cập nhật thông tin thất bại: ' + error.message);
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
        name="email"
        label="Tên đăng nhập"
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        name="full_name"
        label="Họ và tên"
        rules={[
          { required: true, message: 'Vui lòng nhập họ và tên!' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        label="Nhập mật khẩu để xác nhận"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu để xác nhận!' }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Cập nhật thông tin
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;