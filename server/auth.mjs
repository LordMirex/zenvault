import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.mjs';

export const hashSecret = (value) => bcrypt.hash(value, 10);
export const compareSecret = (value, hash) => bcrypt.compare(value, hash);

const signToken = (payload, expiresIn) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn });

export const createPendingToken = (user) =>
  signToken({ userId: user.id, role: user.role, type: 'pending' }, config.pendingTokenTtl);

export const createAccessToken = (user, sessionId) =>
  signToken({ userId: user.id, role: user.role, type: 'access', sessionId }, config.accessTokenTtl);

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
