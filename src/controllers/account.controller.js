import accountModel from "../models/accounts.model.js";

const createAccount = async (req, res) => {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    message: "Account created successfully",
    name: user.name,
    email: user.email,
    account,
    success: true
  });
};

const getUserAccounts = async (req, res) => {
  const user = req.user;

  const accounts = await accountModel.find({ user: user._id });

  res.status(200).json({
    message: "Accounts fetched successfully",
    name: user.name,
    email: user.email,
    accounts,
    success: true,
  });
};

const getAccountBalance = async (req, res) => {
  const { accountId } = req.params;

  const account = await accountModel.findOne({ _id: accountId });

  if (!account) {
    return res.status(404).json({
      message: "Account not found",
      success: false,
    });
  }

  if (account.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "You can only view the balance of your own accounts",
      success: false,
    });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    message: "Account balance fetched successfully",
    accountId: account._id,
    balance,
    success: true,
  });
};

export default { createAccount, getUserAccounts, getAccountBalance };
