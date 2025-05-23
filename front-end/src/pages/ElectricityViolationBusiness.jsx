import React from 'react';
import { Tabs, Form, Input, Card, Space, Button, message } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  TableOutlined, 
  ReloadOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import CompensationCalculator from '../components/electricity-violation-business/CompensationCalculator';
import DeviceInventory from '../components/electricity-violation-business/DeviceInventory';
import DetailedCalculationView from '../components/electricity-violation-business/DetailedCalculationView';
import DetailedCalculationView3 from '../components/electricity-violation-business/DetailedCalculationView3';
import { useSharedData } from '../context/electricity-violation-business/SharedDataContext';
import { useCompensation } from '../context/electricity-violation-business/CompensationContext';
import { useAuth } from '../context/AuthContext';
import { calculationService } from '../services/calculationService';

const ElectricityViolationBusiness = () => {
  const { 
    updateCustomerInfo, 
    customerInfo, 
    resetAllData,
    deviceInventory,
    monthlyDevices 
  } = useSharedData();
  const { 
    setSelectedMonth, 
    setSelectedYear,
    compensationData 
  } = useCompensation();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleCustomerInfoChange = (changedValues, allValues) => {
    const meterCount = parseInt(allValues.meterCount) || 1;
    updateCustomerInfo({
      ...allValues,
      meterCount
    });
  };

  const handleReset = () => {
    // Reset form fields
    form.resetFields();

    // Reset all data in context
    resetAllData();

    // Reset compensation data to current month
    const currentDate = new Date();
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());

    message.success('Đã làm mới toàn bộ dữ liệu');
  };

  const handleSave = async () => {
    try {
      // Validate form
      await form.validateFields();

      setLoading(true);

      // Save calculation data
      await calculationService.saveCalculation({
        customerInfo,
        deviceInventory,
        compensationData,
        monthlyDevices
      }, user.id);

      message.success('Lưu dữ liệu thành công');
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin khách hàng');
      } else {
        console.error('Save calculation error:', error);
        message.error('Lưu dữ liệu thất bại: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <span>
          <TableOutlined />
          Bảng kê CS-SH
        </span>
      ),
      children: <DeviceInventory />
    },
    {
      key: '2',
      label: (
        <span>
          <CalculatorOutlined />
          Thỏa thuận thời gian VP
        </span>
      ),
      children: <CompensationCalculator />
    },
    {
      key: '3',
      label: (
        <span>
          <CalculatorOutlined />
          Bảng tính chi tiết 1 giá
        </span>
      ),
      children: <DetailedCalculationView />
    },
    {
      key: '4',
      label: (
        <span>
          <CalculatorOutlined />
          Bảng tính chi tiết 3 giá
        </span>
      ),
      children: <DetailedCalculationView3 />
    }
  ];
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ ...customerInfo, meterCount: customerInfo.meterCount || 1 }}
          onValuesChange={handleCustomerInfoChange}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space size="large" style={{ width: '100%' }}>
              <Form.Item
                name="customerId"
                label="Mã khách hàng"
                style={{ width: '200px', marginBottom: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập mã khách hàng!' }]}
              >
                <Input placeholder="Nhập mã khách hàng" />
              </Form.Item>
              
              <Form.Item
                name="customerName"
                label="Tên khách hàng"
                style={{ width: '300px', marginBottom: 0 }}
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
              >
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
              
              <Form.Item
                name="meterCount"
                label="Số lượng hộ dân"
                style={{ width: '200px', marginBottom: 0 }}
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng hộ dân!' },
                  { type: 'number', min: 1, message: 'Số lượng đồng hồ phải lớn hơn 0!' }
                ]}
              >
                <Input 
                  type="number" 
                  min={1} 
                  placeholder="Nhập số lượng đồng hồ"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    form.setFieldsValue({ meterCount: value });
                  }}
                />
              </Form.Item>
            </Space>

            <Space style={{ marginTop: 16 }}>
              <Button 
                type="primary"
                icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
                onClick={handleSave}
                loading={loading}
              >
                Lưu
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Làm mới
              </Button>
            </Space>
          </Space>
        </Form>
      </Card>

      <Tabs 
        items={items}
        type="card"
        size="large"
      />
    </div>
  );
};

export default ElectricityViolationBusiness;