const express = require('express');
const {
  signIn,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  resetPassword,
} = require('../controllers/userController');

const router = express.Router();

// 🔹 User Authentication
router.post('/signin', signIn);

// 🔹 Create New User
router.post('/', createUser);

// 🔹 Get All Users
router.get('/', getAllUsers);

// 🔹 Get User by ID
router.get('/:id', getUserById);

// 🔹 Update User
router.put('/:id', updateUser);

// 🔹 Delete User
router.delete('/:id', deleteUser);

// 🔹 Reset Password
router.put('/reset-password/:id', resetPassword);

module.exports = router;
