const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getBalance, credit, debit, transactions } = require('../controllers/wallet.controller');

router.get('/balance', auth, getBalance);
router.post('/credit', auth, credit);
router.post('/debit', auth, debit);
router.get('/transactions', auth, transactions);

module.exports = router;
