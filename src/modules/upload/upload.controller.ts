import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, Query, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  
  constructor(private readonly uploadService: UploadService) {}

  // 单个文件上传
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
  ) {
    try {
      this.logger.log(`收到单个文件上传请求 - 类型参数: ${type}`);
      
      // 验证上传类型参数
      if (!type || typeof type !== 'string') {
        this.logger.warn('单个文件上传 - 未指定有效的上传类型');
        throw new BadRequestException('上传类型参数(type)不能为空');
      }

      // 验证文件是否存在
      if (!file) {
        this.logger.warn('单个文件上传 - 未收到文件');
        throw new BadRequestException('请选择要上传的文件');
      }

      this.logger.log(`开始处理单个文件 - 文件名: ${file.originalname}, 大小: ${file.size} 字节`);
      // 保存文件
      const fileUrl = await this.uploadService.saveFile(file, type);
      
      this.logger.log(`单个文件上传API处理完成 - 返回URL: ${fileUrl}`);
      return {
        url: fileUrl,
        filename: file.originalname,
        size: file.size,
        type: type,
      };
    } catch (error) {
      this.logger.error(`单个文件上传API失败 - 错误: ${error.message}`);
      throw error;
    }
  }

  // 多文件上传
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') uploadType: string,
  ) {
    try {
      this.logger.log(`收到多文件上传请求 - 类型参数: ${uploadType}`);
      
      // 验证上传类型参数
      if (!uploadType || typeof uploadType !== 'string') {
        this.logger.warn('多文件上传 - 未指定有效的上传类型');
        throw new BadRequestException('上传类型参数(type)不能为空');
      }

      // 验证文件是否存在
      if (!files || files.length === 0) {
        this.logger.warn('多文件上传 - 未收到文件');
        throw new BadRequestException('请选择要上传的文件');
      }

      this.logger.log(`开始处理多文件上传 - 文件数量: ${files.length}`);
      // 记录文件名列表
      const fileNames = files.map(f => f.originalname).join(', ');
      this.logger.log(`多文件上传 - 文件名列表: ${fileNames}`);
      
      // 保存文件
      const fileUrls = await this.uploadService.saveFiles(files, uploadType);
      
      this.logger.log(`多文件上传API处理完成 - 成功上传数量: ${fileUrls.length}`);
      return {
        urls: fileUrls,
        count: files.length,
        type: uploadType,
      };
    } catch (error) {
      this.logger.error(`多文件上传API失败 - 错误: ${error.message}`);
      throw error;
    }
  }
}