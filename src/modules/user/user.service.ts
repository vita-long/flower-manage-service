import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


  // 根据ID获取用户
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  // 根据用户名获取用户
  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
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