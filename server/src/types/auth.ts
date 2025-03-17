// User Authentication Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

// Auth Request/Response Interfaces
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
} 