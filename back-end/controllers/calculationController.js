const Calculation = require('../models/Calculation');

exports.saveCalculation = async (req, res) => {
  try {
    await Calculation.save(req.body);
    res.json({ message: 'Lưu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCalculations = async (req, res) => {
  try {
    const calculations = await Calculation.getAll();
    res.json(calculations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCalculationByUserId = async (req, res) => {
  try {
    const calculation = await Calculation.userId(req.params.userId);
    res.json(calculation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCalculation = async (req, res) => {
  try {
    await Calculation.delete(req.params.customerId);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
