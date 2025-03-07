import React from 'react';
import { Table, InputNumber } from 'antd';

const MonthlyDeviceTable = ({ readOnly, devices, onDeviceChange, totalPowerUsage, onDaysChange }) => {
  const columns = [
    { 
      title: 'Thứ tự', 
      dataIndex: 'key', 
      width: 60, 
      render: (_, __, index) => index + 1 
    },
    { title: 'Tên thiết bị', dataIndex: 'name' },
    { 
      title: 'Số lượng', 
      dataIndex: 'quantity',
      width: 80,
      render: (text) => text
    },
    { 
      title: 'Công suất (kW)', 
      dataIndex: 'power',
      width: 100,
      render: (text) => text?.toFixed(3)
    },
    { 
      title: 'Hệ số Cosφ', 
      dataIndex: 'cosPhi',
      width: 100,
      render: (text, record, index) => (
        readOnly ? (
          text?.toFixed(1)
        ) : (
          <InputNumber
            value={text}
            onChange={value => onDeviceChange(index, 'cosPhi', value)}
            min={0}
            max={1}
            step={0.1}
            style={{ width: '100%' }}
          />
        )
      )
    },
    { 
      title: 'Số giờ sử dụng trong ngày',
      dataIndex: 'hoursPerDay',
      width: 120,
      render: (text, record, index) => (
        readOnly ? (
          text
        ) : (
          <InputNumber
            value={text}
            onChange={value => onDeviceChange(index, 'hoursPerDay', value)}
            min={0}
            max={24}
            precision={0}
            parser={value => Math.round(Number(value) || 0)}
            formatter={value => Math.round(Number(value) || 0)}
            style={{ width: '100%' }}
          />
        )
      )
    },
    { 
      title: 'Số ngày sử dụng trong kỳ',
      dataIndex: 'daysPerPeriod',
      width: 120,
      render: (text, record, index) => (
        readOnly ? (
          text
        ) : (
          <InputNumber
            value={text}
            onChange={value => onDaysChange(index, value)}
            min={0}
            max={31}
            precision={1}
            style={{ width: '100%' }}
          />
        )
      )
    },
    {
      title: 'Điện năng sử dụng trong kỳ (kWh)',
      dataIndex: 'powerUsage',
      width: 150,
      render: (text) => text?.toFixed(2)
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={devices}
      pagination={false}
      bordered
      size="small"
      summary={() => (
        <Table.Summary>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={7}>Tổng cộng</Table.Summary.Cell>
            <Table.Summary.Cell index={7}>{totalPowerUsage.toFixed(2)}</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
};

export default MonthlyDeviceTable;