import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 用户登录
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token, refresh_token } = await this.authService.login(loginDto);

    // 设置cookie，不允许前端访问和修改
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 生产环境使用https
      maxAge: 2 * 60 * 60 * 1000, // 2小时
      path: '/',
      sameSite: 'strict',
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
      sameSite: 'strict',
    });

    return { user: user };
  }

  // 用户登出
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    // 将用户登录状态设置为0
    if (req.user) {
      await this.authService.logout(req.user['userId']);
    }

    // 清除cookie中的token
    res.clearCookie('access_token', { path: '/', sameSite: 'strict' });
    res.clearCookie('refresh_token', { path: '/', sameSite: 'strict' });

    return { message: '登出成功' };
  }

  // 刷新token
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { statusCode: 401, message: '缺少refresh token' };
    }

    const { access_token } = await this.authService.refreshToken(refreshToken);

    // 更新access_token cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'strict',
    });

    return { message: 'Token刷新成功', access_token };
  }



  // 获取当前用户信息
  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: Request) {
    return { user: req.user };
  }
}