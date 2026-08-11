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

  //validate idempotency key

  const isTransactionExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  })

  if(isTransactionExists.status === "COMPLETED"){
    return res.json({
        message: "Transaction already processed"
    })
  }
  if(isTransactionExists.status === "PENDING"){
    return res.json({
        message: "Transaction is in processing"
    })
  }
  if(isTransactionExists.status === "FAILED"){
    return res.json({
        message: "Transaction processing failed, please try again"
    })
  }
  if(isTransactionExists.status === "REVERSED"){
    return res.json({
        message: "Transaction prcoessing is reversed, please try again"
    })
  }

};
