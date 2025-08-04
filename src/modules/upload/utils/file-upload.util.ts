import { extname } from 'path';
import { Request } from 'express';
export const editFileName = (
  req: Request,
  file: Express.Multer.File,

  callback: any,
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: any,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};
