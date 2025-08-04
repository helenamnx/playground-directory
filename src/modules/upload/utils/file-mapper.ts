import { Request } from "express";

interface FileMapper {
  file: Express.Multer.File;
  req: Request;
}

interface FilesMapper {
  files: Express.Multer.File[];
  req: Request;
}

export const fileMapper = ({ file, req }: FileMapper) => {
  const image_url = `${req.protocol}://${req.headers.host}/${file.path}`;
  return {
    originalname: file.originalname,
    filename: file.filename,
    image_url,
  };
};

export const filesMapper = ({ files, req }: FilesMapper) => {
  return files.map(file => {
    // Remove the /assets prefix from the path
    const modifiedPath = file.path.replace("assets/", "");
    const image_url = `${req.protocol}://${req.headers.host}/assets/${modifiedPath}`;
    return {
      originalname: file.originalname,
      filename: file.filename,
      image_url,
    };
  });
};
