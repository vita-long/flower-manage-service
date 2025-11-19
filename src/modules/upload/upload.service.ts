import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Injectable()
export class UploadService {
  private uploadDir: string;
  private allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
  };
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    // 设置上传目录
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // 确保上传目录存在
    this.ensureUploadDirExists();
  }

  // 确保上传目录存在
  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`创建上传目录: ${this.uploadDir}`);
    }
  }

  // 验证文件类型
  private validateFileType(file: Express.Multer.File, uploadType: string): boolean {
    const allowedTypes = this.allowedMimeTypes[uploadType as keyof typeof this.allowedMimeTypes];
    if (!allowedTypes) {
      return true; // 如果没有特定类型限制，默认允许
    }
    return allowedTypes.includes(file.mimetype);
  }

  // 生成唯一文件名
  private generateFileName(file: Express.Multer.File): string {
    const extension = path.extname(file.originalname);
    return `${uuidv4()}${extension}`;
  }

  // 保存文件
  async saveFile(file: Express.Multer.File, uploadType: string): Promise<string> {
    try {
      this.logger.log(`开始上传文件 - 类型: ${uploadType}, 文件名: ${file.originalname}, 大小: ${file.size} 字节, MIME类型: ${file.mimetype}`);
      
      // 验证文件类型
      if (!this.validateFileType(file, uploadType)) {
        this.logger.warn(`文件类型验证失败 - 文件名: ${file.originalname}, 类型: ${file.mimetype}`);
        throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
      }

      // 根据上传类型创建子目录
      const typeDir = path.join(this.uploadDir, uploadType);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
        this.logger.log(`创建类型目录: ${typeDir}`);
      }

      // 生成唯一文件名
      const fileName = this.generateFileName(file);
      const filePath = path.join(typeDir, fileName);

      // 保存文件
      fs.writeFileSync(filePath, file.buffer);
      
      // 返回可访问的文件URL路径
      const returnPath = `/uploads/${uploadType}/${fileName}`;
      this.logger.log(`文件上传成功 - 原文件名: ${file.originalname}, 保存路径: ${filePath}, 返回路径: ${returnPath}`);
      return returnPath;
    } catch (error) {
      this.logger.error(`文件上传失败 - 文件名: ${file.originalname}, 错误: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('文件保存失败');
    }
  }

  // 处理多文件上传
  async saveFiles(files: Express.Multer.File[], uploadType: string): Promise<string[]> {
    this.logger.log(`开始批量上传文件 - 数量: ${files.length}, 类型: ${uploadType}`);
    
    const fileUrls: string[] = [];
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        this.logger.log(`处理文件 ${i + 1}/${files.length} - 文件名: ${file.originalname}`);
        
        const url = await this.saveFile(file, uploadType);
        fileUrls.push(url);
        successCount++;
      } catch (error) {
        this.logger.error(`批量上传中单个文件失败 - 索引: ${i}, 错误: ${error.message}`);
        // 继续处理其他文件，不中断整个批处理
      }
    }
    
    this.logger.log(`批量上传完成 - 总数量: ${files.length}, 成功数量: ${successCount}, 失败数量: ${files.length - successCount}`);
    return fileUrls;
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      this.logger.log(`开始删除文件 - 请求路径: ${filePath}`);
      
      // 移除可能的/uploads前缀
      const cleanPath = filePath.startsWith('/uploads') ? filePath.substring(8) : filePath;
      const fullPath = path.join(this.uploadDir, cleanPath);
      
      // 检查文件是否存在
      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`文件不存在 - 路径: ${fullPath}`);
        return false;
      }
      
      fs.unlinkSync(fullPath);
      this.logger.log(`文件删除成功 - 路径: ${fullPath}`);
      return true;
    } catch (error) {
      this.logger.error(`文件删除失败 - 路径: ${filePath}, 错误: ${error.message}`);
      throw new InternalServerErrorException('文件删除失败');
    }
  }
}