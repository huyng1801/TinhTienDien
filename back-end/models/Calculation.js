const db = require('../config/db');

class Calculation {
  static async save(data) {
    try {
      const query = `
        INSERT INTO customer_calculations 
        (customer_id, customer_name, meter_count, devices, compensation_data, monthly_devices, paid_electricity, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`;

      await db.execute(query, [
        data.customer_id, 
        data.customer_name, 
        data.meter_count,
        JSON.stringify(data.devices),           
        JSON.stringify(data.compensation_data), 
        JSON.stringify(data.monthly_devices),   
        JSON.stringify(data.paid_electricity),  
        data.created_by
      ]);

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error; // Re-throw error for higher-level handling
    }
  }

  // 🔹 Chuyển safeJsonParse vào trong class Calculation
  static safeJsonParse(data) {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error("JSON parse error:", error);
        return []; // Trả về mảng rỗng nếu JSON lỗi
      }
    }
    return data; // Nếu đã là object, trả về nguyên gốc
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM customer_calculations ORDER BY updated_at DESC');

    return rows.map(row => ({
      ...row,
      devices: Calculation.safeJsonParse(row.devices),
      compensation_data: Calculation.safeJsonParse(row.compensation_data),
      monthly_devices: Calculation.safeJsonParse(row.monthly_devices),
      paid_electricity: Calculation.safeJsonParse(row.paid_electricity)
    }));
  }

  static async getByCustomerId(userId) {
    const [rows] = await db.execute('SELECT * FROM customer_calculations WHERE user_id = ?', [userId]);

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      devices: Calculation.safeJsonParse(rows[0].devices),
      compensation_data: Calculation.safeJsonParse(rows[0].compensation_data),
      monthly_devices: Calculation.safeJsonParse(rows[0].monthly_devices),
      paid_electricity: Calculation.safeJsonParse(rows[0].paid_electricity)
    };
  }

  static async delete(customerId) {
    await db.execute('DELETE FROM customer_calculations WHERE customer_id = ?', [customerId]);
  }
}

module.exports = Calculation;
