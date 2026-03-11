"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.logoutUser = exports.getAllUsers = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const generateToken_1 = require("../utils/generateToken");
const user_types_1 = require("../types/user.types");
const resourceservice_1 = require("../service/resourceservice");
// REGISTER
const registerUser = async (req, res) => {
    const { userName, email, password, role } = req.body;
    try {
        const checkUser = await user_model_1.User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const newUser = new user_model_1.User({
            userName,
            email,
            password: hashedPassword,
            role: role || user_types_1.Role.EMPLOYEE
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "Registration successful",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in register",
        });
    }
};
exports.registerUser = registerUser;
// LOGIN
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    try {
        const checkUser = await user_model_1.User.findOne({ email });
        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isMatch = await bcrypt_1.default.compare(password, checkUser.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = (0, generateToken_1.generateToken)({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in login",
        });
    }
};
exports.loginUser = loginUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await user_model_1.User.find({ role: { $ne: user_types_1.Role.ADMIN } }).select("-password").lean();
        res.status(200).json(users);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllUsers = getAllUsers;
// LOGOUT
const logoutUser = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logoutUser = logoutUser;
const getUserById = async (req, res) => {
    const { id } = req.params; // Use params, not body
    try {
        // Validate ObjectId
        if (!(0, resourceservice_1.isValidObjectId)(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
        }
        const user = await user_model_1.User.findById(id);
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
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching user",
        });
    }
};
exports.getUserById = getUserById;
