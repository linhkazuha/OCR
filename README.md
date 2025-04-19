# OCR
### Chạy dự án ###
- chạy backend: di chuyển vào .../backend/src , chạy `node server.js`
- chạy frontend: di chuyển vào .../frontend, chạy `npm start`

### Run Tests ###
- Di chuyển vào folder backend
- `npm start` để khởi động server backend
- Mở terminal mới
- Trước khi chạy test xóa hết dữ liệu ở 2 file trong src/logs (mỗi khi chạy test nào thì xóa file csv của test đấy)
- `npm run loadTestWithQueues` hoặc `npm run loadTestWithoutQueue` để chạy bài test
- Điều chỉnh bài test ở trong thư mục src/tests
- Thời gian phản hồi req được hiển thị tại terminal, khi chạy xong đi kèm link visualize trên artillery
- Thời gian hoàn thành 1 ảnh -> pdf được lưu trong folder logs với tên của 2 test tương ứng
- Mở file csv trong excel tạo biểu đồ nếu muốn.

Chạy test xong có thể chưa in xong file logs nên chờ xíu, vào file csv kiểm tra xem còn in không
Thỉnh thoảng sẽ bị lỗi do mạng hoặc là bị chặn bởi open-google-translate do nhiều req quá, hoặc chỉ đơn giản là mạng thôi cái bị chặn kia không chắc lắm