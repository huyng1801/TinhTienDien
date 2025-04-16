export const PRICE_PERIODS = {
  BEFORE_NOV_2023: 'BEFORE_NOV_2023',
  NOV_2023_TO_OCT_2024: 'NOV_2023_TO_OCT_2024',
  AFTER_OCT_2024: 'AFTER_OCT_2024'
};

export const PRICES = {
  [PRICE_PERIODS.BEFORE_NOV_2023]: [1728, 1786, 2074, 2612, 2919, 3015],
  [PRICE_PERIODS.NOV_2023_TO_OCT_2024]: [1806, 1866, 2167, 2729, 3050, 3151],
  [PRICE_PERIODS.AFTER_OCT_2024]: [1893, 1956, 2271, 2860, 3197, 3302]
};

// Base limits per household
export const BASE_MONTHLY_LIMITS = {
  bac1: 50,  // 0-50 kWh
  bac2: 50,  // 51-100 kWh
  bac3: 100, // 101-200 kWh
  bac4: 100, // 201-300 kWh
  bac5: 100  // 301-400 kWh
  // bac6: everything above 400 kWh
};