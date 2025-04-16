import React, { createContext, useContext, useState } from 'react';

const SharedDataContext = createContext();

export const useSharedData = () => useContext(SharedDataContext);

export const SharedDataProvider = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '',
    customerName: '',
    meterCount: 1
  });

  const defaultDevices = [
    { key: '1', name: 'Bóng đèn tròn', unit: 'Cái', quantity: 1, power: 1 },
    { key: '2', name: 'Bóng đèn tuýp', unit: 'Cái', quantity: 1, power: 1 },
    { key: '3', name: 'Nồi cơm điện', unit: 'Cái', quantity: 1, power: 1 },
    { key: '4', name: 'Bếp từ', unit: 'Cái', quantity: 1, power: 1 },
    { key: '5', name: 'Bình nóng lạnh', unit: 'Cái', quantity: 1, power: 1 },
    { key: '6', name: 'Ấm điện', unit: 'Cái', quantity: 1, power: 1 },
    { key: '7', name: 'Máy giặt', unit: 'Cái', quantity: 1, power: 1 },
    { key: '8', name: 'Máy bơm nước', unit: 'Cái', quantity: 1, power: 1 },
    { key: '9', name: 'Quạt cây', unit: 'Cái', quantity: 1, power: 1 },
    { key: '10', name: 'Quạt trần', unit: 'Cái', quantity: 1, power: 1 },
    { key: '11', name: 'Quạt hơi nước', unit: 'Cái', quantity: 1, power: 1 },
    { key: '12', name: 'Ti vi', unit: 'Cái', quantity: 1, power: 1 },
    { key: '13', name: 'Tủ lạnh', unit: 'Cái', quantity: 1, power: 1 },
    { key: '14', name: 'Tủ bảo ôn', unit: 'Cái', quantity: 1, power: 1 },
    { key: '15', name: 'Điều hòa 1 chiều', unit: 'Cái', quantity: 1, power: 1 },
    { key: '16', name: 'Điều hòa 2 chiều', unit: 'Cái', quantity: 1, power: 1 },
    { key: '17', name: 'Máy tính để bàn', unit: 'Cái', quantity: 1, power: 1 },
    { key: '18', name: 'Bình đun nước nóng, lạnh', unit: 'Cái', quantity: 1, power: 1 },
    { key: '19', name: 'Camera', unit: 'Cái', quantity: 1, power: 1 }
  ];

  const businessDevicesList = [
    { key: 'b1', name: 'Bóng đèn tròn', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b2', name: 'Bóng đèn tuýp', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b3', name: 'Đèn quảng cáo', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b4', name: 'Bình nóng lạnh', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b5', name: 'Máy bơm nước', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b6', name: 'Nồi cơm công nghiệp', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b7', name: 'Bếp từ', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b8', name: 'Quạt cây', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b9', name: 'Quạt trần', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b10', name: 'Tủ lạnh', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b11', name: 'Tủ bảo ôn', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b12', name: 'Điều hòa 1 chiều', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b13', name: 'Điều hòa 2 chiều', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b14', name: 'Máy hút ẩm', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b15', name: 'Máy tính', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b16', name: 'Máy in', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b17', name: 'Máy bơm hơi', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b18', name: 'Máy mài', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b19', name: 'Máy cắt', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b20', name: 'Máy rửa xe', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b21', name: 'Máy đóng bao', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b22', name: 'Máy xay thực phẩm', unit: 'Cái', quantity: 1, power: 1 },
    { key: 'b23', name: 'Máy giặt công nghiệp', unit: 'Cái', quantity: 1, power: 1 }
  ];


  const [deviceInventory, setDeviceInventory] = useState(defaultDevices);
  const [monthlyDevices, setMonthlyDevices] = useState({});

  const [businessDeviceInventory, setBusinessDeviceInventory] = useState(businessDevicesList);
  const [businessMonthlyDevices, setBusinessMonthlyDevices] = useState({});

  const [detailCalculationData, setDetailCalculationData] = useState(null);

  const [detailedCalculationDevices, setDetailedCalculationDevices] = useState(
    // Initialize based on the default business list, adding necessary fields
    businessDevicesList.map(device => ({
        ...device,
        hoursPerDay: 0, 
        cosPhi: device.cosPhi || 0.9
    }))
  );
  

  const resetAllData = () => {
    setCustomerInfo({
      customerId: '',
      customerName: '',
      meterCount: 1
    });
    setDeviceInventory(defaultDevices);
    setMonthlyDevices({});
    setBusinessDeviceInventory(businessDevicesList);
    setBusinessMonthlyDevices({});
  };

  const updateCustomerInfo = (info) => {
    setCustomerInfo(info);
  };

  const calculatePowerUsage = (device, meterCount = customerInfo.meterCount) => {
    return device.quantity * device.power * device.cosPhi * device.hoursPerDay * device.daysPerPeriod * meterCount;
  };

  const updateDeviceInventory = (newInventory) => {
    setDeviceInventory(newInventory);

    setMonthlyDevices(prevMonthlyDevices => {
      const updatedMonthlyDevices = { ...prevMonthlyDevices };

      Object.keys(updatedMonthlyDevices).forEach(periodKey => {
        const periodData = updatedMonthlyDevices[periodKey];
        const devices = Array.isArray(periodData) ? periodData : periodData.devices || [];
        const paidElectricity = !Array.isArray(periodData) ? periodData.paidElectricity : 0;

        const deviceSettings = {};
        devices.forEach(device => {
          deviceSettings[device.key] = {
            cosPhi: device.cosPhi,
            hoursPerDay: device.hoursPerDay,
            daysPerPeriod: device.daysPerPeriod
          };
        });

        const updatedDevices = newInventory.map(device => ({
          ...device,
          cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
          hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
          daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || (devices.length > 0 ? devices[0].daysPerPeriod : 0),
          powerUsage: calculatePowerUsage({
            ...device,
            cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
            hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
            daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || (devices.length > 0 ? devices[0].daysPerPeriod : 0)
          }, customerInfo.meterCount)
        }));

        updatedMonthlyDevices[periodKey] = {
          devices: updatedDevices,
          paidElectricity
        };
      });

      return updatedMonthlyDevices;
    });
  };

  const updateMonthlyDevices = (periodKey, data) => {
    if (typeof periodKey === 'object' && periodKey !== null) {
        setMonthlyDevices(periodKey);
    } else if (typeof periodKey === 'string'){
        setMonthlyDevices(prev => ({
            ...prev,
            [periodKey]: {
                devices: Array.isArray(data) ? data : data?.devices || [],
                paidElectricity: typeof data === 'object' && data !== null && !Array.isArray(data) ? data.paidElectricity : 0
            }
        }));
    }
  };

  const updateBusinessDeviceInventory = (newInventory) => {
    setBusinessDeviceInventory(newInventory);

    setBusinessMonthlyDevices(prevMonthlyDevices => {
      const updatedMonthlyDevices = { ...prevMonthlyDevices };

      Object.keys(updatedMonthlyDevices).forEach(periodKey => {
        const periodData = updatedMonthlyDevices[periodKey];
        const devices = Array.isArray(periodData) ? periodData : periodData.devices || [];
        const paidElectricity = !Array.isArray(periodData) ? periodData.paidElectricity : 0;

        const deviceSettings = {};
        devices.forEach(device => {
          deviceSettings[device.key] = {
            cosPhi: device.cosPhi,
            hoursPerDay: device.hoursPerDay,
            daysPerPeriod: device.daysPerPeriod
          };
        });

        const updatedDevices = newInventory.map(device => ({
          ...device,
          cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
          hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
          daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || (devices.length > 0 ? devices[0].daysPerPeriod : 0),
          powerUsage: calculatePowerUsage({
            ...device,
            cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
            hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
            daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || (devices.length > 0 ? devices[0].daysPerPeriod : 0)
          }, customerInfo.meterCount)
        }));

        updatedMonthlyDevices[periodKey] = {
          devices: updatedDevices,
          paidElectricity
        };
      });

      return updatedMonthlyDevices;
    });
  };

  const updateBusinessMonthlyDevices = (periodKey, data) => {
     if (typeof periodKey === 'object' && periodKey !== null) {
        setBusinessMonthlyDevices(periodKey);
    } else if (typeof periodKey === 'string'){
        setBusinessMonthlyDevices(prev => ({
            ...prev,
            [periodKey]: {
                devices: Array.isArray(data) ? data : data?.devices || [],
                paidElectricity: typeof data === 'object' && data !== null && !Array.isArray(data) ? data.paidElectricity : 0
            }
        }));
    }
  };

  return (
    <SharedDataContext.Provider value={{
      customerInfo,
      deviceInventory,
      monthlyDevices,
      defaultDevices,
      businessDeviceInventory,
      businessMonthlyDevices,
      businessDevicesList,
      detailedCalculationDevices,
      detailCalculationData,
      updateCustomerInfo,
      updateDeviceInventory,
      updateMonthlyDevices,
      updateBusinessDeviceInventory,
      updateBusinessMonthlyDevices,
      setDetailedCalculationDevices, 
      calculatePowerUsage,
      resetAllData,
      setDetailCalculationData
    }}>
      {children}
    </SharedDataContext.Provider>
  );
};

export default SharedDataProvider;