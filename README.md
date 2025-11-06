# 🌐 BÀI TẬP 3 - PHÁT TRIỂN ỨNG DỤNG TRÊN NỀN WEB  
**Giảng viên:** Đỗ Duy Cốp  
**Lớp học phần:** 58KTP  
**Sinh viên thực hiện:** Nguyễn Như Khiêm  
**Chủ đề:** Lập trình ứng dụng web thương mại điện tử ( Web Bán Hàng Đồ Điện Tử ) trên nền Linux (Docker + Hyper-V + Ubuntu)

---

# 🧩 1. GIỚI THIỆU CHUNG
Bài tập yêu cầu xây dựng **một ứng dụng web thương mại điện tử** dạng **Single Page Application (SPA)**, triển khai trên **Linux (Ubuntu)** chạy trong **Hyper-V**.  
Sử dụng **Docker Compose** để quản lý các container:
- `mariadb` – cơ sở dữ liệu lưu user, sản phẩm, đơn hàng
- `phpmyadmin` – giao diện quản trị DB
- `nodered` – backend xử lý request, trả JSON
- `grafana` – hiển thị thống kê sản phẩm bán chạy
- `influxdb` – lưu lịch sử thống kê 
- `nginx` – web server reverse proxy

---

# ⚙️ 2. CẤU TRÚC DỰ ÁN

```
/home/khiem/web-ecommerce/  
│
├── docker-compose.yml             # File chính khai báo toàn bộ container
│
├── nginx/
│   └── default.conf               # File cấu hình nginx (reverse proxy, domain)
│  
│
├── node-red/
│   ├── data/                      # Lưu flow.json, settings.js, node_modules...
│
├── mariadb/
│   ├── data/                      # Lưu database của MariaDB
│
├── influxdb/
│   └── data/                      # Dữ liệu time-series cho Grafana
│
├── grafana/
│   ├── data/                      # Dashboards, users...
│   └── config/
        └── grafana.ini            # Lưu config,
├── phpmyadmin/                    
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
### 1. Tải Ubuntu Server
Download tại : https://ubuntu.com/download/server  
<img width="1856" height="960" alt="image" src="https://github.com/user-attachments/assets/23896676-066e-469b-9ece-07793f3fe2d0" />  

2. Mở Hyper-V Manager (tìm trong Start Menu).  
3. Nhấp phải vào tên máy bạn > New > Virtual Machine.  
+ Name: Đặt tên như "Ubuntu-Web".
+ Generation: Chọn Generation 1 (tương thích tốt với ISO).
+ Memory: 4GB (hoặc hơn nếu máy mạnh).
+ Network: Chọn Default Switch (để VM có IP riêng).
+ Virtual Hard Disk: Tạo mới, 12GB.
+ Installation Options: Chọn "Install an operating system from a bootable CD/DVD-ROM" > Image file (.iso) > Chọn file ISO Ubuntu đã tải.

<img width="883" height="666" alt="image" src="https://github.com/user-attachments/assets/0a06c257-f43d-451f-8ec2-4b85a6ca0757" />  
 
4. Hoàn tất wizard, nhấp phải VM > Connect > Start.
<img width="813" height="609" alt="image" src="https://github.com/user-attachments/assets/bdad9dcc-2619-4448-b571-0b58dd652809" /> 

5. Trong cửa sổ VM, cài Ubuntu:
+ Chọn ngôn ngữ tiếng Anh, kết nối WiFi nếu cần.
+ Tạo user/password
<img width="1283" height="595" alt="Screenshot 2025-11-01 002614" src="https://github.com/user-attachments/assets/6174e99b-88b0-45d0-b747-988850b080aa" />

6. Sau khi cài xong ,đăng nhập Unbuntu
<img width="1032" height="626" alt="image" src="https://github.com/user-attachments/assets/73946c0d-237b-458d-bb3d-bb82368a5447" />

7. Sau cài, cập nhật hệ thống ,chạy:

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
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=shMvV7JE1SoGIKww-Kv8DRf0K2P0-0OgGXIUjRaXkmPKL49lLL3-eYxwTIG93X2w61XeetNJC4j6YH7erZ6TtA==
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
        - ./grafana/config/grafana.ini:/etc/grafana/grafana.ini
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
 - Cấu hình nginx để chạy được website qua url http://nguyennhukhiem.com
 - Cấu hình nginx để http://nguyennhukhiem.com/nodered truy cập vào nodered qua cổng 80, (dù nodered đang chạy ở port 1880)
 - Cấu hình nginx để http://nguyennhukhiem.com/grafana truy cập vào grafana qua cổng 80, (dù grafana đang chạy ở port 3000)

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
    location ^~ /grafana/ {
        proxy_pass http://grafana:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
### Tạo file `grafana.ini`
Tạo trong /web-ecommerce/grafana/config  
<img width="1101" height="652" alt="image" src="https://github.com/user-attachments/assets/d736b0c8-b3f6-4c26-8ddf-a8d70b497f50" />

### Cấu hình IP tĩnh cho Ubuntu 
- Dùng lệnh `nano /etc/netplan/50-cloud-init.yaml`  . Đặt IP : 172.25.128.100

<img width="1143" height="664" alt="image" src="https://github.com/user-attachments/assets/eac11474-3eae-488f-9bcd-234012f102eb" />

- Trên máy thật mở cấu hình cài ip cho cùng đường mạng  
<img width="1076" height="717" alt="image" src="https://github.com/user-attachments/assets/55bac8c1-5ab8-48a2-8ee3-31f77babe810" />  

- Cấu hình hostname mở file `C:\Windows\System32\drivers\etc\hosts`  
<img width="482" height="99" alt="image" src="https://github.com/user-attachments/assets/7c21c19d-fa7e-402a-b6a4-034a9b7d02b1" />

### PhpMyAdmin chạy tại http://172.25.128.100:8080/
<img width="1878" height="1079" alt="image" src="https://github.com/user-attachments/assets/3884a9e6-5d08-4417-9d17-2b3b26c05ff2" />

### InfluxDB chạy tại http://172.25.128.100:8086/
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/2304b51c-48b9-46ef-812c-475933f5a370" />

### Website chính: 👉 http://nguyennhukhiem.com  
<img width="1883" height="1079" alt="image" src="https://github.com/user-attachments/assets/1d6a9039-4e03-4b93-ac95-d9961540cb21" />

### Node-RED: 👉 http://nguyennhukhiem.com/nodered  
Cấu hình file settings.js để nodered yêu cầu đăng nhập  

<img width="1101" height="652" alt="Screenshot 2025-11-06 193802" src="https://github.com/user-attachments/assets/fd5a3fe4-500c-438d-8b55-24f9fcf5c14d" />  

Sau đó chạy lại nodered  

<img width="1919" height="1054" alt="image" src="https://github.com/user-attachments/assets/f9900ecc-45f1-44a1-be73-7e674c0e6e30" />  

### Grafana: 👉 http://nguyennhukhiem.com/grafana  
<img width="1917" height="1079" alt="Screenshot 2025-11-06 193248" src="https://github.com/user-attachments/assets/c853e5de-d27d-43be-83cd-821693efa9fd" />

---

## 💻 6. FRONTEND (index.html + script.js)
```
web/
    ├── index.html                 #  Cấu trúc giao diện chính
    ├── js/
    │   ├── app.js                 # Logic xử lý giao diện
    │   ├── login.js               # Xử lý đăng nhập
    │   └── cart.js                # Giỏ hàng, đặt hàng
    ├── css/
    │   └── style.css
    └── assets/
        └── images/                # Lưu ảnh sản phẩm
