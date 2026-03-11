import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { Role } from "../types/user.types";
import { isValidObjectId } from "../service/resourceservice";

// register
export const registerUser = async (req: Request, res: Response) => {
  const { userName, email, password, role } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role: role || Role.EMPLOYEE
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in register",
    });
  }
};

// login
export const loginUser = async (req: Request, res: Response) => {
  
  const { email, password } = req.body;
  console.log(email)

  
  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      id: checkUser._id,
      role: checkUser.role,
      email: checkUser.email,
    });

    res
      .cookie("token", token, { httpOnly: true })
      .cookie("userId", String(checkUser._id), { httpOnly: false }) // readable by frontend JS
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: checkUser._id,
          email: checkUser.email,
          role: checkUser.role,
        },
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in login",
    });
  }
};


export const getAllUsers = async (req: Request, res: Response) => { 
  try {
    const users = await User.find({ role: { $ne: Role.ADMIN } }).select("-password").lean();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  } 
}


// logout
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully",
  });
};



export const getUserById = async (req: Request, res: Response) => {

  const { id } = req.params;   

  try {
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Error fetching user:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};
