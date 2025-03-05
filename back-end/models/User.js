const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // 🔹 Find user by email

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM users');
    return rows;
  }
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // 🔹 Find user by ID
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // 🔹 Create new user with hashed password
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, password, full_name, user_type, is_active) VALUES (?, ?, ?, ?, ?)',
      [userData.email, hashedPassword, userData.full_name, userData.user_type, userData.is_active]
    );
    return result.insertId;
  }

  // 🔹 Update user details (excluding password)
  static async update(id, userData) {
    const query = 'UPDATE users SET full_name = ?, user_type = ?, is_active = ? WHERE id = ?';
    await db.execute(query, [userData.full_name, userData.user_type, userData.is_active, id]);
  }

  // 🔹 Delete user by ID
  static async delete(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  // 🔹 Verify password during login
  static async comparePassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }

  // 🔹 Reset user password
  static async resetPassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  }
}

module.exports = User;
