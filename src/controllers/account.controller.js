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

export default { createAccount };
