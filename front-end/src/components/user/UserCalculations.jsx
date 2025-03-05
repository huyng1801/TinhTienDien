import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Button, Modal, Tabs, message } from 'antd';
import { EyeOutlined, TableOutlined, CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { calculationService } from '../../services/calculationService';
import dayjs from 'dayjs';
import DeviceInventory from '../DeviceInventory';
import CompensationCalculator from '../CompensationCalculator';
import AdditionalInfo from '../additional-info/AdditionalInfo';

const UserCalculations = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingCalculation, setViewingCalculation] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const data = await calculationService.getCalculations();
      
      // Lọc theo người dùng nếu có
      const filteredData = selectedUser 
        ? data.filter(calc => calc.created_by === selectedUser)
        : data;
      
      setCalculations(filteredData);
    } catch (error) {
      console.error('Fetch calculations error:', error);
      message.error('Không thể tải danh sách tính toán: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [selectedUser]);

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
      title: 'Người tính toán',
      key: 'created_by',
      render: (_, record) => {
        const user = users.find(u => u.id === record.created_by);
        return user ? user.full_name : 'N/A';
      }
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
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setViewingCalculation(record);
            setActiveTab('1'); // Reset về tab đầu tiên khi mở modal
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const renderCalculationDetails = () => {
    if (!viewingCalculation) return null;

    const tabItems = [
      {
        key: '1',
        label: (
          <span>
            <TableOutlined />
            Bảng kê CS-SH
          </span>
        ),
        children: (
          <div style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <DeviceInventory readOnly initialDevices={viewingCalculation.devices} />
          </div>
        )
      },
      {
        key: '2',
        label: (
          <span>
            <CalculatorOutlined />
            Thỏa thuận thời gian VP
          </span>
        ),
        children: (
          <div style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <CompensationCalculator 
              readOnly 
              initialData={viewingCalculation.compensation_data}
            />
          </div>
        )
      },
      {
        key: '3',
        label: (
          <span>
            <InfoCircleOutlined />
            Bảng tính ĐN, TĐ - SHBT
          </span>
        ),
        children: (
          <div style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <AdditionalInfo 
              readOnly 
              initialData={{
                compensationData: viewingCalculation.compensation_data,
                monthlyDevices: viewingCalculation.monthly_devices
              }}
            />
          </div>
        )
      }
    ];

    return (
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <h3>Thông tin khách hàng:</h3>
          <p>Mã khách hàng: {viewingCalculation.customer_id}</p>
          <p>Tên khách hàng: {viewingCalculation.customer_name}</p>
          <p>Số lượng đồng hồ: {viewingCalculation.meter_count}</p>
        </div>

        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
          destroyInactiveTabPane
        />
      </div>
    );
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn người dùng để lọc"
          allowClear
          onChange={setSelectedUser}
          options={users.map(user => ({
            label: `${user.full_name} (${user.email})`,
            value: user.id
          }))}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={calculations}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Chi tiết tính toán"
        open={!!viewingCalculation}
        onCancel={() => {
          setViewingCalculation(null);
          setActiveTab('1');
        }}
        width="90%"
        styles={{
          header: {
            marginBottom: 16
          },
          body: {
            maxHeight: 'calc(100vh)',
          },
          mask: {
            backdropFilter: 'blur(4px)'
          }
        }}
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => {
            setViewingCalculation(null);
            setActiveTab('1');
          }}>
            Đóng
          </Button>
        ]}
      >
        {renderCalculationDetails()}
      </Modal>
    </div>
  );
};

export default UserCalculations;