require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./src/server.js",
      env: {
        NODE_ENV: "production",
        RUN_WORKERS_SEPARATELY: "true",
        CloudAMQP_URL: process.env.CloudAMQP_URL,
        OCR_QUEUE_NAME: process.env.OCR_QUEUE_NAME,
        Translate_QUEUE_NAME: process.env.Translate_QUEUE_NAME,
        PDF_QUEUE_NAME: process.env.PDF_QUEUE_NAME,
        RESULT_QUEUE_NAME: process.env.RESULT_QUEUE_NAME,
      }
    },
    {
      name: "ocr-worker",
      script: "./src/scripts/run_ocr_workers.js",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        CloudAMQP_URL: process.env.CloudAMQP_URL,
        OCR_QUEUE_NAME: process.env.OCR_QUEUE_NAME,
        Translate_QUEUE_NAME: process.env.Translate_QUEUE_NAME,
      }
    },
    {
      name: "translate-worker",
      script: "./src/scripts/run_translate_workers.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        CloudAMQP_URL: process.env.CloudAMQP_URL,
        Translate_QUEUE_NAME: process.env.Translate_QUEUE_NAME,
        PDF_QUEUE_NAME: process.env.PDF_QUEUE_NAME,
      }
    },
    {
      name: "pdf-worker",
      script: "./src/scripts/run_pdf_workers.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        CloudAMQP_URL: process.env.CloudAMQP_URL,
        PDF_QUEUE_NAME: process.env.PDF_QUEUE_NAME,
        RESULT_QUEUE_NAME: process.env.RESULT_QUEUE_NAME,
      }
    }
  ]
};
