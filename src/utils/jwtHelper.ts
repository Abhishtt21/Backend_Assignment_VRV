import jwt from 'jsonwebtoken';

const secretKey = 'your-secret-key';

interface JwtPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
        console.error('Invalid token', error);
        return null;
    }
};