import React from 'react';
import { Button, Table, InputNumber, Input, DatePicker, Typography, Space, message } from 'antd';
import { useCompensation } from '../../context/electricity-violation/CompensationContext';
import { exportViolationTimeAgreement } from '../../utils/electricity-violation/violationTimeExcelUtils';
import { importViolationTimeAgreement } from '../../utils/electricity-violation/excelImportUtils';
import { DownloadOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { RangePicker } = DatePicker;
const { Text } = Typography;

dayjs.locale('vi');

const CompensationCalculator = ({ readOnly, initialData }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    compensationData,
    updateViolationDays,
    updateOutageDays,
    updateReason,
    setCompensationData
  } = useCompensation();

  // Use initialData if provided (for read-only view), otherwise use compensationData from context
  const data = initialData || compensationData;

  const handleMonthYearChange = (date) => {
    if (readOnly) return;
    if (date) {
      setSelectedMonth(date.month() + 1);
      setSelectedYear(date.year());
    }
  };

  const handleDateRangeChange = (index, dates) => {
    if (readOnly) return;
    if (!dates || !dates[0] || !dates[1]) return;

    const newData = [...data];
    const startDate = dates[0].startOf('day').toDate();
    const endDate = dates[1].endOf('day').toDate();
    const violationDays = dates[1].diff(dates[0], 'day') + 1;
    
    newData[index] = {
      ...newData[index],
      startDate,
      endDate,
      violationDays
    };
    
    setCompensationData(newData);
  };

  const handleExportViolationTime = async () => {
    try {
      // Filter out any periods with no violation days
      const validData = data.filter(period => period.violationDays > 0);
      
      if (validData.length === 0) {
        message.warning('Không có dữ liệu vi phạm để xuất');
        return;
      }

      await exportViolationTimeAgreement(validData);
    } catch (error) {
      console.error('Error exporting violation time:', error);
      message.error('Có lỗi xảy ra khi xuất biên bản thỏa thuận: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleImportViolationTime = async () => {
    if (readOnly) return;
    try {
      const importedData = await importViolationTimeAgreement();
      if (importedData) {
        setCompensationData(importedData);
      }
    } catch (error) {
      console.error('Error importing violation time:', error);
      message.error('Có lỗi xảy ra khi nhập biên bản thỏa thuận: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const columns = [
    {
      title: 'Tháng, năm',
      dataIndex: 'month',
      width: '150px',
      render: (text, record) => {
        if (record.month === 10 && record.year === 2024) {
          const period = dayjs(record.startDate).date() === 1 ? '1-10' : '11-31';
          return <Text style={{ color: record.isOldPrice ? 'inherit' : '#1890ff' }}>
            Tháng {record.month}/{record.year} ({period})
          </Text>;
        }
        return `Tháng ${record.month}/${record.year}`;
      }
    },
    {
      title: 'Số ngày vi phạm trong kỳ (ngày)',
      children: [
        {
          title: 'Từ ngày ÷ ngày',
          dataIndex: 'dateRange',
          width: '250px',
          render: (_, record, index) => {
            const isEditable = !readOnly && (index === 0 || index === data.length - 1);
            
            return isEditable ? (
              <RangePicker
                value={[
                  dayjs(record.startDate),
                  dayjs(record.endDate)
                ]}
                onChange={(dates) => handleDateRangeChange(index, dates)}
                format="DD/MM/YYYY"
              />
            ) : (
              <Text>
                {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
              </Text>
            );
          }
        },
        {
          title: 'Số ngày',
          dataIndex: 'violationDays',
          width: '100px',
          render: (text) => (
            <Text>{text}</Text>
          )
        }
      ]
    },
    {
      title: 'Số giờ mất điện trong kỳ (ngày)',
      dataIndex: 'outageDays',
      width: '100px',
      render: (text, record, index) => (
        readOnly ? (
          <Text>{text}</Text>
        ) : (
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={31}
            precision={1}
            value={text}
            onChange={(value) => updateOutageDays(index, value)}
          />
        )
      )
    },
    {
      title: 'Số ngày bồi thường trong kỳ (ngày)',
      dataIndex: 'compensationDays',
      width: '100px',
      render: (text, record) => {
        const days = (record.violationDays || 0) - (record.outageDays || 0);
        return <Text>{days.toFixed(1)}</Text>;
      }
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      render: (text, record, index) => (
        readOnly ? (
          <Text>{text}</Text>
        ) : (
          <Input
            value={text}
            onChange={(e) => updateReason(index, e.target.value)}
            placeholder="Nhập lý do..."
          />
        )
      )
    }
  ];

  const calculateTotals = () => {
    return data.reduce((acc, curr) => ({
      totalViolation: acc.totalViolation + (curr.violationDays || 0),
      totalOutage: acc.totalOutage + (curr.outageDays || 0),
      totalCompensation: acc.totalCompensation + ((curr.violationDays || 0) - (curr.outageDays || 0))
    }), { totalViolation: 0, totalOutage: 0, totalCompensation: 0 });
  };

  const totals = calculateTotals();

  return (
    <div>
      {!readOnly && (
        <div style={{ marginBottom: 20 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Text>Chọn tháng năm:</Text>
                <DatePicker
                  picker="month"
                  value={dayjs(`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)}
                  onChange={handleMonthYearChange}
                  format="MM/YYYY"
                  allowClear={false}
                  placeholder="Chọn tháng"
                  locale={{
                    lang: {
                      locale: 'vi',
                      monthFormat: 'MM/YYYY',
                      monthSelect: 'Chọn tháng',
                      yearSelect: 'Chọn năm',
                      yearFormat: 'YYYY',
                      previousMonth: 'Tháng trước',
                      nextMonth: 'Tháng sau',
                      previousYear: 'Năm trước',
                      nextYear: 'Năm sau',
                      months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
                    }
                  }}
                />
              </Space>
            </Space>
          </Space>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        size="small"
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <Text strong>Cộng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <Text strong>{totals.totalViolation.toFixed(1)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Text strong>{totals.totalOutage.toFixed(1)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text strong>{totals.totalCompensation.toFixed(1)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}></Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      {!readOnly && (
        <div style={{ marginTop: 20, display: 'flex', gap: 20 }}>
          <Button 
            onClick={handleExportViolationTime}
            icon={<DownloadOutlined />}
          >
            Xuất biên bản thỏa thuận
          </Button>
          <Button 
            onClick={handleImportViolationTime}
            icon={<UploadOutlined />}
          >
            Nhập biên bản thỏa thuận
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompensationCalculator;