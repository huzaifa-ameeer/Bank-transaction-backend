import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const userRegister = async (req, res) => {
  const { name, email, password } = req.body;

  const isExists = await userModel.findOne({
    email: email,
  });

  if (isExists) {
    return res.status(409).json({
      message: "Email already registered",
      success: false,
    });
  }

  const user = await userModel.create({
    name,
    email,
    password,
  });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    token,
  });
};

const userLogin = async (req,res) => {

}

export default { userRegister, userLogin };
