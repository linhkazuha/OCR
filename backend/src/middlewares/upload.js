// import util from "util";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'upload');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    },
});

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

// let uploadFileMiddleware = util.promisify(uploadFile);

// export default uploadFileMiddleware;

export default uploadFile;
