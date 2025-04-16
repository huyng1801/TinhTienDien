import React, { useState, useEffect } from 'react';
import { Table, InputNumber, Space, Button   } from 'antd';
import { useSharedData } from '../../context/electricity-violation/SharedDataContext';
import { useCompensation } from '../../context/electricity-violation/CompensationContext';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportDetailedCalculation } from '../../utils/electricity-violation/detailedCalculationExcelUtils';

const OLD_PRICE = 2870;
const NEW_PRICE = 3007;

const DetailedCalculationView = () => {
  const { 
    businessDeviceInventory, 
    detailedCalculationDevices, 
    setDetailedCalculationDevices,
    setDetailCalculationData
  } = useSharedData();
  
  const { compensationData } = useCompensation();
  const [paidElectricity, setPaidElectricity] = useState({
    old: 4204,
    new: 4215
  });


  useEffect(() => {
    // Update detailed calculation devices when business inventory changes
    setDetailedCalculationDevices(
      businessDeviceInventory.map(device => ({
        ...device,
        hoursPerDay: 0,
        cosPhi: device.cosPhi || 0.9
      }))
    );

  }, [businessDeviceInventory, setDetailedCalculationDevices]);

  const calculateDailyPowerUsage = (device) => {
    return device.quantity * device.power * device.cosPhi * device.hoursPerDay;
  };

  const handleCosPhiChange = (device, value) => {

    setDetailedCalculationDevices(prevDevices =>
      prevDevices.map(d =>
        d.key === device.key ? { ...d, cosPhi: value } : d
      )
    );
    const detailCalculationData = {
      devices: detailedCalculationDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      oldPeriodUsage: totalDailyUsage * oldPeriodDays,
      newPeriodUsage: totalDailyUsage * newPeriodDays,
      oldPeriodCompensation: (totalDailyUsage * oldPeriodDays) - paidElectricity.old,
      newPeriodCompensation: (totalDailyUsage * newPeriodDays) - paidElectricity.new
    };

    setDetailCalculationData(detailCalculationData);
  };
  

  const handleHoursChange = (device, value) => {

    setDetailedCalculationDevices(prevDevices =>
      prevDevices.map(d =>
        d.key === device.key ? { ...d, hoursPerDay: value } : d
      )
    );

    const detailCalculationData = {
      devices: detailedCalculationDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      oldPeriodUsage: totalDailyUsage * oldPeriodDays,
      newPeriodUsage: totalDailyUsage * newPeriodDays,
      oldPeriodCompensation: (totalDailyUsage * oldPeriodDays) - paidElectricity.old,
      newPeriodCompensation: (totalDailyUsage * newPeriodDays) - paidElectricity.new
    };

    setDetailCalculationData(detailCalculationData);
    console.log('handleHoursChange', detailCalculationData);
  };
  

  const handlePaidElectricityChange = (period, value) => {
    setPaidElectricity(prev => ({
      ...prev,
      [period]: value
    }));
    const detailCalculationData = {
      devices: detailedCalculationDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      oldPeriodUsage: totalDailyUsage * oldPeriodDays,
      newPeriodUsage: totalDailyUsage * newPeriodDays,
      oldPeriodCompensation: (totalDailyUsage * oldPeriodDays) - paidElectricity.old,
      newPeriodCompensation: (totalDailyUsage * newPeriodDays) - paidElectricity.new
    };

    setDetailCalculationData(detailCalculationData);
  };

  // Calculate period days based on compensationData
  const { oldPeriodDays, newPeriodDays } = compensationData.reduce((acc, period) => {
    const startDate = dayjs(period.startDate);
    const endDate = dayjs(period.endDate);
    const violationDays = period.violationDays || 0;

    if (period.month === 10 && period.year === 2024) {
      if (startDate.date() === 1) {
        acc.oldPeriodDays += violationDays;
      } else {
        acc.newPeriodDays += violationDays;
      }
    } else if (startDate.isBefore('2024-10-11')) {
      acc.oldPeriodDays += violationDays;
    } else {
      acc.newPeriodDays += violationDays;
    }

    return acc;
  }, { oldPeriodDays: 0, newPeriodDays: 0 });

  const totalDailyUsage = detailedCalculationDevices.reduce(
    (sum, device) => sum + calculateDailyPowerUsage(device), 
    0
  );

  const handleExport = () => {
    const detailCalculationData = {
      devices: detailedCalculationDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      oldPeriodUsage: totalDailyUsage * oldPeriodDays,
      newPeriodUsage: totalDailyUsage * newPeriodDays,
      oldPeriodCompensation: (totalDailyUsage * oldPeriodDays) - paidElectricity.old,
      newPeriodCompensation: (totalDailyUsage * newPeriodDays) - paidElectricity.new
    };

    exportDetailedCalculation(detailCalculationData);
  };

  const columns = [
    {
      title: 'TT',
      dataIndex: 'key',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      width: 80,
      align: 'center',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: 'Công suất',
      dataIndex: 'power',
      width: 80,
      align: 'center',
      render: val => val?.toFixed(3),
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
      ),
    },
    {
      title: 'Số giờ SDD trong ngày phải nhập',
      dataIndex: 'hoursPerDay',
      width: 120,
      align: 'center',
      render: (value, index) => (
        <InputNumber
          value={value}
          onChange={value => handleHoursChange(index, value)}
          min={0}
          max={24}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điện năng bình quân ngày (kWh)',
      dataIndex: 'averageDailyUsage',
      width: 120,
      align: 'right',
      render: (_, record) => calculateDailyPowerUsage(record)?.toFixed(1),
    },
    {
      title: 'Số ngày vi phạm (Ngày)',
      dataIndex: 'violationDays',
      width: 120,
      align: 'right',
    },
    {
      title: 'Điện năng sử dụng trong thời gian vi phạm (kWh)',
      dataIndex: 'totalUsage',
      width: 150,
      align: 'right',
    },
    {
      title: 'Điện năng đã phát hành hóa đơn trong thời gian vi phạm (kWh)',
      dataIndex: 'paidElectricity',
      width: 150,
      align: 'right',
    },
    {
      title: 'Điện năng bồi thường (kWh)',
      dataIndex: 'compensationAmount',
      width: 120,
      align: 'right',
    },
    {
      title: 'Giá bán điện',
      dataIndex: 'price',
      width: 100,
      align: 'right',
    },
    {
      title: 'Thành tiền (VNĐ)',
      dataIndex: 'total',
      width: 120,
      align: 'right',
    },
  ];
  

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
        <Button
          onClick={handleExport}
          icon={<DownloadOutlined />}
        >
          Xuất Excel
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={detailedCalculationDevices}
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
