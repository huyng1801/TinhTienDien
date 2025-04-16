import React from 'react';
import { Table, Button, Input, InputNumber, message, Space } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSharedData } from '../../context/electricity-violation/SharedDataContext';
import { exportDeviceInventory } from '../../utils/electricity-violation/deviceInventoryExcelUtils';

const DeviceInventory2 = ({ readOnly, initialDevices }) => {
  const { businessDeviceInventory, updateBusinessDeviceInventory } = useSharedData();
  const [editingKey, setEditingKey] = React.useState('');

  // Use initialDevices if provided (for read-only view), otherwise use businessDeviceInventory from context
  const devices = initialDevices || businessDeviceInventory;
  

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    if (!readOnly) {
      setEditingKey(record.key);
    }
  };

  const save = async (key) => {
    if (readOnly) return;

    try {
      const row = devices.find(item => item.key === key);
      if (!row.name || !row.unit || !row.quantity || !row.power) {
        message.error('Vui lòng điền đầy đủ thông tin!');
        return;
      }
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = (key) => {
    if (readOnly) return;
    updateBusinessDeviceInventory(devices.filter(item => item.key !== key));
    message.success('Đã xóa thiết bị');
  };

  const handleAdd = () => {
    if (readOnly) return;
    const newKey = (Math.max(...devices.map(item => parseInt(item.key)), 0) + 1).toString();
    const newData = {
      key: newKey,
      name: '',
      unit: 'Cái',
      quantity: 1,
      power: 0,
      note: ''
    };
    updateBusinessDeviceInventory([...devices, newData]);
    setEditingKey(newKey);
  };

  const handleExport = () => {
    exportDeviceInventory(devices);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: '60px',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable && !readOnly ? (
          <Input
            defaultValue={text}
            onChange={e => {
              const newData = [...devices];
              const index = newData.findIndex(item => record.key === item.key);
              newData[index].name = e.target.value;
              updateBusinessDeviceInventory(newData);
            }}
          />
        ) : text;
      }
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      width: '120px',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable && !readOnly ? (
          <Input
            defaultValue={text}
            onChange={e => {
              const newData = [...devices];
              const index = newData.findIndex(item => record.key === item.key);
              newData[index].unit = e.target.value;
              updateBusinessDeviceInventory(newData);
            }}
          />
        ) : text;
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: '120px',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable && !readOnly ? (
          <InputNumber
            defaultValue={text}
            min={0}
            onChange={value => {
              const newData = [...devices];
              const index = newData.findIndex(item => record.key === item.key);
              newData[index].quantity = value;
              updateBusinessDeviceInventory(newData);
            }}
          />
        ) : text;
      }
    },
    {
      title: 'Công suất (kW)',
      dataIndex: 'power',
      width: '120px',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable && !readOnly ? (
          <InputNumber
            defaultValue={text}
            min={0}
            step={0.001}
            precision={3}
            onChange={value => {
              const newData = [...devices];
              const index = newData.findIndex(item => record.key === item.key);
              newData[index].power = value;
              updateBusinessDeviceInventory(newData);
            }}
          />
        ) : text?.toFixed(3);
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable && !readOnly ? (
          <Input
            defaultValue={text}
            onChange={e => {
              const newData = [...devices];
              const index = newData.findIndex(item => record.key === item.key);
              newData[index].note = e.target.value;
              updateBusinessDeviceInventory(newData);
            }}
          />
        ) : text;
      }
    }
  ];

  // Add actions column only if not in read-only mode
  if (!readOnly) {
    columns.push({
      title: 'Thao tác',
      width: '200px',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Button
            type="primary"
            onClick={() => save(record.key)}
            icon={<SaveOutlined />}
          >
            Lưu
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => edit(record)}
              icon={<EditOutlined />}
            >
              Sửa
            </Button>
            <Button
              danger
              onClick={() => handleDelete(record.key)}
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </div>
        );
      }
    });
  }

  return (
    <div>
      {!readOnly && (
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="primary"
              onClick={handleAdd}
            >
              Thêm thiết bị
            </Button>
            <Button
              onClick={handleExport}
              icon={<DownloadOutlined />}
            >
              Xuất Excel
            </Button>
          </Space>
        </Space>
      )}
      <Table
        columns={columns}
        dataSource={devices}
        pagination={false}
        bordered
        scroll={{ y: 'calc(100vh - 300px)' }}
      />
    </div>
  );
};

export default DeviceInventory2;