# 🌐 BÀI TẬP 3 - PHÁT TRIỂN ỨNG DỤNG TRÊN NỀN WEB  
**Giảng viên:** Đỗ Duy Cốp  
**Lớp học phần:** 58KTP  
**Sinh viên thực hiện:** Nguyễn Như Khiêm  
**Chủ đề:** Lập trình ứng dụng web thương mại điện tử trên nền Linux (Docker + Hyper-V + Ubuntu)

---

## 🧩 1. GIỚI THIỆU CHUNG
Bài tập yêu cầu xây dựng **một ứng dụng web thương mại điện tử** dạng **Single Page Application (SPA)**, triển khai trên **Linux (Ubuntu)** chạy trong **Hyper-V**.  
Sử dụng **Docker Compose** để quản lý các container:
- `mariadb` – cơ sở dữ liệu lưu user, sản phẩm, đơn hàng
- `phpmyadmin` – giao diện quản trị DB
- `nodered` – backend xử lý request, trả JSON
- `grafana` – hiển thị thống kê sản phẩm bán chạy
- `influxdb` – lưu lịch sử thống kê (nếu cần)
- `nginx` – web server reverse proxy

---

## ⚙️ 2. CẤU TRÚC DỰ ÁN

```
web-thuong-mai-dien-tu/
│
├── docker-compose.yml
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│
├── nodered/
│   └── flows.json
│
├── nginx/
│   └── default.conf
│
└── README.md
```

---

## 🧱 3. CÀI ĐẶT MÔI TRƯỜNG

### Bước 1️⃣: Kích hoạt Hyper-V
1. Mở **Control Panel → Programs → Turn Windows features on or off**  
2. Tích chọn:  
   - `Hyper-V`
   - `Virtual Machine Platform`
   - `Windows Subsystem for Linux`
3. Nhấn OK → khởi động lại máy.

---

### Bước 2️⃣: Cài đặt Ubuntu trong Hyper-V
1. Mở **Hyper-V Manager**
2. Chọn **New → Virtual Machine**
3. Cấu hình:
   - Name: `UbuntuServer`
   - Generation: `2`
   - RAM: `4096 MB`
   - Network: Default Switch
4. Gắn file ISO Ubuntu (đã tải từ ubuntu.com)
5. Khởi động VM → tiến hành cài đặt Ubuntu.

---

### Bước 3️⃣: Cài đặt Docker và Docker Compose
Trong Ubuntu (VM):
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Thêm repo Docker chính thức
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Kiểm tra Docker
sudo docker version
sudo docker compose version
```

---

## 🐋 4. CẤU HÌNH DOCKER-COMPOSE
Tạo file `docker-compose.yml`:

```yaml
version: "3.9"
services:
  mariadb:
    image: mariadb
    container_name: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: shopdb
      MYSQL_USER: admin
      MYSQL_PASSWORD: 1234
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mariadb
      MYSQL_ROOT_PASSWORD: root
    depends_on:
      - mariadb

  nodered:
    image: nodered/node-red
    ports:
      - "1880:1880"
    volumes:
      - ./nodered:/data

  influxdb:
    image: influxdb
    ports:
      - "8086:8086"
    volumes:
      - influx_data:/var/lib/influxdb

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - influxdb

  nginx:
    image: nginx
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - nodered
      - grafana

volumes:
  mariadb_data:
  influx_data:
```

---

## 🌍 5. CẤU HÌNH NGINX
File `nginx/default.conf`:

```nginx
server {
  listen 80;
  server_name nguyennhukhiem.com;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /nodered/ {
    proxy_pass http://nodered:1880/;
  }

  location /grafana/ {
    proxy_pass http://grafana:3000/;
  }
}
```

---

## 💻 6. FRONTEND (index.html + script.js)
- **index.html**: cấu trúc giao diện chính (SPA)
- **script.js**: gọi API từ Node-RED qua `fetch()`, nhận JSON và render UI
- **style.css**: định dạng bố cục

### Các chức năng:
- Login (mã hóa mật khẩu bằng SHA-256)
- Hiển thị danh sách sản phẩm bán chạy
- Thêm sản phẩm vào giỏ hàng
- Thanh toán, lưu đơn hàng vào MariaDB

### Trang Admin:
- Xem danh sách đơn hàng
- Thống kê doanh thu (iframe Grafana)

---

## ⚙️ 7. NODE-RED BACKEND
Các flow chính:
- `/api/login` – xác thực người dùng
- `/api/products` – lấy danh sách sản phẩm
- `/api/cart` – xử lý giỏ hàng
- `/api/order` – thêm đơn hàng
- `/api/admin/stats` – trả dữ liệu cho Grafana

Tất cả đều trả về JSON.

---

## 🚀 8. KHỞI CHẠY HỆ THỐNG
Trong thư mục dự án:

```bash
sudo docker compose up -d
```

### Truy cập:
- **Website**: http://nguyennhukhiem.com
- **phpMyAdmin**: http://localhost:8080
- **Node-RED**: http://nguyennhukhiem.com/nodered
- **Grafana**: http://nguyennhukhiem.com/grafana

---

## 📸 9. HÌNH ẢNH MINH HỌA
*(Thêm ảnh chụp thật khi chạy hệ thống)*  
Ví dụ:
- `docker ps` hiển thị container đang chạy
- Giao diện web sản phẩm
- Biểu đồ Grafana thống kê đơn hàng

---

## 📚 10. KẾT LUẬN
Qua bài này, tôi đã:
- Tự cài đặt và cấu hình Docker trên Ubuntu (chạy trong Hyper-V)
- Sử dụng `docker-compose` quản lý nhiều dịch vụ
- Xây dựng web SPA đầy đủ frontend – backend – database – giám sát
- Hiểu rõ cách kết nối Nginx reverse proxy và Node-RED API

---

## 🧾 THÔNG TIN REPO
**Tên repo GitHub**: `BT3_Web_Linux`

### Cấu trúc repo:
```
📦 web-thuong-mai-dien-tu-docker-linux
 ┣ 📂 frontend
 ┣ 📂 nodered
 ┣ 📂 nginx
 ┣ 📜 docker-compose.yml
 ┗ 📜 README.md
```

---

**📅 Ngày hoàn thành:** 05/11/2025  
**✍️ Sinh viên thực hiện:** Nguyễn Như Khiêm
