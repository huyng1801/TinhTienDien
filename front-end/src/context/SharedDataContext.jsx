import React, { createContext, useContext, useState } from 'react';

const SharedDataContext = createContext();

export const useSharedData = () => useContext(SharedDataContext);

export const SharedDataProvider = ({ children }) => {
  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '',
    customerName: '',
    meterCount: 1
  });

  // Device inventory state with default values
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

  const [deviceInventory, setDeviceInventory] = useState(defaultDevices);
  const [monthlyDevices, setMonthlyDevices] = useState({});

  // Reset all data to initial state
  const resetAllData = () => {
    // Reset customer info
    setCustomerInfo({
      customerId: '',
      customerName: '',
      meterCount: 1
    });

    // Reset device inventory to default
    setDeviceInventory(defaultDevices);

    // Reset monthly devices
    setMonthlyDevices({});
  };

  const updateCustomerInfo = (info) => {
    setCustomerInfo(info);
  };

  const updateDeviceInventory = (newInventory) => {
    setDeviceInventory(newInventory);
    
    // Update monthly devices when inventory changes
    setMonthlyDevices(prevMonthlyDevices => {
      const updatedMonthlyDevices = { ...prevMonthlyDevices };
      
      // Update each period's devices
      Object.keys(updatedMonthlyDevices).forEach(periodKey => {
        const periodData = updatedMonthlyDevices[periodKey];
        const devices = Array.isArray(periodData) ? periodData : periodData.devices || [];
        const paidElectricity = !Array.isArray(periodData) ? periodData.paidElectricity : 0;
        
        // Create a map of existing devices with their settings
        const deviceSettings = {};
        devices.forEach(device => {
          deviceSettings[device.key] = {
            cosPhi: device.cosPhi,
            hoursPerDay: device.hoursPerDay,
            daysPerPeriod: device.daysPerPeriod
          };
        });
        
        // Update devices based on new inventory
        const updatedDevices = newInventory.map(device => ({
          ...device,
          cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
          hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
          daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || devices[0]?.daysPerPeriod || 0,
          powerUsage: calculatePowerUsage({
            ...device,
            cosPhi: deviceSettings[device.key]?.cosPhi || 0.9,
            hoursPerDay: deviceSettings[device.key]?.hoursPerDay || 0,
            daysPerPeriod: deviceSettings[device.key]?.daysPerPeriod || devices[0]?.daysPerPeriod || 0
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

  const calculatePowerUsage = (device, meterCount = customerInfo.meterCount) => {
    return device.quantity * device.power * device.cosPhi * device.hoursPerDay * device.daysPerPeriod * meterCount;
  };

  const updateMonthlyDevices = (periodKey, devices) => {
    if (typeof periodKey === 'object') {
      // Handle case where periodKey is an object containing all monthly devices
      setMonthlyDevices(periodKey);
    } else {
      // Handle case where periodKey is a string and devices is an array
      setMonthlyDevices(prev => ({
        ...prev,
        [periodKey]: {
          devices: Array.isArray(devices) ? devices : devices.devices || [],
          paidElectricity: !Array.isArray(devices) ? devices.paidElectricity : 0
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
      updateCustomerInfo,
      updateDeviceInventory,
      updateMonthlyDevices,
      calculatePowerUsage,
      resetAllData
    }}>
      {children}
    </SharedDataContext.Provider>
  );
};

export default SharedDataProvider;