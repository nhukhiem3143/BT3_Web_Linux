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
<img width="622" height="515" alt="image" src="https://github.com/user-attachments/assets/de625e7a-21bd-4c18-837e-f4c25437c45a" />

---

### Bước 2️⃣: Cài đặt Ubuntu trong Hyper-V
1. Mở Hyper-V Manager (tìm trong Start Menu).
2. Nhấp phải vào tên máy bạn > New > Virtual Machine.
+ Name: Đặt tên như "Ubuntu-WebDev".
+ Generation: Chọn Generation 1 (tương thích tốt với ISO).
+ Memory: 4GB (hoặc hơn nếu máy mạnh).
+ Network: Chọn Default Switch (để VM có IP riêng).
+ Virtual Hard Disk: Tạo mới, 12GB.
+ Installation Options: Chọn "Install an operating system from a bootable CD/DVD-ROM" > Image file (.iso) > Chọn file ISO Ubuntu bạn tải.
<img width="877" height="661" alt="Screenshot 2025-11-01 001855" src="https://github.com/user-attachments/assets/d5136745-1773-439f-9998-4a77520ec637" />

3. Hoàn tất wizard, nhấp phải VM > Connect > Start.
<img width="802" height="592" alt="Screenshot 2025-11-01 001942" src="https://github.com/user-attachments/assets/a3521bb5-c814-4b6b-a6f3-8702cc56f36a" />

4. Trong cửa sổ VM, cài Ubuntu:
+ Chọn ngôn ngữ tiếng Anh, kết nối WiFi nếu cần.
+ Tạo user/password
<img width="1283" height="595" alt="Screenshot 2025-11-01 002614" src="https://github.com/user-attachments/assets/6174e99b-88b0-45d0-b747-988850b080aa" />
5. Sau khi cài xong ,đăng nhập Unbuntu
<img width="1252" height="927" alt="image" src="https://github.com/user-attachments/assets/62cb6ee4-1002-470e-a54c-5ce823c1b10b" />  



6. Sau cài, cập nhật hệ thống: Mở Terminal (Ctrl+Alt+T), chạy:

```
sudo apt update && sudo apt upgrade -y
```

<img width="734" height="283" alt="image" src="https://github.com/user-attachments/assets/8e1c3735-e261-4447-b1cf-d91eecb2004c" />

+ Thời gian: 5-10 phút. Nếu hỏi "Y/n", gõ "Y" và Enter.
+ Sau đó cài thêm tool cơ bản:

```
sudo apt install curl wget -y
```

6. Test: Chạy lsb_release -a để xác nhận Ubuntu chạy.
<img width="325" height="121" alt="image" src="https://github.com/user-attachments/assets/3bed5bfe-7ef7-44e6-90d4-e1827f2856f3" />


---

### Bước 3️⃣: Cài đặt Docker và Docker Compose
1. Cài Docker engine (script chính thức, nhanh nhất):
Trong Ubuntu (VM):
```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
``` 
<img width="1033" height="224" alt="image" src="https://github.com/user-attachments/assets/b5efea88-0f95-4a16-b46e-94b55d378c09" />    

2. Thêm user vào group docker (để chạy docker không cần sudo):  
```
textsudo usermod -aG docker $USER
```

Áp dụng thay đổi: Gõ exit để logout, rồi login lại (gõ username/password như trước). Hoặc reboot nhanh: sudo reboot.   
<img width="432" height="64" alt="image" src="https://github.com/user-attachments/assets/2a52d918-7160-45cc-91af-eec993bd318f" />  

4. Test không sudo:
```
textdocker run hello-world
```
Nếu thấy "Hello from Docker!", là thành công (không cần sudo nữa).  
<img width="692" height="394" alt="image" src="https://github.com/user-attachments/assets/0a6e89ab-0378-44b1-95b5-caee55a7671d" />

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
