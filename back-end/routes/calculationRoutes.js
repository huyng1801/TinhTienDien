const express = require('express');
const { saveCalculation, getCalculations, deleteCalculation, getCalculationByUserId } = require('../controllers/calculationController');

const router = express.Router();

router.post('/', saveCalculation);
router.get('/', getCalculations);
router.get('/:customerId', getCalculationByUserId);
router.delete('/:customerId', deleteCalculation);

module.exports = router;
