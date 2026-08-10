import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
      unique: [true, "Email already exist"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should not greater than 6 characters"],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next()
    
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return next()
})

const userModel = mongoose.model("user", userSchema);
export default userModel;
