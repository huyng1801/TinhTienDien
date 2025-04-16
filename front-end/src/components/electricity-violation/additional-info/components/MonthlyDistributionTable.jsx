import React from 'react';
import { Table, Typography } from 'antd';

const { Text } = Typography;

const MonthlyDistributionTable = ({ summaryData }) => {
  return (
    <>
      <Text strong>Phân bổ điện năng theo bậc thang:</Text>
      <Table
        dataSource={summaryData}
        pagination={false}
        bordered
        size="small"
        columns={[
          { title: 'Bậc', dataIndex: 'level', width: 80 },
          { title: 'ĐN đã phát hành (kWh)', dataIndex: 'paidUsage', width: 120, render: val => val.toFixed(2) },
          { title: 'ĐN bồi thường (kWh)', dataIndex: 'compensationUsage', width: 120, render: val => val.toFixed(2) },
          { title: 'Giá (đ/kWh)', dataIndex: 'price', width: 100, render: val => val.toLocaleString() },
          { title: 'Thành tiền (đ)', dataIndex: 'total', width: 120, render: val => val.toLocaleString() }
        ]}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                {summaryData.reduce((sum, item) => sum + item.paidUsage, 0).toFixed(2)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                {summaryData.reduce((sum, item) => sum + item.compensationUsage, 0).toFixed(2)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}></Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                {summaryData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </>
  );
};

export default MonthlyDistributionTable;