import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
        unique: [true, "Email already exist"]
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password should not greater than 6 characters"],
        select: false
    }
},
{timestamps: true}
)

const userModel = mongoose.model("user", userSchema)
export default userModel