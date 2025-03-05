import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Select, message, Popconfirm, Space, Card, Alert, Tabs } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, KeyOutlined, CalculatorOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import UserCalculations from '../components/user/UserCalculations';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      message.error('Không thể tải danh sách người dùng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      if (editingUser) {
        await userService.updateUser(editingUser.id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(values);
        message.success('Tạo người dùng mới thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error.message);
      message.error('Thao tác thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error.message);
      message.error('Xóa thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const newPassword = await userService.resetPassword(id);
      message.success(`Đặt lại mật khẩu thành công. Mật khẩu mới là: ${newPassword}`);
    } catch (error) {
      console.error('Reset password failed:', error);
      setError(error.message);
      message.error('Đặt lại mật khẩu thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Loại người dùng',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => type === 'admin' ? 'Quản trị viên' : 'Người dùng',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <span style={{ color: active ? '#52c41a' : '#ff4d4f' }}>
          {active ? 'Đang hoạt động' : 'Đã khóa'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận đặt lại mật khẩu"
            description="Bạn có chắc chắn muốn đặt lại mật khẩu của người dùng này về '123456'?"
            icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            onConfirm={() => handleResetPassword(record.id)}
            okText="Đặt lại"
            cancelText="Hủy"
          >
            <Button
              icon={<KeyOutlined />}
              loading={loading}
            >
              Đặt lại mật khẩu
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xác nhận xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'users',
      label: (
        <span>
          <UserAddOutlined />
          Danh sách người dùng
        </span>
      ),
      children: (
        <>
          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setModalVisible(true);
            }}
            style={{ marginBottom: 16 }}
          >
            Thêm người dùng mới
          </Button>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} người dùng`,
              pageSize: 10
            }}
          />
        </>
      )
    },
    {
      key: 'calculations',
      label: (
        <span>
          <CalculatorOutlined />
          Tính toán của người dùng
        </span>
      ),
      children: <UserCalculations users={users} />
    }
  ];

  return (
    <Card title="Quản lý người dùng" variant="outlined">
      <Tabs items={items} />

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
          setError(null);
        }}
        onOk={form.submit}
        okText={editingUser ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { type: 'text', message: 'Tên đăng nhập không hợp lệ!' }
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="user_type"
            label="Loại người dùng"
            rules={[{ required: true, message: 'Vui lòng chọn loại người dùng!' }]}
          >
            <Select>
              <Select.Option value="admin">Quản trị viên</Select.Option>
              <Select.Option value="user">Người dùng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;