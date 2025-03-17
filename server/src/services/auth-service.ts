import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserResponse, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import config from '../config';
import logger from '../utils/logger';

// Basitlik için bellek içi kullanıcı deposu (gerçek uygulamada bir veritabanı kullanılacaktır)
const users: User[] = [];

class AuthService {
  /**
   * Yeni bir kullanıcı kaydeder
   */
  public async register(userData: RegisterRequest): Promise<UserResponse> {
    // Kullanıcı adı veya e-posta kontrolü
    const existingUser = users.find(
      (user) => user.username === userData.username || user.email === userData.email
    );
    
    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }
      if (existingUser.email === userData.email) {
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    // Şifreyi hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Yeni kullanıcı oluşturma
    const now = new Date();
    const newUser: User = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };

    // Kullanıcıyı kaydetme
    users.push(newUser);
    
    logger.info(`Yeni kullanıcı kaydedildi: ${newUser.username}`);

    // Hassas bilgileri çıkarma
    const { password, ...userResponse } = newUser;
    
    return userResponse;
  }

  /**
   * Kullanıcı giriş işlemi
   */
  public async login(loginData: LoginRequest): Promise<AuthResponse> {
    // Kullanıcıyı bulma
    const user = users.find((user) => user.username === loginData.username);
    
    if (!user) {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    // JWT token oluşturma
    const token = jwt.sign(
      { userId: user.id },
      config.server.jwtSecret,
      { expiresIn: config.server.jwtExpiresIn }
    );

    logger.info(`Kullanıcı giriş yaptı: ${user.username}`);

    // Hassas bilgileri çıkarma
    const { password, ...userResponse } = user;
    
    return {
      token,
      user: userResponse
    };
  }

  /**
   * ID'ye göre kullanıcı bulma
   */
  public async getUserById(userId: string): Promise<UserResponse | null> {
    const user = users.find((user) => user.id === userId);
    
    if (!user) {
      return null;
    }

    // Hassas bilgileri çıkarma
    const { password, ...userResponse } = user;
    
    return userResponse;
  }

  /**
   * JWT token doğrulama
   */
  public async verifyToken(token: string): Promise<UserResponse | null> {
    try {
      const decoded = jwt.verify(token, config.server.jwtSecret) as { userId: string };
      return this.getUserById(decoded.userId);
    } catch (error) {
      logger.error('Token doğrulama hatası:', error);
      return null;
    }
  }
}

export default new AuthService(); 