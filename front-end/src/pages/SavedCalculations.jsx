import React, { useState, useEffect } from 'react';
import { Table, Card, Button, message, Popconfirm, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { calculationService } from '../services/calculationService';
import dayjs from 'dayjs';

const SavedCalculations = () => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const data = await calculationService.getCalculations();
      setCalculations(data);
    } catch (error) {
      console.error('Fetch calculations error:', error);
      message.error('Không thể tải danh sách tính toán: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  const handleDelete = async (customerId) => {
    try {
      setLoading(true);
      await calculationService.deleteCalculation(customerId);
      message.success('Xóa dữ liệu thành công');
      fetchCalculations();
    } catch (error) {
      console.error('Delete calculation error:', error);
      message.error('Xóa dữ liệu thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã khách hàng',
      dataIndex: 'customer_id',
      key: 'customer_id',
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Số lượng đồng hồ',
      dataIndex: 'meter_count',
      key: 'meter_count',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xác nhận xóa dữ liệu"
            description="Bạn có chắc chắn muốn xóa dữ liệu tính toán này?"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record.customer_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              loading={loading}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Danh sách tính toán đã lưu">
      <Table
        columns={columns}
        dataSource={calculations}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default SavedCalculations;