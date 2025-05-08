// src/components/DetailedCalculationView.jsx
import React, { useState, useEffect } from 'react';
import { Table, InputNumber, Space, Button   } from 'antd';
import { useSharedData } from '../../context/electricity-violation-production/SharedDataContext';
import { useCompensation } from '../../context/electricity-violation-production/CompensationContext';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportDetailedCalculation } from '../../utils/electricity-violation-production/detailedCalculationExcelUtils';

const OLD_PRICE = 1809;
const NEW_PRICE = 1896;

const DetailedCalculationView = () => {
  const { deviceInventory } = useSharedData();
  const { compensationData } = useCompensation();
  const [devices, setDevices] = useState([]);
  const [paidElectricity, setPaidElectricity] = useState({
    old: 4204,
    new: 4215
  });

  useEffect(() => {
    setDevices(deviceInventory.map(device => ({
      ...device,
      hoursPerDay: 0,
      cosPhi: device.cosPhi || 0.9
    })));
  }, [deviceInventory]);

  const calculateDailyPowerUsage = (device) => {
    return device.quantity * device.power * device.cosPhi * device.hoursPerDay;
  };

  const handleExport = () => {
    exportDetailedCalculation({
      devices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      OLD_PRICE,
      NEW_PRICE,
    });
  };
  
  const handleCosPhiChange = (index, value) => {
    const newDevices = [...devices];
    newDevices[index].cosPhi = value;
    setDevices(newDevices);
  };

  const handleHoursChange = (index, value) => {
    const newDevices = [...devices];
    newDevices[index].hoursPerDay = value;
    setDevices(newDevices);
  };

  const handlePaidElectricityChange = (period, value) => {
    setPaidElectricity(prev => ({
      ...prev,
      [period]: value
    }));
  };

  // Calculate period days based on compensationData
const { oldPeriodDays, newPeriodDays } = compensationData.reduce((acc, period) => {
  const startDate = dayjs(period.startDate);
  const endDate = dayjs(period.endDate);
  const compensationDays = Math.max(0, (period.violationDays || 0) - (period.outageDays || 0));

  // Determine period based on price change date
  if (period.isOldPrice) {
    acc.oldPeriodDays += compensationDays;
  } else {
    acc.newPeriodDays += compensationDays;
  }

  return acc;
}, { oldPeriodDays: 0, newPeriodDays: 0 });

  const columns = [
    {
      title: 'TT',
      dataIndex: 'key',
      width: 50,
      render: (_, __, index) => index + 1,
      align: 'center'
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      width: 200
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: 80,
      align: 'center'
    },
    {
      title: 'Công suất',
      dataIndex: 'power',
      width: 80,
      align: 'center',
      render: val => val?.toFixed(3)
    },
    {
      title: 'Cosφ phải nhập',
      dataIndex: 'cosPhi',
      width: 100,
      align: 'center',
      render: (value, _, index) => (
        <InputNumber
          value={value}
          onChange={value => handleCosPhiChange(index, value)}
          min={0}
          max={1}
          step={0.1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Số giờ SDD trong ngày',
      dataIndex: 'hoursPerDay',
      width: 120,
      align: 'center',
      render: (value, _, index) => (
        <InputNumber
          value={value}
          onChange={value => handleHoursChange(index, value)}
          min={0}
          max={24}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Điện năng bình quân ngày (kWh)',
      dataIndex: 'averageDailyUsage',
      width: 120,
      align: 'right',
      render: (_, record) => calculateDailyPowerUsage(record)?.toFixed(1)
    },
    {
      title: 'Số ngày vi phạm (Ngày)',
      dataIndex: 'compensationDays',
      width: 120,
      align: 'right'
    },
    {
      title: 'Điện năng sử dụng trong thời gian vi phạm (kWh)',
      dataIndex: 'totalUsage',
      width: 150,
      align: 'right'
    },
    {
      title: 'Điện năng đã phát hành hóa đơn trong thời gian vi phạm (kWh)',
      dataIndex: 'paidElectricity',
      width: 150,
      align: 'right'
    },
    {
      title: 'Điện năng bồi thường (kWh)',
      dataIndex: 'compensationAmount',
      width: 120,
      align: 'right'
    },
    {
      title: 'Giá bán điện',
      dataIndex: 'price',
      width: 100,
      align: 'right'
    },
    {
      title: 'Thành tiền (VNĐ)',
      dataIndex: 'total',
      width: 120,
      align: 'right'
    }
  ];

  const totalDailyUsage = devices.reduce((sum, device) => sum + calculateDailyPowerUsage(device), 0);

  const summary = () => {
    const oldPeriodUsage = totalDailyUsage * oldPeriodDays;
    const oldPeriodCompensation = oldPeriodUsage - paidElectricity.old;
    const oldPeriodTotal = oldPeriodCompensation * OLD_PRICE;

    const newPeriodUsage = totalDailyUsage * newPeriodDays;
    const newPeriodCompensation = newPeriodUsage - paidElectricity.new;
    const newPeriodTotal = newPeriodCompensation * NEW_PRICE;

    const subtotal = oldPeriodTotal + newPeriodTotal;
    const vat = subtotal * 0.08;
    const total = subtotal + vat;

    return (
        
      <>
 
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={7}>Cộng: Điện năng trung bình ngày</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={7}>
            1. Số ngày SDD theo giá cũ (Từ ngày 22/12/2023 ÷ 10/10/2024)
          </Table.Summary.Cell>
          <Table.Summary.Cell align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{oldPeriodDays}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{oldPeriodUsage.toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">
            <InputNumber
              value={paidElectricity.old}
              onChange={value => handlePaidElectricityChange('old', value)}
              style={{ width: '100%' }}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell align="right">{oldPeriodCompensation.toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{OLD_PRICE}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{oldPeriodTotal.toLocaleString()}</Table.Summary.Cell>
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={7}>
            2. Số ngày SDD theo giá bán điện mới (Từ ngày 11/10/2024 ÷ 10/10/2024)
          </Table.Summary.Cell>
          <Table.Summary.Cell align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{newPeriodDays}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{newPeriodUsage.toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">
            <InputNumber
              value={paidElectricity.new}
              onChange={value => handlePaidElectricityChange('new', value)}
              style={{ width: '100%' }}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell align="right">{newPeriodCompensation.toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{NEW_PRICE}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{newPeriodTotal.toLocaleString()}</Table.Summary.Cell>
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={9}>Cộng</Table.Summary.Cell>
          <Table.Summary.Cell colSpan={4} />
          <Table.Summary.Cell align="right">{subtotal.toLocaleString()}</Table.Summary.Cell>
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={9}>Thuế VAT 8%</Table.Summary.Cell>
          <Table.Summary.Cell colSpan={4} />
          <Table.Summary.Cell align="right">{vat.toLocaleString()}</Table.Summary.Cell>
        </Table.Summary.Row>

        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={9}>Tổng cộng</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{(oldPeriodUsage + newPeriodUsage).toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{paidElectricity.old + paidElectricity.new}</Table.Summary.Cell>
          <Table.Summary.Cell align="right">{(oldPeriodCompensation + newPeriodCompensation).toFixed(3)}</Table.Summary.Cell>
          <Table.Summary.Cell />
          <Table.Summary.Cell align="right">{total.toLocaleString()}</Table.Summary.Cell>
        </Table.Summary.Row>
      </>
    );
  };

  return (
    <div>
    <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
    <Space>
      <Button
        onClick={handleExport}
        icon={<DownloadOutlined />}
      >
        Xuất Excel
      </Button>
    </Space>
  </Space>
    <Table
      columns={columns}
      dataSource={devices}
      pagination={false}
      bordered
      size="small"
      summary={summary}
      style={{ marginTop: 20 }}
    />
    </div>
  );
};

export default DetailedCalculationView;
