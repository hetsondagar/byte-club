import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
