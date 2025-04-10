// import ocr from "./utils/ocr";
// const { createPDF } = require("./utils/pdf");
// const { translate } = require("./utils/translate");
import cors from "cors";
import express from 'express';
import routes from "./routes/index.js";
import { ocrWorker } from "./workers/worker.ocr.js";
import { translateWorker } from "./workers/worker.translate.js";
import { pdfWorker } from "./workers/worker.pdf.js";
import 'dotenv/config.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/file", routes());
app.get('/', (req, res) => {
    res.send('hehe');
});

ocrWorker();
translateWorker();
pdfWorker();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// (async () => {
//     try {
//         const text = await ocr.image2text("./data/sample.png");
//         console.log(text);
//         const viText = await translate(text);
//         console.log(viText);
//         const pdfFile = createPDF(viText);
//         console.log("This is PDF file: " + pdfFile)
//     } catch (e) {
//         console.log(e);
//     }
// })();
