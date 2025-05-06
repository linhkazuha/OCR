# CASE STUDY 2. Tối ưu hệ thống OCR
## Thành viên nhóm 15 ###
- Nguyễn Khánh Linh - 22021158
- Nguyễn Ngọc Linh - 22028078
- Đỗ Trọng Bình - 22021196

## Vấn đề trong hệ thống cũ
Hệ thống hiện tại gặp nhiều vấn đề ảnh hưởng đến tính sẵn sàng, khả năng mở rộng và trải nghiệm người dùng, như thời gian chờ khi sử dụng Tesseract và Google Translate API, thiếu cơ chế xử lý phân tán khiến hệ thống khó đáp ứng tải lớn, và giao diện chưa cung cấp thông báo lỗi rõ ràng. 

## Kiến trúc hệ thống mới
![alt](/images/flowchat_ocr.drawio.png)

## Chạy dự án
Chạy backend:
```bash
# dùng NodeJS
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
cd backend
node src/server.js
```
```bash
# dùng PM2
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
cd backend
npm install pm2 --D # cài đặt PM2
npx pm2 start ecosystem.config.cjs
npx pm2 logs # xem logs các tiến trình đang chạy
npx pm2 stop all # dừng các tiến trình đang chạy
npx pm2 delete all # xóa các tiến trình đang chạy
```

Chạy frontend:
```bash
cd frontend
npm start
```

## Kiểm thử
```bash
cd backend
node src/server.js # nếu chạy bằng NodeJS
npx pm2 start ecosystem.config.cjs # nếu chạy bằng PM2

# mở terminal mới, trước khi chạy xóa hết dữ liệu ở 2 file trong src/logs
npm run loadTestWithoutQueue # chạy không queue
npm run loadTestWithQueues # chạy với queue
```

- Điều chỉnh đầu vào của testcase trong `src/tests`
- Thời gian phản hồi được hiển thị ở terminal, có kèm link visuallize được trên **Artillery**
- Thời gian xử lý 1 ảnh sang PDF được lưu trong folder logs với tên file tương ứng
- Mở file CSV trong Excel để tạo biểu đồ
## Kết quả thực nghiệm
### Môi trường kiểm thử
- Máy cục bộ có 6 nhân và 12 luồng
- Công cụ đo lường hiệu suất: Artillery
- Cấu hình:
    - Warm up phase (10s): Tăng tải từ 5 lên 10 yêu cầu/giây.
    - Ramp up load (20s): Tăng tải từ 10 lên 25 yêu cầu/giây.
    - Spike phase (10s): Tăng tải đột biến từ 25 lên 50 yêu cầu/giây.
- Tổng số yêu cầu (virtual users created): 800 yêu cầu
- Mỗi yêu cầu (tương ứng với số vusers) gửi 3 file ảnh (dạng multipart/form-data)
    

### Case 1: Hệ thống ban đầu
***
**Đặc điểm**: các thành phần `OCR` nhận diện văn bản, `Translate` dịch văn bản và `PDF` tạo định dạng PDF được gộp chung thành một tác vụ xử lý.

*Bảng 1: Kết quả xử lý phía Server (App Logs) - Không Queue*

| Chỉ số (App Logs) | Giá trị |
|:-----------------|--------:|
| Số lượng xử lý thành công | **662** |
| Tỷ lệ xử lý thành công thực tế | **82.75%** |
| **Thời gian xử lý file** `processing_time` | |
| Tối thiểu (min) | 1105 ms |
| Tối đa (max) | 131,056 ms |
| Trung bình (mean) | 71,358.2 ms |
| Trung vị (median) | 75,265 ms |
| Phân vị 95 (p95) | 115,426.9 ms |
| Phân vị 99 (p99) | 123,454.1 ms |

<!-- ![alt](/images/case1result.png) -->

**Nhận xét**: Kiến trúc hiện tại không phù hợp khi xử lý tải cao và tác vụ có độ trễ lớn như OCR, dẫn đến tình trạng nghẽn tài nguyên, thời gian phản hồi lâu, và tỷ lệ lỗi cao (98%) do timeout hoặc từ chối kết nối (lỗi ETIMEOUT 646 requests và ECONNEREFUSED 138 requests), gây ra trải nghiệm người dùng rất kém và hệ thống thiếu ổn định.


### Case 2: Hệ thống sử dụng Queue với Worker đơn lẻ
***
**Đặc điểm**: sử dụng 1 hàng đợi và các thành phần xử lý chia thành các bộ lọc riêng biệt, mỗi bộ lọc được xử lý bởi 1 worker độc lập

*Bảng 2: Kết quả xử lý phía Server (App Logs) - Queue (1 Worker)*
| Chỉ số (App Logs) | Giá trị |
|:-----------------|--------:|
| Số lượng xử lý thành công | **533** |
| Tỷ lệ xử lý thành công thực tế | **66.625%** |
| **Thời gian xử lý file** `processing_time` | |
| Tối thiểu (min) | 2466 ms |
| Tối đa (max) | 127,927 ms |
| Trung bình (mean) | 68,062.96 ms |
| Trung vị (median) | 61,331 ms |
| Phân vị 95 (p95) | 116,946.3 ms |
| Phân vị 99 (p99) | 122,308.2 ms |

