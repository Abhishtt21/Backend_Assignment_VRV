"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "abhi";
    if (!secret) {
        throw new Error('JWT secret is not defined');
    }
    try {
        return jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
    }
    catch (error) {
        throw new Error('Token generation failed');
    }
};
const sendEmail = (email, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    yield transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text
    });
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = req.body;
    console.log(req.body);
    try {
        const user = new userModel_1.default({ username, email, password, role });
        yield user.save();
        const token = generateToken(user);
        console.log(token);
        // const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
        //await sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);
        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield userModel_1.default.findById(decoded.id);
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        user.isVerified = true;
        yield user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.verifyEmail = verifyEmail;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userModel_1.default.findOne({ email });
        let isMatch = false;
        if (user) {
            try {
                isMatch = yield user.comparePassword(password);
            }
            catch (error) {
                res.status(500).json({ message: 'Error comparing passwords' });
                return;
            }
        }
        if (!user || !isMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        if (!user.isVerified) {
            res.status(400).json({ message: 'Please verify your email before logging in' });
            return;
        }
        const token = generateToken(user);
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        const token = generateToken(user);
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
        yield sendEmail(email, 'Reset Password', `Click the link to reset your password: ${resetLink}`);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield userModel_1.default.findById(decoded.id);
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updatePassword = updatePassword;
