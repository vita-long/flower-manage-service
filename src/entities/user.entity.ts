import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users', comment: '用户表' })
export class User {
  @PrimaryGeneratedColumn({ comment: '用户ID' })
  id: number;

  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ length: 100, comment: '密码（加密存储）' })
  password: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone?: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email?: string;

  @Column({ default: 0, comment: '用户角色：0普通用户，1管理员' })
  role: number;

  @Column({ default: true, comment: '用户状态：true启用，false禁用' })
  status: boolean;

  @Column({ default: 0, comment: '登录状态：0未登录，1已登录' })
  loginStatus: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}