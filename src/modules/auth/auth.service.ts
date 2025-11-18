import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from '../user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 生成access_token
  private generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get<string>('JWT_SECRET', '123456'),
    });
  }

  // 生成refresh_token
  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', '987654'),
    });
  }

  // 用户登录
  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; access_token: string; refresh_token: string }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (!user.status) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 生成双token
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);

    // 返回用户信息（不包含密码）和token
    const { password: _, ...userInfo } = user;
    return {
      user: userInfo,
      access_token,
      refresh_token,
    };
  }

  // 刷新access_token
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', '987654'),
      });

      // 根据payload中的用户ID获取用户
      const user = await this.userService.getUserById(payload.userId);
      if (!user || !user.status) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 生成新的access_token
      const newAccessToken = this.generateAccessToken(user);
      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('无效的refresh token');
    }
  }
}