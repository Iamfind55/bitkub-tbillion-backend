import multer from 'multer';
import { RequestHandler, Request } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req: Request, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

export const fileUploadMiddleware: RequestHandler = upload.array('images');