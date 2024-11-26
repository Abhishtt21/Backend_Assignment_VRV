import { Request, Response } from 'express';
import User from '../models/userModel';

interface AuthRequest extends Request {
  user?: any;
}

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};