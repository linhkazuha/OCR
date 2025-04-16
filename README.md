# OCR
### Chạy dự án ###
- chạy backend:<br>
B1: `npm install` (nếu lỗi thì install riêng: npm install pm2 --D)<br>
B2: `npx pm2 start server.js --name api-server --env RUN_WORKERS_SEPARATELY=true` (chạy server)<br>
B3: `npx pm2 start run_ocr_workers.js --name ocr-worker -i 0` (chạy ocr workers = số core cpu)<br>
B4: `npx pm2 start run_translate_workers.js --name translate-worker -i 2` (chạy 2 translate workers)<br>
B5: `npx pm2 start run_pdf_workers.js --name pdf-worker -i 2` (chạy 2 pdf workers)<br>Để dừng lại tất cả: `npx pm2 stop all`<br> Để xóa tất cả: `npx pm2 delete all`<br>Để chạy lại: `npx pm2 retart all`<br>Nếu muốn thay đổi với 1 tiến trình chứ không phải toàn bộ thì với các lệnh phía trên chỉ cần thay `all` thành `<tên>` tiến trình<br>
- chạy frontend: di chuyển vào .../frontend, chạy `npm start`
