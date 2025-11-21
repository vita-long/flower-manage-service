import { Controller, Post, UseInterceptors, UploadedFile, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImportService } from './import.service';

@Controller('products/import')
export class ImportController {
  private readonly logger = new Logger(ImportController.name);

  constructor(private readonly importService: ImportService) {}

  // 文件过滤器
  private fileFilter = (req: any, file: any, callback: any) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      callback(null, true);
    } else {
      callback(new HttpException('只支持 xlsx, xls, csv 格式的文件', HttpStatus.BAD_REQUEST), false);
    }
  };

  // 生成文件名
  private editFileName = (req: any, file: any, callback: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  };

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/product/imports',
        filename: (req, file, callback) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = extname(file.originalname);
          const randomName = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${name}-${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExtensions = ['.xls', '.xlsx', '.csv'];
        const fileExtName = extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(fileExtName)) {
          callback(null, true);
        } else {
          callback(new HttpException('不支持的文件类型，仅支持xls、xlsx、csv格式', HttpStatus.BAD_REQUEST), false);
        }
      },
    })
  )
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('请上传文件', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`接收到文件: ${file.originalname}, 类型: ${file.mimetype}, 大小: ${file.size} bytes`);

    try {
      const ext = extname(file.originalname).toLowerCase();
      let productData;

      // 根据文件类型选择解析方法
      if (ext === '.xlsx' || ext === '.xls') {
        productData = await this.importService.parseExcelFile(file.path);
      } else if (ext === '.csv') {
        productData = await this.importService.parseCsvFile(file.path);
      } else {
        throw new HttpException('不支持的文件格式', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`解析文件成功，共 ${productData.length} 条数据`);

      // 导入商品数据
      const result = await this.importService.importProducts(productData);

      this.logger.log(`导入完成: 成功 ${result.imported} 条，失败 ${result.failed} 条`);

      return {
        total: productData.length,
        imported: result.imported,
        failed: result.failed,
        errors: result.errors
      };
    } catch (error) {
      this.logger.error(`导入商品失败: ${error.message}`, error.stack);
      throw new HttpException(error.message || '导入商品失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}