```
### Các chức năng:
- Login (mã hóa mật khẩu bằng SHA-256)
- Có tính năng liệt kê các sản phẩm bán chạy ra trang chủ
- Có tính năng liệt kê các nhóm sản phẩm
- Có tính năng liệt kê sản phẩm theo nhóm
- Có tính năng tìm kiếm sản phẩm
- Có tính năng chọn sản phẩm (đưa sản phẩm vào giỏ hàng, thay đổi số lượng sản phẩm trong giỏ, cập nhật tổng tiền)
- Có tính năng đặt hàng, nhập thông tin giao hàng

### Trang Admin:
- Thống kê xem có bao nhiêu đơn hàng, call để xác nhận và cập nhật thông tin đơn hàng. chuyển cho bộ phận đóng gói, gửi bưu điện, cập nhật mã COD, tình trạng giao hàng, huỷ hàng,...
- Biểu đồ thống kê số lượng mặt hàng bán được trong từng ngày.
---

## ⚙️ 7. NODE-RED BACKEND
### Các flow chính:
### 1. Đăng Nhập : API `/login` – Xác thực người dùng   
curl -X POST http://nguyennhukhiem.com/api/login \
<img width="1484" height="268" alt="image" src="https://github.com/user-attachments/assets/9c201540-d722-48f3-b24a-ac80d8bbc2d5" />
<img width="1599" height="739" alt="image" src="https://github.com/user-attachments/assets/3dea9350-a3a0-4f69-87ab-3c35da4f21c4" />

### 1. Sản phẩm bán chạy 
curl http://nguyennhukhiem.com/api/san-pham-ban-chay
<img width="1020" height="148" alt="image" src="https://github.com/user-attachments/assets/11ddce68-5392-4aa6-9055-d4925b269386" />

### 2. Nhóm sản phẩm
curl http://nguyennhukhiem.com/api/nhom-san-pham
<img width="925" height="157" alt="image" src="https://github.com/user-attachments/assets/29828ee3-e84e-41fe-a731-3394c6f8eb1d" />

### 3. Sản phẩm theo nhóm (nhóm ID = 1)
curl http://nguyennhukhiem.com/api/san-pham?nhom=1
<img width="965" height="177" alt="image" src="https://github.com/user-attachments/assets/4934be24-29f3-4e81-938e-ce2241408c72" />

### 4. Tìm kiếm
curl http://nguyennhukhiem.com/api/tim-kiem?q=iphone
<img width="916" height="148" alt="image" src="https://github.com/user-attachments/assets/fc03dd67-a52b-4ca3-8f70-86f35ff65fb9" />

### 6. Đặt hàng (cần token)
curl -X POST http://nguyennhukhiem.com/api/dat-hang \
<img width="1693" height="324" alt="image" src="https://github.com/user-attachments/assets/c50a3e6d-89b5-4559-91dc-42e6cf0c6c34" />

### 7. Xem đơn hàng
curl -X GET http://nguyennhukhiem.com/api/don-hang/2
<img width="1462" height="287" alt="image" src="https://github.com/user-attachments/assets/6b672492-a72a-44d5-9443-c42a87ab80c3" />


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
