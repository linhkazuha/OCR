// import util from "util";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'upload');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // console.log(file.originalname);
        const uniqueFileName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFileName);
    },
});

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).array("files");

// let uploadFileMiddleware = util.promisify(uploadFile);

// export default uploadFileMiddleware;

export default uploadFile;
