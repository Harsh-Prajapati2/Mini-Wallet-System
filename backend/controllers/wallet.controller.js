const mongoose = require('mongoose');
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

// Helper: get or create wallet for userId
async function getOrCreateWallet(userId, session = null) {
  let wallet = await Wallet.findOne({ userId }).session(session);
  if (!wallet) {
    wallet = new Wallet({ userId, balance: 0 });
    await wallet.save({ session });
  }
  return wallet;
}

// GET /api/wallet/balance
async function getBalance(req, res) {
  try {
    const userId = req.user.userId;
    const wallet = await getOrCreateWallet(userId);
    return res.json({ balance: wallet.balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/wallet/credit { amount, description }
async function credit(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const { amount, description } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const wallet = await getOrCreateWallet(userId, session);
    wallet.balance = Number(wallet.balance) + amt;
    await wallet.save({ session });

    const tx = new Transaction({
      userId,
      walletId: wallet._id,
      amount: amt,
      transactionType: 'credit',
      description: description || 'Wallet credit',
      balanceAfterTransaction: wallet.balance,
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ balance: wallet.balance, transaction: tx });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/wallet/debit { amount, description }
async function debit(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const { amount, description } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const wallet = await getOrCreateWallet(userId, session);
    if (wallet.balance < amt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance = Number(wallet.balance) - amt;
    await wallet.save({ session });

    const tx = new Transaction({
      userId,
      walletId: wallet._id,
      amount: amt,
      transactionType: 'debit',
      description: description || 'Wallet debit',
      balanceAfterTransaction: wallet.balance,
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.json({ balance: wallet.balance, transaction: tx });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/wallet/transactions?limit=20&page=1
async function transactions(req, res) {
  try {
    const userId = req.user.userId;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find({ userId })
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ userId }),
    ]);

    return res.json({ total, page, limit, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getBalance,
  credit,
  debit,
  transactions,
};
