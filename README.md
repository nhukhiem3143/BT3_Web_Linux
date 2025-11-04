# 🌐 BÀI TẬP 3 - PHÁT TRIỂN ỨNG DỤNG TRÊN NỀN WEB  
**Giảng viên:** Đỗ Duy Cốp  
**Lớp học phần:** 58KTP  
**Sinh viên thực hiện:** Nguyễn Như Khiêm  
**Chủ đề:** Lập trình ứng dụng web thương mại điện tử trên nền Linux (Docker + Hyper-V + Ubuntu)

---

# 🧩 1. GIỚI THIỆU CHUNG
Bài tập yêu cầu xây dựng **một ứng dụng web thương mại điện tử** dạng **Single Page Application (SPA)**, triển khai trên **Linux (Ubuntu)** chạy trong **Hyper-V**.  
Sử dụng **Docker Compose** để quản lý các container:
- `mariadb` – cơ sở dữ liệu lưu user, sản phẩm, đơn hàng
- `phpmyadmin` – giao diện quản trị DB
- `nodered` – backend xử lý request, trả JSON
- `grafana` – hiển thị thống kê sản phẩm bán chạy
- `influxdb` – lưu lịch sử thống kê (nếu cần)
- `nginx` – web server reverse proxy

---

# ⚙️ 2. CẤU TRÚC DỰ ÁN

```
/home/khiem/web-ecommerce/  
│
├── docker-compose.yml             # File chính khai báo toàn bộ container
│
├── nginx/
│   ├── default.conf               # File cấu hình nginx (reverse proxy, domain)
│   └── certs/                     # Nếu sau này thêm SSL
│
├── node-red/
│   ├── data/                      # Lưu flow.json, settings.js, node_modules...
│
├── mariadb/
│   ├── data/                      # Lưu database của MariaDB
│
├── influxdb/
│   ├── data/                      # Dữ liệu time-series cho Grafana
│
├── grafana/
│   ├── data/                      # Lưu config, dashboards, users...
│
├── phpmyadmin/                    # (tuỳ chọn, không cần data riêng)
│
└── web/
    ├── index.html                 # Single Page Application chính
    ├── js/
    │   ├── app.js                 # Logic xử lý giao diện + gọi API nodered
    │   ├── login.js               # Xử lý đăng nhập
    │   └── cart.js                # Giỏ hàng, đặt hàng
    ├── css/
    │   └── style.css
    └── assets/
        └── images/  
```

---

# 🧱 3. CÀI ĐẶT MÔI TRƯỜNG

## Bước 1️⃣: Kích hoạt Hyper-V
1. Mở **Control Panel → Programs → Turn Windows features on or off**  
2. Tích chọn:  
   - `Hyper-V`
   - `Virtual Machine Platform`
   - `Windows Subsystem for Linux`
3. Nhấn OK → khởi động lại máy.
<img width="622" height="515" alt="image" src="https://github.com/user-attachments/assets/de625e7a-21bd-4c18-837e-f4c25437c45a" />

---

## Bước 2️⃣: Cài đặt Ubuntu trong Hyper-V
1. Mở Hyper-V Manager (tìm trong Start Menu).  
2. Nhấp phải vào tên máy bạn > New > Virtual Machine.  
+ Name: Đặt tên như "Ubuntu-Web".
+ Generation: Chọn Generation 1 (tương thích tốt với ISO).
+ Memory: 4GB (hoặc hơn nếu máy mạnh).
+ Network: Chọn Default Switch (để VM có IP riêng).
+ Virtual Hard Disk: Tạo mới, 12GB.
+ Installation Options: Chọn "Install an operating system from a bootable CD/DVD-ROM" > Image file (.iso) > Chọn file ISO Ubuntu đã tải.

<img width="883" height="666" alt="image" src="https://github.com/user-attachments/assets/0a06c257-f43d-451f-8ec2-4b85a6ca0757" />  
 
3. Hoàn tất wizard, nhấp phải VM > Connect > Start.
<img width="813" height="609" alt="image" src="https://github.com/user-attachments/assets/bdad9dcc-2619-4448-b571-0b58dd652809" /> 

