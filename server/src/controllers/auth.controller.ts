import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { Role } from "../types/user.types";

// REGISTER
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

// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

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

// LOGOUT
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully",
  });
};
