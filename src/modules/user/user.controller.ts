import { Controller, Post, Get, Put, Delete, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 用户注册
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  // 用户登录
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ user: User; token: string }> {
    return this.userService.login(loginDto);
  }

  // 获取所有用户
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  // 根据ID获取用户
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  // 更新用户
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<User | null> {
    return this.userService.updateUser(id, updateData);
  }

  // 删除用户
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ success: boolean }> {
    const success = await this.userService.deleteUser(id);
    return { success };
  }
}