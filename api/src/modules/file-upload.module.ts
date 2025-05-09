import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { FilesService } from '../services/files.service'
import * as path from 'path'
import * as fs from 'fs'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = path.join(__dirname, '../../uploads/documents')
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
          }
          cb(null, uploadDir)
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const ext = path.extname(file.originalname)
          cb(null, file.fieldname + '-' + uniqueSuffix + ext)
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx']
        const ext = path.extname(file.originalname).toLowerCase()

        if (allowedTypes.includes(ext)) {
          cb(null, true)
        } else {
          cb(new Error('Неподдерживаемый формат файла!'), false)
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