4. Trong cửa sổ VM, cài Ubuntu:
+ Chọn ngôn ngữ tiếng Anh, kết nối WiFi nếu cần.
+ Tạo user/password
<img width="1283" height="595" alt="Screenshot 2025-11-01 002614" src="https://github.com/user-attachments/assets/6174e99b-88b0-45d0-b747-988850b080aa" />

5. Sau khi cài xong ,đăng nhập Unbuntu
<img width="1032" height="626" alt="image" src="https://github.com/user-attachments/assets/73946c0d-237b-458d-bb3d-bb82368a5447" />

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

## Bước 3️⃣: Cài đặt Docker và Docker Compose
### 1. Cập nhật hệ thống
```
sudo apt update && sudo apt upgrade -y
```
### 2. Cài gói cần thiết
```
sudo apt install ca-certificates curl gnupg lsb-release -y
```

### 3. Thêm key GPG của Docker
```
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

### 4. Thêm repo Docker
```
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
<img width="970" height="255" alt="Screenshot 2025-11-01 212612" src="https://github.com/user-attachments/assets/9e3cb5af-7c37-4e3a-8477-ff3f691db820" />

### 5. Cài Docker Engine
```
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```  
<img width="973" height="218" alt="image" src="https://github.com/user-attachments/assets/2ae3db7f-f845-4ac4-8fab-edf4f8048867" />

### 6. Kiểm tra
```
sudo docker --version
sudo docker run hello-world
```
<img width="757" height="438" alt="image" src="https://github.com/user-attachments/assets/68905e0b-3750-4052-b6c8-cd4902268dbd" />  

### 7. (Tuỳ chọn) Cho phép user hiện tại dùng docker không cần sudo
```
sudo usermod -aG docker $USER
newgrp docker
```
<img width="586" height="72" alt="image" src="https://github.com/user-attachments/assets/0974ee34-08d2-49c2-9037-f9a3b8e4b3dd" />  

## 🐋 4. CẤU HÌNH DOCKER-COMPOSE
### Tạo file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:10.11
    container_name: mariadb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: BanHang
      MYSQL_USER: khiem
      MYSQL_PASSWORD: khiem123
    ports:
      - "3306:3306"
    volumes:
      - ./mariadb/data:/var/lib/mysql
    networks:
      - ecommerce-network

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: phpmyadmin
    restart: always
    environment:
      PMA_HOST: mariadb
      PMA_PORT: 3306
      MYSQL_ROOT_PASSWORD: root123
    ports:
      - "8080:80"
    depends_on:
      - mariadb
    networks:
      - ecommerce-network

  nodered:
    image: nodered/node-red:latest
    container_name: nodered
    restart: always
    environment:
      - TZ=Asia/Ho_Chi_Minh
    ports:
      - "1880:1880"
    volumes:
      - ./node-red/data:/data
    user: "1000:1000"
    depends_on:
      - mariadb
      - influxdb
    networks:
      - ecommerce-network
    command: >
      sh -c "
      npm install -g node-red-node-mysql &&
      node-red
      --httpNodeRoot=/api
      --httpAdminRoot=/nodered
      --functionGlobalContext.mysql=require('mysql').createPool({host:'mariadb',user:'khiem',password:'khiem123',database:'BanHang',port:3306,charset:'utf8mb4',connectionLimit:10})
      --functionGlobalContext.crypto=require('crypto')
      "

  influxdb:
    image: influxdb:2.7
    container_name: influxdb
    restart: always
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=admin123
      - DOCKER_INFLUXDB_INIT_ORG=ecommerce
      - DOCKER_INFLUXDB_INIT_BUCKET=statistics
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-auth-token
    ports:
      - "8086:8086"
    volumes:
      - ./influxdb/data:/var/lib/influxdb2
    networks:
      - ecommerce-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    environment:
      - GF_SERVER_HTTP_PORT=3000
      - GF_SERVER_ROOT_URL=http://nguyennhukhiem.com/grafana
      - GF_SERVER_SERVE_FROM_SUB_PATH=true
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/data:/var/lib/grafana
    depends_on:
      - influxdb
    networks:
      - ecommerce-network

  nginx:
    image: nginx:latest
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./web:/usr/share/nginx/html:ro
    depends_on:
      - nodered
      - grafana
    networks:
      - ecommerce-network

