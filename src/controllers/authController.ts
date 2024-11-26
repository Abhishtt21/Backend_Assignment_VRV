import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import nodemailer from 'nodemailer';

const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET || "defaultSecret";
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  try {
    return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1h' });
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

const sendEmail = async (email: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
        };
    await transporter.sendMail(mailOptions);
}

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;
  console.log(req.body);
  try {
    const user = new User({ username, email, password, role });
    await user.save();
    
    const token = generateToken(user);
    console.log(token);
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendEmail(email, 'Verify Email', `Click the link to verify your email: ${verificationLink}`);

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login: RequestHandler = async (req: Request, res: Response):Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    let isMatch = false;
    if (user) {
      try {
        isMatch = await user.comparePassword(password);
      } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword: RequestHandler = async (req: Request, res: Response) : Promise<void>=> {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const token = generateToken(user);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail(email, 'Reset Password', `Click the link to reset your password: ${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};