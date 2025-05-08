import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, InputNumber, Space, Button } from 'antd';
import { useSharedData } from '../../context/electricity-violation/SharedDataContext';
import { useCompensation } from '../../context/electricity-violation/CompensationContext2';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { exportDetailedCalculation } from '../../utils/electricity-violation/detailedCalculationExcelUtils';

// Default values remain as state initializers
// const DEFAULT_OLD_PRICE = 2870;
// const DEFAULT_NEW_PRICE = 3007;
// const DEFAULT_PAID_OLD = 4204;
// const DEFAULT_PAID_NEW = 4215;
const PRICE_CHANGE_DATE = '2024-10-11'; // Define constant for clarity
const VAT_RATE = 0.08; // Define constant for VAT

const DetailedCalculationView = () => {
  const {
    businessDeviceInventory,
    detailedCalculationDevices,
    setDetailedCalculationDevices,
    setDetailCalculationData // Function to update shared context
  } = useSharedData();

  const { compensationData } = useCompensation();

  // State for user-editable values
  const [prices, setPrices] = useState({
    old: 2870,
    new: 3007
  });
  const [paidElectricity, setPaidElectricity] = useState({
    old: 4204,
    new: 4215
  });

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

  // --- Effect to Initialize/Update Devices from Inventory ---
  useEffect(() => {
    // console.log("Updating devices from inventory"); // For debugging effect trigger
    setDetailedCalculationDevices(
      businessDeviceInventory.map((device, index) => ({
        ...device,
        // Ensure a unique and stable key - prioritize existing key, fallback to index/timestamp
        key: device.key ?? `device-${index}-${Date.now()}`,
        // Initialize values if they are missing/undefined
        hoursPerDay: device.hoursPerDay ?? 0,
        cosPhi: device.cosPhi ?? 0.9
      }))
    );
    // Note: Intentionally not calling updateDetailCalculationData here yet,
    // as totalDailyUsage depends on the updated devices state which might not be immediately available.
    // The update will happen naturally when handlers are called or summary re-renders.
  }, [businessDeviceInventory, setDetailedCalculationDevices]); // Rerun only if inventory changes


  // --- Helper function to calculate daily power usage for a single device ---
  const calculateDeviceDailyUsage = (device) => {
    // Ensure all required fields are numbers and default to 0 if not
    const quantity = Number(device.quantity) || 0;
    const power = Number(device.power) || 0;
    const cosPhi = Number(device.cosPhi) || 0;
    const hoursPerDay = Number(device.hoursPerDay) || 0;
    return quantity * power * cosPhi * hoursPerDay;
  };

  // --- Memoized Calculation for Total Daily Usage ---
  const totalDailyUsage = useMemo(() => {
    // console.log("Recalculating total daily usage"); // For debugging memoization
    return detailedCalculationDevices.reduce(
      (sum, device) => sum + calculateDeviceDailyUsage(device),
      0
    );
  }, [detailedCalculationDevices]); // Recalculate only if devices change


  // --- Centralized Function to Update Shared Context Data ---
  // Use useCallback to prevent unnecessary re-creation of this function
  const updateSharedContextData = useCallback((currentDevices, currentPaid, currentPrices, currentTotalDailyUsage) => {
    const oldUsage = currentTotalDailyUsage * oldPeriodDays;
    const newUsage = currentTotalDailyUsage * newPeriodDays;
    const oldCompensation = Math.max(0, oldUsage - (currentPaid.old ?? 0)); // Ensure non-negative
    const newCompensation = Math.max(0, newUsage - (currentPaid.new ?? 0)); // Ensure non-negative
    const oldTotal = oldCompensation * (currentPrices.old ?? 0);
    const newTotal = newCompensation * (currentPrices.new ?? 0);

    const detailCalculationData = {
      devices: currentDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage: currentTotalDailyUsage,
      paidElectricity: currentPaid,
      prices: currentPrices,
      oldPeriodUsage: oldUsage,
      newPeriodUsage: newUsage,
      oldPeriodCompensation: oldCompensation,
      newPeriodCompensation: newCompensation,
      oldPeriodTotal: oldTotal,
      newPeriodTotal: newTotal,
      subtotal: oldTotal + newTotal,
      vat: (oldTotal + newTotal) * VAT_RATE,
      total: (oldTotal + newTotal) * (1 + VAT_RATE)
    };
    // console.log('Updating Shared Context:', detailCalculationData); // For debugging
    setDetailCalculationData(detailCalculationData);
  }, [setDetailCalculationData, oldPeriodDays, newPeriodDays]); // Dependencies for the calculation logic

  // --- Event Handlers (using useCallback for potential performance optimization) ---

  const handleCosPhiChange = useCallback((key, value) => {
    const newDevices = detailedCalculationDevices.map(d =>
      d.key === key ? { ...d, cosPhi: value ?? 0 } : d // Use key, handle null/undefined
    );
    setDetailedCalculationDevices(newDevices);
    // Recalculate total usage based on the *new* devices state
    const newTotalDailyUsage = newDevices.reduce((sum, device) => sum + calculateDeviceDailyUsage(device), 0);
    updateSharedContextData(newDevices, paidElectricity, prices, newTotalDailyUsage);
  }, [detailedCalculationDevices, paidElectricity, prices, updateSharedContextData, setDetailedCalculationDevices]);

  const handleHoursChange = useCallback((key, value) => {
    const newDevices = detailedCalculationDevices.map(d =>
      d.key === key ? { ...d, hoursPerDay: value ?? 0 } : d // Use key, handle null/undefined
    );
    setDetailedCalculationDevices(newDevices);
    // Recalculate total usage based on the *new* devices state
    const newTotalDailyUsage = newDevices.reduce((sum, device) => sum + calculateDeviceDailyUsage(device), 0);
    updateSharedContextData(newDevices, paidElectricity, prices, newTotalDailyUsage);
  }, [detailedCalculationDevices, paidElectricity, prices, updateSharedContextData, setDetailedCalculationDevices]);

  const handlePaidElectricityChange = useCallback((period, value) => {
    const newPaidElectricity = {
      ...paidElectricity,
      [period]: value ?? 0 // Handle null/undefined
    };
    setPaidElectricity(newPaidElectricity);
    // totalDailyUsage doesn't change, pass the memoized value
    updateSharedContextData(detailedCalculationDevices, newPaidElectricity, prices, totalDailyUsage);
  }, [paidElectricity, detailedCalculationDevices, prices, totalDailyUsage, updateSharedContextData]);

  const handlePriceChange = useCallback((period, value) => {
    const newPrices = {
      ...prices,
      [period]: value ?? 0 // Handle null/undefined
    };
    setPrices(newPrices);
    // totalDailyUsage doesn't change, pass the memoized value
    updateSharedContextData(detailedCalculationDevices, paidElectricity, newPrices, totalDailyUsage);
  }, [prices, detailedCalculationDevices, paidElectricity, totalDailyUsage, updateSharedContextData]);

  // --- Effect to update context when calculated values change ---
  // This ensures context is updated if dependencies like days or total usage change
  // without direct user interaction triggering a handler.
   useEffect(() => {
    // console.log("Updating context due to dependency change"); // For debugging effect trigger
    updateSharedContextData(detailedCalculationDevices, paidElectricity, prices, totalDailyUsage);
  }, [detailedCalculationDevices, paidElectricity, prices, totalDailyUsage, updateSharedContextData]);


  // --- Export Handler ---
  const handleExport = () => {
    // Data for export is derived directly from current state/memoized values
    const oldPeriodUsage = totalDailyUsage * oldPeriodDays;
    const newPeriodUsage = totalDailyUsage * newPeriodDays;
    const oldPeriodCompensation = Math.max(0, oldPeriodUsage - paidElectricity.old);
    const newPeriodCompensation = Math.max(0, newPeriodUsage - paidElectricity.new);
    const oldPeriodTotal = oldPeriodCompensation * prices.old;
    const newPeriodTotal = newPeriodCompensation * prices.new;

    const detailCalculationDataForExport = {
      devices: detailedCalculationDevices,
      oldPeriodDays,
      newPeriodDays,
      totalDailyUsage,
      paidElectricity,
      prices,
      oldPeriodUsage,
      newPeriodUsage,
      oldPeriodCompensation,
      newPeriodCompensation,
      oldPeriodTotal,
      newPeriodTotal,
      subtotal: oldPeriodTotal + newPeriodTotal,
      vat: (oldPeriodTotal + newPeriodTotal) * VAT_RATE,
      total: (oldPeriodTotal + newPeriodTotal) * (1 + VAT_RATE)
    };
    // console.log("Exporting data:", detailCalculationDataForExport); // Debugging
    exportDetailedCalculation(detailCalculationDataForExport);
  };

  // --- Table Columns Definition (kept as in original user code) ---
  const columns = useMemo(() => [
    {
      title: 'TT',
      dataIndex: 'tableIndex', // Use index for display order
      key: 'tableIndex',       // Use key for React internal mapping if needed
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1, // Render 1-based index
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: 'Công suất (kW)', // Clarified unit
      dataIndex: 'power',
      key: 'power',
      width: 90, // Adjusted width slightly
      align: 'center',
      render: val => val?.toFixed(3),
    },
    {
      title: 'Cosφ', // Shortened title
      dataIndex: 'cosPhi',
      key: 'cosPhi',
      width: 100,
      align: 'center',
      render: (value, record) => ( // Pass record to get key
        <InputNumber
          aria-label={`CosPhi for ${record.name || 'device'}`} // Accessibility
          value={value}
          onChange={val => handleCosPhiChange(record.key, val)} // Pass record.key
          min={0}
          max={1}
          step={0.01} // Finer step
          style={{ width: '90%' }}
        />
      ),
    },
    {
      title: 'Giờ SD/ngày', // Shortened title
      dataIndex: 'hoursPerDay',
      key: 'hoursPerDay',
      width: 100, // Adjusted width
      align: 'center',
      render: (value, record) => ( // Pass record to get key
        <InputNumber
          aria-label={`Hours per day for ${record.name || 'device'}`} // Accessibility
          value={value}
          onChange={val => handleHoursChange(record.key, val)} // Pass record.key
          min={0}
          max={24}
          step={0.5} // Allow half hours
          style={{ width: '90%' }}
        />
      ),
    },
    {
      title: 'ĐN BQ ngày (kWh)', // Shortened title
      dataIndex: 'averageDailyUsage',
      key: 'averageDailyUsage',
      width: 120,
      align: 'right',
      // Calculate directly in render based on current record data
      render: (_, record) => calculateDeviceDailyUsage(record).toFixed(1),
    },
    // Columns below are related to summary calculations, not individual devices
    // They remain in the definition as per the user's original structure,
    // but their data comes from the summary section logic.
    {
      title: 'Số ngày vi phạm (Ngày)',
      dataIndex: 'compensationDays', // Displayed in summary
      key: 'compensationDays',
      width: 120,
      align: 'right',
      // No render needed here, as data is shown in summary
    },
    {
      title: 'ĐN SD vi phạm (kWh)', // Shortened
      dataIndex: 'totalUsage', // Displayed in summary
      key: 'totalUsage',
      width: 150,
      align: 'right',
      // No render needed here
    },
    {
      title: 'ĐN đã PHHĐ (kWh)', // Shortened
      dataIndex: 'paidElectricity', // Displayed in summary input
      key: 'paidElectricity',
      width: 150,
      align: 'right',
      // No render needed here
    },
    {
      title: 'ĐN bồi thường (kWh)', // Shortened
      dataIndex: 'compensationAmount', // Displayed in summary
      key: 'compensationAmount',
      width: 120,
      align: 'right',
      // No render needed here
    },
    {
      title: 'Giá bán điện (VNĐ)', // Clarified unit
      dataIndex: 'price', // Displayed in summary input
      key: 'price',
      width: 100,
      align: 'right',
      // No render needed here
    },
    {
      title: 'Thành tiền (VNĐ)',
      dataIndex: 'total', // Displayed in summary
      key: 'total',
      width: 120,
      align: 'right',
      // No render needed here
    },
  ], [handleCosPhiChange, handleHoursChange]); // Dependencies for render functions


  // --- Summary Calculation Function ---
  // Use useCallback to memoize the summary renderer if needed, though less critical than handlers
  const summary = useCallback(() => {
    // Derive calculations directly from state and memoized values for display
    const oldPeriodUsage = totalDailyUsage * oldPeriodDays;
    const oldPeriodCompensation = Math.max(0, oldPeriodUsage - paidElectricity.old);
    const oldPeriodTotal = oldPeriodCompensation * prices.old;

    const newPeriodUsage = totalDailyUsage * newPeriodDays;
    const newPeriodCompensation = Math.max(0, newPeriodUsage - paidElectricity.new);
    const newPeriodTotal = newPeriodCompensation * prices.new;

    const subtotal = oldPeriodTotal + newPeriodTotal;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    // Common props for InputNumbers in summary for consistency
    const inputNumberProps = {
        style: { width: '100%' },
        min: 0,
        formatter: value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','), // Format with commas
        parser: value => value.replace(/,\s?|(VNĐ\*?)/g, ''), // Remove commas and currency symbols for parsing
        step: 1 // Default step for currency/count inputs
    };
    const inputNumberPriceProps = { // Specific props for price inputs if needed
        ...inputNumberProps,
         step: 10 // Example: Allow stepping by 10 for price
    };
     const inputNumberkWhProps = { // Specific props for kWh inputs
        ...inputNumberProps,
         step: 1,
         precision: 3 // Allow decimals for kWh
    };


    // Function to format currency/numbers consistently
    const formatNumber = (num) => (num ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const formatkWh = (num) => (num ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });


    return (
      <>
        {/* Row 1: Total Daily Usage */}
        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
          <Table.Summary.Cell index={0} colSpan={7} align="right">Cộng Điện năng trung bình ngày:</Table.Summary.Cell>
          <Table.Summary.Cell index={7} align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
          {/* Add empty cells to match the full column structure if needed for alignment */}
           <Table.Summary.Cell index={8} colSpan={6} />
        </Table.Summary.Row>

        {/* Header Row for Calculation Breakdown - Optional but improves clarity */}
        <Table.Summary.Row style={{ background: '#f0f0f0', textAlign: 'center', fontWeight: 'bold' }}>
           <Table.Summary.Cell index={0} colSpan={7}>Nội dung</Table.Summary.Cell>
           <Table.Summary.Cell index={7}>ĐN BQ Ngày (kWh)</Table.Summary.Cell>
           <Table.Summary.Cell index={8}>Số Ngày</Table.Summary.Cell>
           <Table.Summary.Cell index={9}>Tổng ĐN SD (kWh)</Table.Summary.Cell>
           <Table.Summary.Cell index={10}>ĐN đã PHHĐ (kWh)</Table.Summary.Cell>
           <Table.Summary.Cell index={11}>ĐN Bồi Thường (kWh)</Table.Summary.Cell>
           <Table.Summary.Cell index={12}>Giá (VNĐ)</Table.Summary.Cell>
           <Table.Summary.Cell index={13}>Thành Tiền (VNĐ)</Table.Summary.Cell>
        </Table.Summary.Row>


        {/* Row 2: Old Price Period Calculation */}
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={7}>
            1. Thời gian giá cũ (Trước {dayjs(PRICE_CHANGE_DATE).format('DD/MM/YYYY')})
          </Table.Summary.Cell>
          <Table.Summary.Cell index={7} align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
          <Table.Summary.Cell index={8} align="right">{oldPeriodDays}</Table.Summary.Cell>
          <Table.Summary.Cell index={9} align="right">{formatkWh(oldPeriodUsage)}</Table.Summary.Cell>
          <Table.Summary.Cell index={10} align="center"> {/* Align input center */}
            <InputNumber
              aria-label="Paid electricity old period"
              {...inputNumberkWhProps} // Use specific props
              value={paidElectricity.old}
              onChange={value => handlePaidElectricityChange('old', value)}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell index={11} align="right">{formatkWh(oldPeriodCompensation)}</Table.Summary.Cell>
          <Table.Summary.Cell index={12} align="center"> {/* Align input center */}
            <InputNumber
               aria-label="Old price"
               {...inputNumberPriceProps} // Use specific props
               value={prices.old}
               onChange={value => handlePriceChange('old', value)}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell index={13} align="right">{formatNumber(oldPeriodTotal)}</Table.Summary.Cell>
        </Table.Summary.Row>

        {/* Row 3: New Price Period Calculation */}
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={7}>
             2. Thời gian giá mới (Từ {dayjs(PRICE_CHANGE_DATE).format('DD/MM/YYYY')})
          </Table.Summary.Cell>
          <Table.Summary.Cell index={7} align="right">{totalDailyUsage.toFixed(1)}</Table.Summary.Cell>
          <Table.Summary.Cell index={8} align="right">{newPeriodDays}</Table.Summary.Cell>
          <Table.Summary.Cell index={9} align="right">{formatkWh(newPeriodUsage)}</Table.Summary.Cell>
          <Table.Summary.Cell index={10} align="center"> {/* Align input center */}
            <InputNumber
              aria-label="Paid electricity new period"
              {...inputNumberkWhProps} // Use specific props
              value={paidElectricity.new}
              onChange={value => handlePaidElectricityChange('new', value)}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell index={11} align="right">{formatkWh(newPeriodCompensation)}</Table.Summary.Cell>
          <Table.Summary.Cell index={12} align="center"> {/* Align input center */}
            <InputNumber
               aria-label="New price"
               {...inputNumberPriceProps} // Use specific props
               value={prices.new}
               onChange={value => handlePriceChange('new', value)}
            />
          </Table.Summary.Cell>
          <Table.Summary.Cell index={13} align="right">{formatNumber(newPeriodTotal)}</Table.Summary.Cell>
        </Table.Summary.Row>

        {/* Row 4: Subtotal */}
        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
          <Table.Summary.Cell index={0} colSpan={13} align="right">Cộng tiền điện:</Table.Summary.Cell>
          <Table.Summary.Cell index={13} align="right">{formatNumber(subtotal)}</Table.Summary.Cell>
        </Table.Summary.Row>

        {/* Row 5: VAT */}
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={13} align="right">Thuế VAT ({VAT_RATE * 100}%):</Table.Summary.Cell>
          <Table.Summary.Cell index={13} align="right">{formatNumber(vat)}</Table.Summary.Cell>
        </Table.Summary.Row>

        {/* Row 6: Grand Total */}
        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
          {/* Display overall totals aligned with columns */}
          <Table.Summary.Cell index={0} colSpan={9} align="right">Tổng cộng:</Table.Summary.Cell>
          <Table.Summary.Cell index={9} align="right">{formatkWh(oldPeriodUsage + newPeriodUsage)}</Table.Summary.Cell>
          <Table.Summary.Cell index={10} align="right">{formatNumber(paidElectricity.old + paidElectricity.new)}</Table.Summary.Cell>
          <Table.Summary.Cell index={11} align="right">{formatkWh(oldPeriodCompensation + newPeriodCompensation)}</Table.Summary.Cell>
          <Table.Summary.Cell index={12} /> {/* Empty cell under Price */}
          <Table.Summary.Cell index={13} align="right">{formatNumber(total)}</Table.Summary.Cell>
        </Table.Summary.Row>
      </>
    );
    // Add dependencies if variables from outside the useCallback scope are used
  }, [totalDailyUsage, oldPeriodDays, newPeriodDays, paidElectricity, prices, handlePaidElectricityChange, handlePriceChange]);

  // --- Component Render ---
  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleExport}
          icon={<DownloadOutlined />}
          type="primary"
        >
          Xuất Excel Chi Tiết
        </Button>
      </Space>
      <Table
        columns={columns}
        // Add tableIndex for display purposes, but use device.key for React's rowKey
        dataSource={detailedCalculationDevices.map((d, i) => ({ ...d, tableIndex: i + 1 }))}
        rowKey="key" // Crucial for stable updates when list changes
        pagination={false}
        bordered
        size="small"
        summary={summary} // Pass the memoized summary function
        scroll={{ x: 1400 }} // Adjust scroll based on total column width
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default DetailedCalculationView;