import React, { useMemo } from 'react';
import { Card, Table, Typography, Space } from 'antd';
import { PRICES } from '../constants';

const { Text } = Typography;

const SummaryTab = ({ calculationData }) => {
  // Calculate totals using useMemo to optimize performance
  const totals = useMemo(() => {
    return calculationData.reduce((acc, period) => {
      // Calculate period totals for old price (before Oct 11, 2024)
      if (period.pricePeriod !== 'AFTER_OCT_2024') {
        for (let i = 0; i < 6; i++) {
          const level = `bac${i + 1}`;
          const usage = period.distribution.compensation[level] || 0;
          const price = PRICES[period.pricePeriod][i];
          
          acc.oldPrice[level] = {
            usage: (acc.oldPrice[level]?.usage || 0) + usage,
            amount: (acc.oldPrice[level]?.amount || 0) + (usage * price)
          };
        }
      }
      // Calculate period totals for new price (after Oct 11, 2024)
      else {
        for (let i = 0; i < 6; i++) {
          const level = `bac${i + 1}`;
          const usage = period.distribution.compensation[level] || 0;
          const price = PRICES[period.pricePeriod][i];
          
          acc.newPrice[level] = {
            usage: (acc.newPrice[level]?.usage || 0) + usage,
            amount: (acc.newPrice[level]?.amount || 0) + (usage * price)
          };
        }
      }

      // Update overall totals
      acc.totalPowerUsage += period.totalPowerUsage;
      acc.totalPaidUsage += Object.values(period.distribution.paid).reduce((sum, val) => sum + val, 0);
      acc.totalCompensationUsage += Object.values(period.distribution.compensation).reduce((sum, val) => sum + val, 0);

      return acc;
    }, {
      oldPrice: {},
      newPrice: {},
      totalPowerUsage: 0,
      totalPaidUsage: 0,
      totalCompensationUsage: 0
    });
  }, [calculationData]);

  // Calculate final totals
  const oldPriceTotal = Object.values(totals.oldPrice).reduce((sum, { amount }) => sum + amount, 0);
  const newPriceTotal = Object.values(totals.newPrice).reduce((sum, { amount }) => sum + amount, 0);
  const totalAmount = oldPriceTotal + newPriceTotal;
  const vat = totalAmount * 0.08;
  const finalTotal = totalAmount + vat;

  // Prepare table data
  const oldPriceData = [
    { key: 'bac1', level: 'Bậc 1', usage: totals.oldPrice.bac1?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[0], amount: totals.oldPrice.bac1?.amount || 0 },
    { key: 'bac2', level: 'Bậc 2', usage: totals.oldPrice.bac2?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[1], amount: totals.oldPrice.bac2?.amount || 0 },
    { key: 'bac3', level: 'Bậc 3', usage: totals.oldPrice.bac3?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[2], amount: totals.oldPrice.bac3?.amount || 0 },
    { key: 'bac4', level: 'Bậc 4', usage: totals.oldPrice.bac4?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[3], amount: totals.oldPrice.bac4?.amount || 0 },
    { key: 'bac5', level: 'Bậc 5', usage: totals.oldPrice.bac5?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[4], amount: totals.oldPrice.bac5?.amount || 0 },
    { key: 'bac6', level: 'Bậc 6', usage: totals.oldPrice.bac6?.usage || 0, price: PRICES.NOV_2023_TO_OCT_2024[5], amount: totals.oldPrice.bac6?.amount || 0 }
  ];

  const newPriceData = [
    { key: 'bac1', level: 'Bậc 1', usage: totals.newPrice.bac1?.usage || 0, price: PRICES.AFTER_OCT_2024[0], amount: totals.newPrice.bac1?.amount || 0 },
    { key: 'bac2', level: 'Bậc 2', usage: totals.newPrice.bac2?.usage || 0, price: PRICES.AFTER_OCT_2024[1], amount: totals.newPrice.bac2?.amount || 0 },
    { key: 'bac3', level: 'Bậc 3', usage: totals.newPrice.bac3?.usage || 0, price: PRICES.AFTER_OCT_2024[2], amount: totals.newPrice.bac3?.amount || 0 },
    { key: 'bac4', level: 'Bậc 4', usage: totals.newPrice.bac4?.usage || 0, price: PRICES.AFTER_OCT_2024[3], amount: totals.newPrice.bac4?.amount || 0 },
    { key: 'bac5', level: 'Bậc 5', usage: totals.newPrice.bac5?.usage || 0, price: PRICES.AFTER_OCT_2024[4], amount: totals.newPrice.bac5?.amount || 0 },
    { key: 'bac6', level: 'Bậc 6', usage: totals.newPrice.bac6?.usage || 0, price: PRICES.AFTER_OCT_2024[5], amount: totals.newPrice.bac6?.amount || 0 }
  ];

  const columns = [
    { title: 'Bậc', dataIndex: 'level', width: 100 },
    { 
      title: 'Điện năng (kWh)', 
      dataIndex: 'usage', 
      width: 150, 
      render: val => val.toFixed(2) 
    },
    { 
      title: 'Đơn giá (đ/kWh)', 
      dataIndex: 'price', 
      width: 150, 
      render: val => val.toLocaleString() 
    },
    { 
      title: 'Thành tiền (đ)', 
      dataIndex: 'amount', 
      width: 150, 
      render: val => val.toLocaleString() 
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="1. Điện năng, tiền điện bồi thường giá cũ">
          <Table
            columns={columns}
            dataSource={oldPriceData}
            pagination={false}
            bordered
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {oldPriceData.reduce((sum, item) => sum + item.usage, 0).toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {oldPriceTotal.toLocaleString()}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        <Card title="2. Điện năng, tiền điện bồi thường giá mới">
          <Table
            columns={columns}
            dataSource={newPriceData}
            pagination={false}
            bordered
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {newPriceData.reduce((sum, item) => sum + item.usage, 0).toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {newPriceTotal.toLocaleString()}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        <Card title="Tổng kết">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text>Tổng cộng: 3 = 1 + 2: {totalAmount.toLocaleString()} đồng</Text>
            <Text>Điện năng bồi thường: {totals.totalCompensationUsage.toFixed(2)} kWh</Text>
            <Text>Tiền điện bồi thường: {totalAmount.toLocaleString()} đồng</Text>
            <Text>Thuế VAT 8%: {vat.toLocaleString()} đồng</Text>
            <Text strong>Tổng tiền điện bồi thường: {finalTotal.toLocaleString()} đồng</Text>
            <Text>Chênh lệch điện năng: {(totals.totalPowerUsage - totals.totalPaidUsage).toFixed(2)} kWh</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default SummaryTab;