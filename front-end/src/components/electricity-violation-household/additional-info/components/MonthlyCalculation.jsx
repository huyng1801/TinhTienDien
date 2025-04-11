import React from 'react';
import { Form, Space, InputNumber, Card, Typography } from 'antd';
import MonthlyDeviceTable from './MonthlyDeviceTable';
import MonthlyDistributionTable from './MonthlyDistributionTable';

const { Text } = Typography;

const MonthlyCalculation = ({ 
  readOnly,
  periodData, 
  devices, 
  onDeviceChange,
  onDaysChange,
  paidElectricity, 
  onPaidElectricityChange,
  summaryData,
  totalPowerUsage,
  compensationDays,
  daysInMonth,
  pricePeriod,
  PRICE_PERIODS
}) => {
  return (
    <div style={{ padding: '20px' }}>
      <Form layout="vertical">
        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
          <Text>Điện năng đã phát hành hóa đơn (kWh):</Text>
          {readOnly ? (
            <Text strong>{paidElectricity || 0}</Text>
          ) : (
            <InputNumber
              style={{ width: 200 }}
              value={paidElectricity}
              onChange={onPaidElectricityChange}
              min={0}
              precision={0}
            />
          )}
        </Space>

        <MonthlyDeviceTable 
          readOnly={readOnly}
          devices={devices}
          onDeviceChange={onDeviceChange}
          onDaysChange={onDaysChange}
          totalPowerUsage={totalPowerUsage}
        />

        <Card title="Kết quả tính toán" style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <MonthlyDistributionTable summaryData={summaryData} />
            </div>
            <div>
              <Text strong>Thông tin tổng hợp:</Text>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Tổng điện năng: {totalPowerUsage.toFixed(2)} kWh</li>
                <li>Số ngày bồi thường: {compensationDays} ngày ({periodData.violationDays >= daysInMonth ? 'Đủ ngày' : 'Thiếu ngày'})</li>
                <li>Áp dụng giá điện: {pricePeriod === PRICE_PERIODS.AFTER_OCT_2024 ? 'Mới' : 'Cũ'}</li>
              </ul>
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default MonthlyCalculation;