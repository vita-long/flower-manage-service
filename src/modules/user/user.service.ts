import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 创建用户
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOneBy({ username: createUserDto.username });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  // 用户登录
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 这里简化处理，实际应该使用JWT生成token
    const token = 'mock_jwt_token';

    return { user, token };
  }

  // 根据ID获取用户
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  // 获取所有用户
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 更新用户
  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    // 如果更新密码，需要重新加密
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepository.update(id, updateData);
    return this.userRepository.findOneBy({ id });
  }

  // 删除用户
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const result = await this.userRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}