<!-- ![alt](/images/case2result.png) -->

**Nhận xét**: Việc sử dụng Queue giúp API endpoint phản hồi nhanh hơn, nhưng lại chuyển điểm nghẽn sang worker phía sau do chỉ có một worker xử lý tại mỗi bộ lọc. Khi tải tăng cao, worker bị quá tải dẫn đến tỷ lệ lỗi request vẫn cao (80.875%) (358 requests ETIMEOUT và 289 requests ECONNREFUSED ) và số file xử lý thành công bởi backend còn thấp hơn cả khi không dùng Queue (66.625%), cho thấy kiến trúc này chưa giải quyết hiệu quả vấn đề tải lớn.


### Case 3: Hệ thống sử dụng Queue với nhiều Worker (quản lý bằng PM2)
***
**Đặc điểm**: tương tự như case 2 nhưng mỗi bộ lọc  được triển khai với nhiều tiến trình worker song song, cụ thể là 5 OCR workers, 2 Translate workers và 2 PDF workers, được quản lý bởi PM2 (Process Manager 2)

*Bảng 3: Kết quả xử lý phía Server (App Logs) - Queue (Nhiều Worker)*
| Chỉ số (App Logs) | Giá trị |
|:-----------------|--------:|
| Số lượng xử lý thành công | **800** |
| Tỷ lệ xử lý thành công thực tế | **100%** |
| **Thời gian xử lý file** `processing_time` | |
| Tối thiểu (min) | 1180 ms |
| Tối đa (max) | 146,878 ms |
| Trung bình (mean) | 68,550.07 ms |
| Trung vị (median) | 66,055.5 ms |
| Phân vị 95 (p95) | 140,044.4 ms |
| Phân vị 99 (p99) | 146,062 ms |

<!-- ![alt](/images/case3result.png) -->

**Nhận xét**: Việc kết hợp Queue với nhiều worker song song mang lại hiệu quả rõ rệt: hệ thống xử lý ổn định, không ghi nhận lỗi nào từ phía client và hoàn thành toàn bộ 2400 file. Nhờ khả năng xử lý song song, các message không bị tồn đọng, và thời gian xử lý trung bình tuy vẫn cao nhưng ổn định nhất trong ba trường hợp, cho thấy kiến trúc này đã loại bỏ điểm nghẽn và có thể mở rộng tốt khi cần.

## Tổng kết
*Bảng 4: So sánh hiệu năng giữa các kiến trúc*

| Kiến trúc | Tỷ lệ request lỗi (%) | Tỉ lệ xử lý (%) | T.gian xử lý TB (ms) |
|:----------|------------------:|----------------:|--------------------:|
| Không Queue | 98.0 | 82.75 | 71,358.2 |
| Queue (1 Worker) | 80.875 | 66.625 | 68,062.96 |
| Queue (Nhiều Worker) | 0.0 | 100.0 | 68,550.07 |

<!-- *Thời gian xử lý* -->
![alt](/images/linegraph)

Qua thực nghiệm, chúng em thấy rằng: hệ thống không dùng queue hoạt động kém dưới tải cao do dễ tắc nghẽn và lỗi nhiều; dùng queue giúp cải thiện bước tiếp nhận nhưng nếu chỉ có một worker thì vẫn quá tải khi queue đầy; giải pháp hiệu quả nhất là kết hợp queue với nhiều worker song song, giúp xử lý ổn định, chịu tải tốt và đạt hiệu suất tối ưu.

***
***

<!-- ### Chạy dự án ###
- chạy backend: di chuyển vào .../backend/src , chạy `node server.js` (chạy bình thường)
- chạy backend với pm2:<br> 
B1: Cài đặt pm2: `npm install pm2 --D`<br>
B2: Di chuyển vào /backend chạy `npx pm2 start ecosystem.config.cjs`<br>
Để xem logs các tiến trình chạy: `npx pm2 logs`<br>
Để dừng các tiến trình chạy: `npx pm2 stop all`<br>
Để xóa các tiến trình chạy: `npm pm2 delete all`<br>
- chạy frontend: di chuyển vào .../frontend, chạy `npm start` -->



<!-- ### Run Tests ### -->
<!-- - Di chuyển vào folder backend
- `npm start` để khởi động server backend
- Mở terminal mới
- Trước khi chạy test xóa hết dữ liệu ở 2 file trong src/logs (mỗi khi chạy test nào thì xóa file csv của test đấy)
- `npm run loadTestWithQueues` hoặc `npm run loadTestWithoutQueue` để chạy bài test
- Điều chỉnh bài test ở trong thư mục src/tests
- Thời gian phản hồi req được hiển thị tại terminal, khi chạy xong đi kèm link visualize trên artillery
- Thời gian hoàn thành 1 ảnh -> pdf được lưu trong folder logs với tên của 2 test tương ứng
- Mở file csv trong excel tạo biểu đồ nếu muốn. -->

<!-- Chạy test xong có thể chưa in xong file logs nên chờ xíu, vào file csv kiểm tra xem còn in không  
Thỉnh thoảng sẽ bị lỗi do mạng hoặc là bị chặn bởi open-google-translate do nhiều req quá, hoặc chỉ đơn giản là mạng thôi cái bị chặn kia không chắc lắm -->
