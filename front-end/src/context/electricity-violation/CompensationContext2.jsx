import React, { createContext, useState, useContext, useEffect } from 'react';
import dayjs from 'dayjs';

const CompensationContext2 = createContext();

export const useCompensation = () => useContext(CompensationContext2);

export const CompensationProvider2 = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [compensationData, setCompensationData] = useState([]);
  const [electricPriceMapping, setElectricPriceMapping] = useState({
    periods: [],
    usageLevels: {}
  });

  useEffect(() => {
    const initData = [];
    const startDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
    
    // Generate data for 13 months back
    for (let i = 0; i < 13; i++) {
      const currentDate = startDate.subtract(i, 'month');
      const month = currentDate.month() + 1;
      const year = currentDate.year();
      
      // Special handling for October 2024
      if (month === 10 && year === 2024) {
        // First part of October (1-10)
        const firstPeriodStart = dayjs('2024-10-01');
        const firstPeriodEnd = dayjs('2024-10-10');
        initData.push({
          key: `${month}-${year}-1`,
          month,
          year,
          startDate: firstPeriodStart.toDate(),
          endDate: firstPeriodEnd.toDate(),
          violationDays: firstPeriodEnd.diff(firstPeriodStart, 'day') + 1,
          outageDays: 0,
          compensationDays: firstPeriodEnd.diff(firstPeriodStart, 'day') + 1,
          reason: '',
          devices: [],
          paidElectricity: 0,
          isOldPrice: true
        });
        
        // Second part of October (11-31)
        const secondPeriodStart = dayjs('2024-10-11');
        const secondPeriodEnd = dayjs('2024-10-31');
        initData.push({
          key: `${month}-${year}-2`,
          month,
          year,
          startDate: secondPeriodStart.toDate(),
          endDate: secondPeriodEnd.toDate(),
          violationDays: secondPeriodEnd.diff(secondPeriodStart, 'day') + 1,
          outageDays: 0,
          compensationDays: secondPeriodEnd.diff(secondPeriodStart, 'day') + 1,
          reason: '',
          devices: [],
          paidElectricity: 0,
          isOldPrice: false
        });
      } else {
        const periodStart = currentDate.startOf('month');
        const periodEnd = currentDate.endOf('month');
        initData.push({
          key: `${month}-${year}`,
          month,
          year,
          startDate: periodStart.toDate(),
          endDate: periodEnd.toDate(),
          violationDays: periodEnd.diff(periodStart, 'day') + 1,
          outageDays: 0,
          compensationDays: periodEnd.diff(periodStart, 'day') + 1,
          reason: '',
          devices: [],
          paidElectricity: 0,
          isOldPrice: currentDate.isBefore('2024-10-11')
        });
      }
    }

    // Sort data in ascending order
    const sortedData = initData.sort((a, b) => {
      const dateA = dayjs(a.startDate);
      const dateB = dayjs(b.startDate);
      return dateA.diff(dateB);
    });

    setCompensationData(sortedData);
  }, [selectedMonth, selectedYear]);

  const updateViolationDays = (index, value) => {
    const newData = [...compensationData];
    newData[index].violationDays = value;
    setCompensationData(newData);
    calculateCompensation(index);
  };

  const updateOutageDays = (index, value) => {
    const newData = [...compensationData];
    newData[index].outageDays = value;
    setCompensationData(newData);
    calculateCompensation(index);
  };

  const updateReason = (index, value) => {
    const newData = [...compensationData];
    newData[index].reason = value;
    setCompensationData(newData);
  };

  const calculateCompensation = (index) => {
    const newData = [...compensationData];
    const entry = newData[index];
    
    if (entry) {
      entry.compensationDays = (entry.violationDays || 0) - (entry.outageDays || 0);
      setCompensationData(newData);
    }
  };

  const value = {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    compensationData,
    setCompensationData,
    updateViolationDays,
    updateOutageDays,
    updateReason,
    electricPriceMapping,
    setElectricPriceMapping
  };

  return (
    <CompensationContext2.Provider value={value}>
      {children}
    </CompensationContext2.Provider>
  );
};