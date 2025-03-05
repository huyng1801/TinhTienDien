import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useCompensation } from '../../context/CompensationContext';
import { useSharedData } from '../../context/SharedDataContext';
import { exportCompensationCalculation } from '../../utils/compensationExcelUtils';
import dayjs from 'dayjs';

import { PRICE_PERIODS, PRICES } from './constants';
import { getPricePeriod, calculatePowerUsage, calculateElectricityDistribution } from './utils';
import MonthlyCalculation from './components/MonthlyCalculation';
import SummaryTab from './components/SummaryTab';

const AdditionalInfo = ({ readOnly, initialData }) => {
  const { compensationData } = useCompensation();
  const { deviceInventory, monthlyDevices, updateMonthlyDevices, customerInfo } = useSharedData();
  const [activeTab, setActiveTab] = useState('');
  const [paidElectricity, setPaidElectricity] = useState({});

  // Use initialData if provided (for read-only view)
  const data = useMemo(() => {
    if (readOnly && initialData) {
      return {
        compensationData: initialData.compensationData,
        monthlyDevices: initialData.monthlyDevices || {},
        paidElectricity: initialData.paid_electricity || {}
      };
    }
    return {
      compensationData,
      monthlyDevices,
      paidElectricity: {}
    };
  }, [readOnly, initialData, compensationData, monthlyDevices]);

  // Initialize paid electricity
  useEffect(() => {
    if (readOnly && data.paidElectricity) {
      setPaidElectricity(data.paidElectricity);
    }
  }, [readOnly, data.paidElectricity]);

  // Initialize devices for all periods
  useEffect(() => {
    if (readOnly) return;

    const initialDevices = {};
    data.compensationData.forEach(period => {
      const compensationDays = (period.violationDays || 0) - (period.outageDays || 0);
      
      // If period already has devices, keep them
      if (data.monthlyDevices[period.key]) {
        const periodData = data.monthlyDevices[period.key];
        const devices = Array.isArray(periodData) ? periodData : periodData.devices || [];
        
        initialDevices[period.key] = {
          devices: devices.map(device => ({
            ...device,
            daysPerPeriod: compensationDays,
            powerUsage: calculatePowerUsage({
              ...device,
              daysPerPeriod: compensationDays
            }, customerInfo.meterCount)
          })),
          paidElectricity: data.paidElectricity[period.key] || 0
        };
      } else {
        // Initialize new devices for period
        initialDevices[period.key] = {
          devices: deviceInventory.map(device => ({
            ...device,
            key: device.key,
            cosPhi: 0.9,
            hoursPerDay: 0,
            daysPerPeriod: compensationDays,
            powerUsage: 0
          })),
          paidElectricity: 0
        };
      }
    });

    // Only update if there are changes
    if (JSON.stringify(data.monthlyDevices) !== JSON.stringify(initialDevices)) {
      updateMonthlyDevices(initialDevices);
    }
  }, [data.compensationData, deviceInventory, customerInfo.meterCount, readOnly]);

  // Set initial active tab
  useEffect(() => {
    if (data.compensationData.length > 0 && !activeTab) {
      setActiveTab(data.compensationData[0].key);
    }
  }, [data.compensationData, activeTab]);

  const handleDeviceChange = useCallback((periodKey, index, field, value) => {
    if (readOnly) return;

    const newDevices = { ...data.monthlyDevices };
    
    // If the field is cosPhi or hoursPerDay, update all periods for the same device
    if (field === 'cosPhi' || field === 'hoursPerDay') {
      const deviceKey = newDevices[periodKey].devices[index].key;
      
      Object.keys(newDevices).forEach(key => {
        if (key !== periodKey) {
          const deviceIndex = newDevices[key].devices.findIndex(d => d.key === deviceKey);
          if (deviceIndex !== -1) {
            const device = { ...newDevices[key].devices[deviceIndex] };
            device[field] = value;
            device.powerUsage = calculatePowerUsage(device, customerInfo.meterCount);
            newDevices[key].devices[deviceIndex] = device;
          }
        }
      });
    }
    
    // Update the current period's device
    const devices = [...newDevices[periodKey].devices];
    const deviceToUpdate = { ...devices[index] };
    
    if (deviceToUpdate) {
      // Ensure value is a valid number and within bounds for hoursPerDay
      let finalValue = value;
      if (field === 'hoursPerDay') {
        finalValue = Math.min(Math.max(0, Math.round(value || 0)), 24);
      }

      devices[index] = {
        ...deviceToUpdate,
        [field]: finalValue,
        powerUsage: calculatePowerUsage({
          ...deviceToUpdate,
          [field]: finalValue,
          daysPerPeriod: deviceToUpdate.daysPerPeriod
        }, customerInfo.meterCount)
      };
      
      newDevices[periodKey] = {
        ...newDevices[periodKey],
        devices
      };
      updateMonthlyDevices(newDevices);
    }
  }, [data.monthlyDevices, updateMonthlyDevices, customerInfo.meterCount, readOnly]);

  const handlePaidElectricityChange = useCallback((periodKey, value) => {
    if (readOnly) return;
    setPaidElectricity(prev => ({
      ...prev,
      [periodKey]: value
    }));
    
    // Update monthlyDevices with new paid electricity value
    const newDevices = { ...data.monthlyDevices };
    newDevices[periodKey] = {
      ...newDevices[periodKey],
      paidElectricity: value
    };
    updateMonthlyDevices(newDevices);
  }, [readOnly, data.monthlyDevices, updateMonthlyDevices]);

  // Memoize calculation data
  const calculationData = useMemo(() => {
    return data.compensationData.map(period => {
      const periodData = data.monthlyDevices[period.key] || {};
      const devices = Array.isArray(periodData) ? periodData : periodData.devices || [];
      const totalPowerUsage = devices.reduce((sum, device) => sum + (device.powerUsage || 0), 0);
      const pricePeriod = getPricePeriod(period.startDate);
      const paidAmount = paidElectricity[period.key] || periodData.paidElectricity || 0;
      
      const distribution = calculateElectricityDistribution(
        totalPowerUsage,
        paidAmount,
        period,
        customerInfo.meterCount
      );

      return {
        period,
        devices,
        distribution,
        pricePeriod,
        totalPowerUsage,
        paidAmount
      };
    });
  }, [data.compensationData, data.monthlyDevices, paidElectricity, customerInfo.meterCount]);

  const handleExportAll = useCallback(() => {
    exportCompensationCalculation({
      periods: calculationData,
      prices: PRICES,
      totalDays: data.compensationData.reduce((sum, period) => 
        sum + ((period.violationDays || 0) - (period.outageDays || 0)), 0)
    });
  }, [calculationData, data.compensationData]);

  // Memoize tab items
  const items = useMemo(() => {
    const periodTabs = data.compensationData.map((periodData) => {
      const monthlyData = data.monthlyDevices[periodData.key] || {};
      const devices = Array.isArray(monthlyData) ? monthlyData : monthlyData.devices || [];
      const totalPowerUsage = devices.reduce((sum, device) => sum + (device.powerUsage || 0), 0);
      const pricePeriod = getPricePeriod(periodData.startDate);
      const paidAmount = paidElectricity[periodData.key] || monthlyData.paidElectricity || 0;
      
      const distribution = calculateElectricityDistribution(
        totalPowerUsage,
        paidAmount,
        periodData,
        customerInfo.meterCount
      );
      
      const daysInMonth = dayjs(periodData.endDate).daysInMonth();
      const compensationDays = (periodData.violationDays || 0) - (periodData.outageDays || 0);

      const periodLabel = periodData.month === 10 && periodData.year === 2024
        ? `Tháng ${periodData.month}/${periodData.year} (${dayjs(periodData.startDate).format('DD/MM')} - ${dayjs(periodData.endDate).format('DD/MM')})`
        : `Tháng ${periodData.month}/${periodData.year}`;

      const summaryData = [
        {
          key: 'bac1',
          level: 'Bậc 1',
          paidUsage: distribution.paid.bac1,
          compensationUsage: distribution.compensation.bac1,
          price: PRICES[pricePeriod][0],
          total: distribution.compensation.bac1 * PRICES[pricePeriod][0]
        },
        {
          key: 'bac2',
          level: 'Bậc 2',
          paidUsage: distribution.paid.bac2,
          compensationUsage: distribution.compensation.bac2,
          price: PRICES[pricePeriod][1],
          total: distribution.compensation.bac2 * PRICES[pricePeriod][1]
        },
        {
          key: 'bac3',
          level: 'Bậc 3',
          paidUsage: distribution.paid.bac3,
          compensationUsage: distribution.compensation.bac3,
          price: PRICES[pricePeriod][2],
          total: distribution.compensation.bac3 * PRICES[pricePeriod][2]
        },
        {
          key: 'bac4',
          level: 'Bậc 4',
          paidUsage: distribution.paid.bac4,
          compensationUsage: distribution.compensation.bac4,
          price: PRICES[pricePeriod][3],
          total: distribution.compensation.bac4 * PRICES[pricePeriod][3]
        },
        {
          key: 'bac5',
          level: 'Bậc 5',
          paidUsage: distribution.paid.bac5,
          compensationUsage: distribution.compensation.bac5,
          price: PRICES[pricePeriod][4],
          total: distribution.compensation.bac5 * PRICES[pricePeriod][4]
        },
        {
          key: 'bac6',
          level: 'Bậc 6',
          paidUsage: distribution.paid.bac6,
          compensationUsage: distribution.compensation.bac6,
          price: PRICES[pricePeriod][5],
          total: distribution.compensation.bac6 * PRICES[pricePeriod][5]
        }
      ];

      return {
        key: periodData.key,
        label: periodLabel,
        children: (
          <MonthlyCalculation
            readOnly={readOnly}
            periodData={periodData}
            devices={devices}
            onDeviceChange={(index, field, value) => handleDeviceChange(periodData.key, index, field, value)}
            paidElectricity={paidAmount}
            onPaidElectricityChange={(value) => handlePaidElectricityChange(periodData.key, value)}
            summaryData={summaryData}
            totalPowerUsage={totalPowerUsage}
            compensationDays={compensationDays}
            daysInMonth={daysInMonth}
            pricePeriod={pricePeriod}
            PRICE_PERIODS={PRICE_PERIODS}
          />
        )
      };
    });

    return [
      ...periodTabs,
      {
        key: 'summary',
        label: 'Tổng kết',
        children: <SummaryTab calculationData={calculationData} />
      }
    ];
  }, [data.compensationData, data.monthlyDevices, paidElectricity, calculationData, handleDeviceChange, handlePaidElectricityChange, readOnly, customerInfo.meterCount]);

  return (
    <div>
      {!readOnly && (
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportAll}
          >
            Xuất tất cả dữ liệu
          </Button>
        </Space>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default AdditionalInfo;