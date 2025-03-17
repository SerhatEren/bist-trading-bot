import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import { AuthResponse, JwtPayload, LoginRequest, RegisterRequest, User, UserRole } from '../types/auth';
import logger from '../utils/logger';

// Mock user database for MVP (replace with real database in production)
const users: User[] = [];

/**
 * Authentication Service
 * Provides methods for user authentication
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = users.find(
        (user) => user.username === userData.username || user.email === userData.email
      );

      if (existingUser) {
        throw new Error('User already exists with this username or email');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create new user
      const newUser: User = {
        id: uuidv4(),
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save user to database
      users.push(newUser);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      logger.error('Error registering user', error);
      throw error;
    }
  }

  /**
   * Login a user
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by username
      const user = users.find((user) => user.username === loginData.username);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isMatch = await bcrypt.compare(loginData.password, user.password);

      if (!isMatch) {
        throw new Error('Invalid username or password');
      }

      // Create JWT payload
      const payload: JwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };

      // Generate token
      const token = jwt.sign(payload, config.jwtSecret);

      // Calculate expiration date
      const expiresAt = new Date(payload.exp * 1000);

      // Return auth response with user data (without password)
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword as Omit<User, 'password'>,
        token,
        expiresAt,
      };
    } catch (error) {
      logger.error('Error logging in user', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Error verifying token', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = users.find((user) => user.id === userId);

      if (!user) {
        return null;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error(`Error fetching user ${userId}`, error);
      throw error;
    }
  }
} 