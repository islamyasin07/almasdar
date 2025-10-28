import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import { UserRole } from '../models/types.js';

interface TokenPayload {
  _id: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  private static generateToken(payload: TokenPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  static generateAuthTokens(user: { _id: string; email: string; role: UserRole }) {
    const payload: TokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = this.generateToken(
      payload,
      env.jwtAccessSecret,
      '15m' // 15 minutes
    );

    const refreshToken = this.generateToken(
      payload,
      env.jwtRefreshSecret,
      '7d' // 7 days
    );

    return { accessToken, refreshToken };
  }

  static async validateRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
      const user = await User.findById(decoded._id);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      tokens: this.generateAuthTokens({
        _id: user._id.toString(),
        email: user.email,
        role: user.role
      })
    };
  }

  static async refreshToken(refreshToken: string) {
    const decoded = await this.validateRefreshToken(refreshToken);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return this.generateAuthTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    });
  }
}