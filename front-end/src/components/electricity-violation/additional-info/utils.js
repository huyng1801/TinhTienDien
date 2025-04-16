import dayjs from 'dayjs';
import { PRICE_PERIODS, BASE_MONTHLY_LIMITS } from './constants';

export const getPricePeriod = (date) => {
  const dateObj = dayjs(date);
  if (dateObj.isBefore('2023-11-09')) {
    return PRICE_PERIODS.BEFORE_NOV_2023;
  } else if (dateObj.isBefore('2024-10-11')) {
    return PRICE_PERIODS.NOV_2023_TO_OCT_2024;
  }
  return PRICE_PERIODS.AFTER_OCT_2024;
};

export const calculatePowerUsage = (device, meterCount = 1) => {
  return device.quantity * device.power * device.cosPhi * device.hoursPerDay * device.daysPerPeriod * meterCount;
};

// Calculate daily limits based on compensation days and number of households
export const calculateDailyLimits = (compensationDays, householdCount = 1) => {
  const daysInMonth = 30;
  return {
    bac1: (BASE_MONTHLY_LIMITS.bac1 * householdCount / daysInMonth) * compensationDays,
    bac2: (BASE_MONTHLY_LIMITS.bac2 * householdCount / daysInMonth) * compensationDays,
    bac3: (BASE_MONTHLY_LIMITS.bac3 * householdCount / daysInMonth) * compensationDays,
    bac4: (BASE_MONTHLY_LIMITS.bac4 * householdCount / daysInMonth) * compensationDays,
    bac5: (BASE_MONTHLY_LIMITS.bac5 * householdCount / daysInMonth) * compensationDays
  };
};

export const calculateElectricityDistribution = (totalUsage, paidAmount, data, householdCount = 1) => {
  const daysInMonth = dayjs(data.endDate).daysInMonth();
  const compensationDays = (data.violationDays || 0);
  const isFullMonth = compensationDays >= daysInMonth;

  // Calculate monthly limits based on number of households
  const monthlyLimits = {
    bac1: BASE_MONTHLY_LIMITS.bac1 * householdCount,
    bac2: BASE_MONTHLY_LIMITS.bac2 * householdCount,
    bac3: BASE_MONTHLY_LIMITS.bac3 * householdCount,
    bac4: BASE_MONTHLY_LIMITS.bac4 * householdCount,
    bac5: BASE_MONTHLY_LIMITS.bac5 * householdCount
  };

  const remainingUsage = Math.max(totalUsage - paidAmount, 0);

  let distribution;
  if (isFullMonth) {
    const paidDistribution = {
      bac1: Math.min(paidAmount, monthlyLimits.bac1),
      bac2: Math.min(Math.max(paidAmount - monthlyLimits.bac1, 0), monthlyLimits.bac2),
      bac3: Math.min(Math.max(paidAmount - (monthlyLimits.bac1 + monthlyLimits.bac2), 0), monthlyLimits.bac3),
      bac4: Math.min(Math.max(paidAmount - (monthlyLimits.bac1 + monthlyLimits.bac2 + monthlyLimits.bac3), 0), monthlyLimits.bac4),
      bac5: Math.min(Math.max(paidAmount - (monthlyLimits.bac1 + monthlyLimits.bac2 + monthlyLimits.bac3 + monthlyLimits.bac4), 0), monthlyLimits.bac5),
      bac6: Math.max(paidAmount - (monthlyLimits.bac1 + monthlyLimits.bac2 + monthlyLimits.bac3 + monthlyLimits.bac4 + monthlyLimits.bac5), 0)
    };

    let remainingCompensation = remainingUsage;
    const compensationDistribution = {
      bac1: Math.min(Math.max(monthlyLimits.bac1 - paidDistribution.bac1, 0), remainingCompensation),
      bac2: 0,
      bac3: 0,
      bac4: 0,
      bac5: 0,
      bac6: 0
    };
    remainingCompensation -= compensationDistribution.bac1;

    if (remainingCompensation > 0) {
      compensationDistribution.bac2 = Math.min(Math.max(monthlyLimits.bac2 - paidDistribution.bac2, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac2;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac3 = Math.min(Math.max(monthlyLimits.bac3 - paidDistribution.bac3, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac3;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac4 = Math.min(Math.max(monthlyLimits.bac4 - paidDistribution.bac4, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac4;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac5 = Math.min(Math.max(monthlyLimits.bac5 - paidDistribution.bac5, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac5;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac6 = remainingCompensation;
    }

    distribution = {
      paid: paidDistribution,
      compensation: compensationDistribution
    };
  } else {
    const dailyLimits = calculateDailyLimits(compensationDays, householdCount);
    
    const paidDistribution = {
      bac1: Math.min(paidAmount, dailyLimits.bac1),
      bac2: Math.min(Math.max(paidAmount - dailyLimits.bac1, 0), dailyLimits.bac2),
      bac3: Math.min(Math.max(paidAmount - (dailyLimits.bac1 + dailyLimits.bac2), 0), dailyLimits.bac3),
      bac4: Math.min(Math.max(paidAmount - (dailyLimits.bac1 + dailyLimits.bac2 + dailyLimits.bac3), 0), dailyLimits.bac4),
      bac5: Math.min(Math.max(paidAmount - (dailyLimits.bac1 + dailyLimits.bac2 + dailyLimits.bac3 + dailyLimits.bac4), 0), dailyLimits.bac5),
      bac6: Math.max(paidAmount - Object.values(dailyLimits).reduce((a, b) => a + b, 0), 0)
    };

    let remainingCompensation = remainingUsage;
    const compensationDistribution = {
      bac1: Math.min(Math.max(dailyLimits.bac1 - paidDistribution.bac1, 0), remainingCompensation),
      bac2: 0,
      bac3: 0,
      bac4: 0,
      bac5: 0,
      bac6: 0
    };
    remainingCompensation -= compensationDistribution.bac1;

    if (remainingCompensation > 0) {
      compensationDistribution.bac2 = Math.min(Math.max(dailyLimits.bac2 - paidDistribution.bac2, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac2;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac3 = Math.min(Math.max(dailyLimits.bac3 - paidDistribution.bac3, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac3;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac4 = Math.min(Math.max(dailyLimits.bac4 - paidDistribution.bac4, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac4;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac5 = Math.min(Math.max(dailyLimits.bac5 - paidDistribution.bac5, 0), remainingCompensation);
      remainingCompensation -= compensationDistribution.bac5;
    }

    if (remainingCompensation > 0) {
      compensationDistribution.bac6 = remainingCompensation;
    }

    distribution = {
      paid: paidDistribution,
      compensation: compensationDistribution
    };
  }

  return distribution;
};