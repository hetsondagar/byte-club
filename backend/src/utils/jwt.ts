import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwtSecret as string,
    { expiresIn: config.jwtExpiresIn as any }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.jwtSecret as string,
    { expiresIn: config.refreshTokenExpiresIn as any }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret as string);
};
