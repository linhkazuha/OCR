import express from "express";
import fileController from "../controller/file.controller.js";

const router = express.Router()

router.post('/upload', fileController.upload);
router.post('/upload-without-queue', fileController.upload_without_queue)
router.get('/download/:name', fileController.download);

export default () => router;