networks:
  ecommerce-network:
    driver: bridge
```

### Chạy toàn bộ container
```
docker compose up -d
```
<img width="801" height="323" alt="image" src="https://github.com/user-attachments/assets/417edba2-6cd4-4b9e-96c1-e5dcc2433980" />

---

## 🌍 5. CẤU HÌNH NGINX
### File `nginx/default.conf`:

```nginx
server {
    listen 80;
    server_name nguyennhukhiem.com www.nguyennhukhiem.com;

    # === Gốc: SPA Frontend ===
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # === API Backend (Node-RED) ===
    location /api/ {
        proxy_pass http://nodered:1880/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

        # === API User Orders (Node-RED) ===
    location /user/ {
        proxy_pass http://nodered:1880/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # === Node-RED UI (Subpath) ===
    location ^~ /nodered/ {
        proxy_pass http://nodered:1880/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Fix tài nguyên tĩnh (CSS/JS) cho subpath
        sub_filter_once off;
        sub_filter 'href="/'  'href="/nodered/';
        sub_filter 'src="/'   'src="/nodered/';
        sub_filter 'action="/' 'action="/nodered/';
        sub_filter_types text/css text/javascript text/xml application/javascript;
        proxy_set_header Accept-Encoding "";
    }

    # === Grafana (Subpath) ===
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Fix redirects từ Grafana
        proxy_redirect http://grafana:3000/ /grafana/;
        proxy_redirect / /grafana/;
        
        # CHỈ thay thế trong HTML (KHÔNG làm hỏng JS/CSS)
        sub_filter_once off;
        sub_filter_types text/html;
        sub_filter 'href="/' 'href="/grafana/';
        sub_filter 'src="/' 'src="/grafana/';
        sub_filter 'href="public/' 'href="/grafana/public/';
        sub_filter 'src="public/' 'src="/grafana/public/';
        
        proxy_set_header Accept-Encoding "";
    }

    # === Bảo mật Header ===
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # === 404 Fallback cho SPA ===
    error_page 404 /index.html;
}
```


<img width="1875" height="968" alt="image" src="https://github.com/user-attachments/assets/7efd6ca8-1439-4f57-866d-b372a290098c" />  

<img width="1812" height="947" alt="image" src="https://github.com/user-attachments/assets/2925e2cb-3f04-4ad1-add2-62015b37e713" />  

---

**Website chính:** 👉 http://nguyennhukhiem.com  
**Node-RED:** 👉 http://nguyennhukhiem.com/nodered  
**Grafana:** 👉 http://nguyennhukhiem.com/grafana  

## 💻 6. FRONTEND (index.html + script.js)
```
web/
    ├── index.html                 #  Cấu trúc giao diện chính (SPA)
    ├── js/
    │   ├── app.js                 # Logic xử lý giao diện + gọi API nodered
    │   ├── login.js               # Xử lý đăng nhập
    │   └── cart.js                # Giỏ hàng, đặt hàng
    ├── css/
    │   └── style.css
    └── assets/
        └── images/                # Lưu ảnh sản phẩm
```
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

- `docker ps` hiển thị container đang chạy
- Giao diện web sản phẩm
- Biểu đồ Grafana thống kê đơn hàng

---

## 📚 10. KẾT LUẬN
Qua bài này, em đã:
- Tự cài đặt và cấu hình Docker trên Ubuntu (chạy trong Hyper-V)
- Sử dụng `docker-compose` quản lý nhiều dịch vụ
- Xây dựng web SPA đầy đủ frontend – backend – database – giám sát
- Hiểu rõ cách kết nối Nginx reverse proxy và Node-RED API

---
# The End
