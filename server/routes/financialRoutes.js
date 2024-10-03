const express = require('express');
const Financial = require('../models/Financial');

const router = express.Router();

// Function to generate advice based on financial data
const generateAdvice = (income, expenses, savings) => {
  let advice = '';

  if (savings < income * 0.1) {
    advice += 'Your savings are low. Aim to save at least 10% of your income. ';
  }
  if (expenses > income * 0.8) {
    advice += 'Your expenses are high. Try to reduce discretionary spending. ';
  }
  if (expenses > income) {
    advice += 'You are spending more than you earn. Consider creating a strict budget to reduce debt. ';
  }
  if (savings > income * 0.2) {
    advice += 'Great job on saving more than 20% of your income. Consider investing your savings. ';
  }
  if (expenses < income * 0.5) {
    advice += 'You have a good expense-to-income ratio. Keep it up! ';
  }

  return advice || 'You are in a stable financial condition.';
};

// POST: Create financial data
router.post('/', async (req, res) => {
  const { userId, income, expenses, savings } = req.body;

  // Input validation
  if (!userId || income <= 0 || expenses < 0 || savings < 0) {
    return res.status(400).json({ message: 'Invalid input: no negative values allowed, and all fields are required.' });
  }

  if (expenses + savings !== income) {
    return res.status(400).json({ message: 'Invalid input: expenses and savings must equal the income.' });
  }

  try {
    // Check for duplicate user ID
    const existingData = await Financial.findOne({ userId });
    if (existingData) {
      return res.status(400).json({ message: 'User ID already exists. Please use a unique User ID.' });
    }

    const financialData = new Financial({ userId, income, expenses, savings });
    await financialData.save();

    // Generate advice
    const advice = generateAdvice(income, expenses, savings);

    res.status(201).json({ message: 'Financial data saved successfully.', advice });
  } catch (error) {
    console.error('Error saving financial data:', error);
    res.status(500).json({ message: 'Error saving financial data.' });
  }
});

// GET: Retrieve financial data by User ID and provide advice
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await Financial.findOne({ userId });
    if (!data) {
      return res.status(404).json({ message: 'No data found for this User ID.' });
    }

    // Generate advice based on the retrieved financial data
    const advice = generateAdvice(data.income, data.expenses, data.savings);

    res.status(200).json({ data, advice });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Error retrieving user data.' });
  }
});

module.exports = router;
