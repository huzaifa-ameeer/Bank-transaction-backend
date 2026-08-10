import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import emailService from "../services/email.service.js";

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

  // Send registration email

  try {
    await emailService.sendRegistrationEmail(email, name);
  } catch (error) {
    console.error("Error sending registration email:", error);
  }
  
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "Invalid email",
      success: false,
    });
  }
  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Invalid Password",
      success: false,
    });
  }

  const token = jwt.sign({
    userId: user._id,
  }, process.env.JWT_SECRET_KEY, {expiresIn: "3d"});

  res.cookie("token", token);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

export default { userRegister, userLogin };
