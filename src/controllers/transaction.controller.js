import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/accounts.model.js";
import ledgerModel from "../models/ledger.model.js";
import emailService from "../services/email.service.js";

const createTransaction = async (req, res) => {
  //validate request

  const { fromAccount, toAccount, amount, idempotencyKet } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKet) {
    return res.status(400).json({
      message: "Missing required fields",
      success: false,
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "fromAccount and toAccount are required",
      success: false,
    });
  }
};
