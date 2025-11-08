# PawPal
Dự án thực hành kiến trúc hướng dịch vụ (SOA) — hệ thống quản lý sản phẩm và dịch vụ thú cưng.

## Mục đích của file này
Hướng dẫn nhanh cách cài đặt và chạy toàn bộ ứng dụng (client + server) trên Windows (PowerShell). README tập trung vào các bước cài đặt, chạy và một vài lưu ý/tự kiểm tra phổ biến.

## Yêu cầu trước
- Node.js (v16+ khuyến nghị) và npm
- MongoDB (chạy local hoặc URL kết nối có thể đặt qua biến môi trường)
- Mạng cục bộ cho các port mặc định (5173 cho client, 5000..5003 cho server microservices)

## Cấu trúc chính
- `client/` — React (Vite) front-end
- `server/` — Node.js gateway + nhiều workspace services

## Cài đặt dependencies
Mở PowerShell ở thư mục gốc của project (`PawPal`) và chạy lần lượt:

```powershell
# 1) Cài dependencies cho root, client và server workspaces
npm run install

# 2) Cài thêm ở client (nếu cần, npm install ở root có thể đã cài nhưng chạy riêng cho chắc)
cd .\client
npm install

# Quay về thư mục gốc
cd ..
```

Ghi chú: có một số script trong `package.json` gốc dùng `concurrently` để chạy nhiều lệnh đồng thời. Nếu bạn thích, có thể dùng script sẵn để chạy cả client + server (xem phần chạy bên dưới).

## Thiết lập biến môi trường (tuỳ chọn)
Server đọc biến môi trường từ `server/.env` (nếu có). Một số biến thường cần hoặc có thể muốn cấu hình:

- `JWT_SECRET` — secret cho JSON Web Token
- `BLOB_READ_WRITE_TOKEN` — (nếu dùng blob storage)
- `GATEWAY_PORT` — port cho gateway (mặc định: 5000)
- `INDENTITY_PORT`, `USER_PORT`, `SHOPPING_PORT` — port cho từng service (mặc định: 5001, 5002, 5003)
- `MONGO_INDENTITY_URI`, `MONGO_USER_URI`, `MONGO_SHOPPING_URI` — các connection string tới MongoDB (mặc định project dùng mongodb://localhost:27017/...)

Bạn có thể tạo file `server/.env` và đặt giá trị tương ứng. Nếu không có `.env`, các giá trị mặc định trong `server/configs/config.js` sẽ được sử dụng.

## Chạy ứng dụng
Bạn có 2 cách: (A) chạy cả client + server đồng thời từ root, hoặc (B) chạy riêng từng phần để debug.

1) Chạy cả hai (script có sẵn)

```powershell
# Ở thư mục gốc
npm run web
```

Script `web` (định nghĩa trong `package.json` gốc) dùng `concurrently` để:
- chạy `cd server && npm run start:all` (bật gateway + tất cả services)
- chạy `cd client && npm run dev` (bật Vite dev server)

2) Chạy riêng từng phần (tốt để debug)

Server (microservices) — mở một terminal mới cho server:

```powershell
cd .\server
npm run start:all
```

Client (React / Vite) — mở terminal khác:

```powershell
cd .\client
npm run dev
```

Sau khi cả hai chạy, front-end thường sẽ chạy ở `http://localhost:5173` (theo cấu hình Vite). Gateway mặc định lắng nghe `http://localhost:5000`.

## Kiểm tra nhanh / Troubleshooting
- Nếu front-end không kết nối được tới API: kiểm tra gateway và các microservices có đang chạy không.
- Nếu MongoDB không kết nối: kiểm tra service MongoDB đã khởi động và `MONGO_*_URI` trong `.env` nếu bạn dùng URI tuỳ chỉnh.
- Port conflict: thay đổi biến môi trường (`GATEWAY_PORT`, `INDENTITY_PORT`, `USER_PORT`, `SHOPPING_PORT`) trong `server/.env`.
- Nếu thấy lỗi thiếu package khi chạy `npm run web`, chạy thủ công `npm install` trong từng thư mục (`.` , `client`, `server`) rồi thử lại.

## Useful scripts (tóm tắt)
- `npm install` — cài dependencies cho root (với workspaces sẽ cài các workspace packages)
- `npm run web` — chạy client + server đồng thời (script gốc dùng `concurrently`)
- `cd client && npm run dev` — chạy Vite dev server
- `cd server && npm run start:all` — chạy gateway và các service (script `start:all` trong `server/package.json`)

