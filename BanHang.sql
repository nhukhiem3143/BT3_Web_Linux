-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mariadb:3306
-- Thời gian đã tạo: Th10 06, 2025 lúc 01:11 PM
-- Phiên bản máy phục vụ: 10.11.14-MariaDB-ubu2204
-- Phiên bản PHP: 8.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `BanHang`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ChiTietDonHang`
--

CREATE TABLE `ChiTietDonHang` (
  `id` int(11) NOT NULL,
  `don_hang_id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1,
  `gia_luc_mua` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `ChiTietDonHang`
--

INSERT INTO `ChiTietDonHang` (`id`, `don_hang_id`, `san_pham_id`, `so_luong`, `gia_luc_mua`) VALUES
(1, 1, 1, 1, 28990000.00),
(2, 1, 3, 1, 5990000.00),
(3, 8, 1, 1, 28990000.00),
(4, 8, 2, 1, 27990000.00),
(5, 8, 3, 1, 5990000.00),
(8, 11, 4, 9, 99000.00),
(9, 12, 3, 5, 5990000.00),
(10, 13, 2, 2, 27990000.00),
(11, 13, 1, 1, 28990000.00),
(12, 14, 2, 2, 27990000.00),
(13, 14, 3, 2, 5990000.00),
(14, 14, 1, 3, 28990000.00),
(15, 15, 2, 4, 27990000.00),
(16, 15, 4, 3, 99000.00),
(17, 15, 1, 2, 28990000.00),
(18, 16, 2, 1, 27990000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `DanhGia`
--

CREATE TABLE `DanhGia` (
  `id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `nguoi_dung_id` int(11) DEFAULT NULL,
  `so_sao` int(11) NOT NULL CHECK (`so_sao` between 1 and 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danh_gia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `DanhGia`
--

INSERT INTO `DanhGia` (`id`, `san_pham_id`, `nguoi_dung_id`, `so_sao`, `noi_dung`, `ngay_danh_gia`) VALUES
(1, 1, 2, 5, 'xịn thế', '2025-11-04 08:25:56'),
(2, 2, 2, 5, 'affffff', '2025-11-06 13:03:27'),
(3, 3, 1, 5, 'Nghe cực kỳ êm tai.', '2025-11-03 12:57:57'),
(4, 3, 2, 2, 'quá tệ', '2025-11-04 08:26:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `DonHang`
--

CREATE TABLE `DonHang` (
  `id` int(11) NOT NULL,
  `nguoi_dung_id` int(11) DEFAULT NULL,
  `tong_tien` decimal(12,2) NOT NULL,
  `trang_thai` enum('cho_xac_nhan','da_xac_nhan','dang_dong_goi','dang_giao','da_giao','da_huy') DEFAULT 'cho_xac_nhan',
  `ten_nguoi_nhan` varchar(100) NOT NULL,
  `dien_thoai_nguoi_nhan` varchar(15) NOT NULL,
  `dia_chi_giao` text NOT NULL,
  `ma_cod` varchar(50) DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `DonHang`
--

INSERT INTO `DonHang` (`id`, `nguoi_dung_id`, `tong_tien`, `trang_thai`, `ten_nguoi_nhan`, `dien_thoai_nguoi_nhan`, `dia_chi_giao`, `ma_cod`, `ghi_chu`, `ngay_tao`, `ngay_cap_nhat`) VALUES
(1, 2, 34980000.00, 'da_giao', 'KHIEM NHU', '1234567891', '12\n12', NULL, NULL, '2025-11-03 14:40:22', '2025-11-03 19:28:49'),
(8, 2, 62970000.00, 'dang_giao', 'shgsrh', '0395167320', 'sfhgsh', '747477', NULL, '2025-11-04 08:05:24', '2025-11-04 08:06:45'),
(9, 2, 891000.00, 'cho_xac_nhan', 'ok', '0395167320', 'àagghh', NULL, NULL, '2025-11-05 11:07:14', '2025-11-05 11:07:14'),
(10, 2, 891000.00, 'cho_xac_nhan', 'ok', '0395167320', 'shghhj', NULL, NULL, '2025-11-05 11:07:48', '2025-11-05 11:07:48'),
(11, 2, 891000.00, 'cho_xac_nhan', 'ok', '0395167320', 'dhdj', NULL, NULL, '2025-11-05 11:10:17', '2025-11-05 11:10:17'),
(12, 2, 29950000.00, 'cho_xac_nhan', 'biill', '0564885485', 'dsgsh', NULL, NULL, '2025-11-05 11:16:24', '2025-11-05 11:16:24'),
(13, 2, 84970000.00, 'da_giao', 'gdshg', '0564885485', 'fafaf', 'elher', NULL, '2025-11-05 17:22:13', '2025-11-06 13:03:12'),
(14, 2, 154930000.00, 'dang_dong_goi', 'sgssg', '0564885485', 'gsgsgs', NULL, NULL, '2025-11-05 17:37:32', '2025-11-05 20:28:51'),
(15, 2, 170237000.00, 'da_giao', 'sdghsh', '0564885485', 'agg', NULL, NULL, '2025-11-05 17:45:20', '2025-11-05 20:15:42'),
(16, 2, 27990000.00, 'da_giao', 'âg', '0395167320', 'ag', NULL, NULL, '2025-11-06 12:56:27', '2025-11-06 13:03:04');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `NguoiDung`
--

CREATE TABLE `NguoiDung` (
  `id` int(11) NOT NULL,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(64) NOT NULL,
  `ho_ten` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dien_thoai` varchar(15) DEFAULT NULL,
  `la_admin` tinyint(4) DEFAULT 0,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `NguoiDung`
--

INSERT INTO `NguoiDung` (`id`, `ten_dang_nhap`, `mat_khau`, `ho_ten`, `email`, `dien_thoai`, `la_admin`, `ngay_tao`) VALUES
(1, 'admin', 'e14cb9e5c0eeee0ea313a4e04fbd10aa17ac17aa33a3cad4bdfe74b87ca18ef8', 'Nguyễn Như Khiêm', NULL, NULL, 1, '2025-11-02 14:59:23'),
(2, 'khiem', '8709f7292aa918e5e5f3197040a82fbd4364c594c01ef6b8c35988d3f99ccd1a', 'Khách VIP', 'khiem@example.com', '0909123456', 0, '2025-11-02 14:59:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `NhomSanPham`
--

CREATE TABLE `NhomSanPham` (
  `id` int(11) NOT NULL,
  `ten_nhom` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `anh` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `NhomSanPham`
--

INSERT INTO `NhomSanPham` (`id`, `ten_nhom`, `mo_ta`, `anh`, `ngay_tao`) VALUES
(1, 'Dien thoai', 'Smartphone chính hãng', 'assets/images/cat_phone.jpg', '2025-11-02 14:59:23'),
(2, 'Laptop', 'Máy tính xách tay', 'assets/images/cat_laptop.jpg', '2025-11-02 14:59:23'),
(3, 'Tai nghe', 'Tai nghe không dây', 'assets/images/cat_headphone.jpg', '2025-11-02 14:59:23'),
(4, 'Phu kien', 'Sạc, ốp lưng, cáp', 'assets/images/cat_accessory.jpg', '2025-11-02 14:59:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `SanPham`
--

CREATE TABLE `SanPham` (
  `id` int(11) NOT NULL,
  `ten_san_pham` varchar(200) NOT NULL,
  `nhom_id` int(11) DEFAULT NULL,
  `gia_ban` decimal(12,2) NOT NULL,
  `gia_cu` decimal(12,2) DEFAULT NULL,
  `ton_kho` int(11) DEFAULT 0,
  `mo_ta` text DEFAULT NULL,
  `anh` text NOT NULL,
  `la_ban_chay` tinyint(4) DEFAULT 0,
  `luot_xem` int(11) DEFAULT 0,
  `so_luot_mua` int(11) DEFAULT 0,
  `so_luot_danh_gia` int(11) DEFAULT 0,
  `diem_trung_binh` decimal(3,2) DEFAULT 0.00,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `SanPham`
--

INSERT INTO `SanPham` (`id`, `ten_san_pham`, `nhom_id`, `gia_ban`, `gia_cu`, `ton_kho`, `mo_ta`, `anh`, `la_ban_chay`, `luot_xem`, `so_luot_mua`, `so_luot_danh_gia`, `diem_trung_binh`, `ngay_tao`) VALUES
(1, 'iPhone 15 Pro', 1, 28990000.00, 31990000.00, 10, 'Chip A17 Pro, camera 48MP', 'assets/images/iphone15.jpg', 1, 10, 11, 1, 5.00, '2025-11-02 14:59:23'),
(2, 'MacBook Air M2', 2, 27990000.00, 29990000.00, 5, 'Chip M2, 8GB RAM', 'assets/images/macbook.jpg', 1, 2, 13, 1, 4.00, '2025-11-02 14:59:23'),
(3, 'AirPods Pro 2', 3, 5990000.00, 6490000.00, 20, 'Chống ồn chủ động', 'assets/images/airpods.jpg', 1, 0, 1, 1, 5.00, '2025-11-02 14:59:23'),
(4, 'Cáp sạc Type-C', 4, 99000.00, 149000.00, 100, 'Dài 1m, sạc nhanh 60W', 'assets/images/cap.jpg', 1, 20, 12, 0, NULL, '2025-11-02 14:59:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ThongKeBanHang`
--

CREATE TABLE `ThongKeBanHang` (
  `id` int(11) NOT NULL,
  `san_pham_id` int(11) DEFAULT NULL,
  `so_luong_ban` int(11) NOT NULL,
  `ngay_ban` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `ThongKeBanHang`
--

INSERT INTO `ThongKeBanHang` (`id`, `san_pham_id`, `so_luong_ban`, `ngay_ban`) VALUES
(1, 1, 1, '2025-11-03'),
(2, 3, 1, '2025-11-03');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `ChiTietDonHang`
--
ALTER TABLE `ChiTietDonHang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `don_hang_idx` (`don_hang_id`),
  ADD KEY `sp_idx` (`san_pham_id`);

--
-- Chỉ mục cho bảng `DanhGia`
--
ALTER TABLE `DanhGia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sp_idx` (`san_pham_id`),
  ADD KEY `user_idx` (`nguoi_dung_id`);

--
-- Chỉ mục cho bảng `DonHang`
--
ALTER TABLE `DonHang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nguoi_dung_id` (`nguoi_dung_id`);

--
-- Chỉ mục cho bảng `NguoiDung`
--
ALTER TABLE `NguoiDung`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`);

--
-- Chỉ mục cho bảng `NhomSanPham`
--
ALTER TABLE `NhomSanPham`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `SanPham`
--
ALTER TABLE `SanPham`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nhom_id` (`nhom_id`);

--
-- Chỉ mục cho bảng `ThongKeBanHang`
--
ALTER TABLE `ThongKeBanHang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `san_pham_id` (`san_pham_id`,`ngay_ban`),
  ADD UNIQUE KEY `unique_sp_date` (`san_pham_id`,`ngay_ban`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `ChiTietDonHang`
--
ALTER TABLE `ChiTietDonHang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `DanhGia`
--
ALTER TABLE `DanhGia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `DonHang`
--
ALTER TABLE `DonHang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `NguoiDung`
--
ALTER TABLE `NguoiDung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `NhomSanPham`
--
ALTER TABLE `NhomSanPham`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `SanPham`
--
ALTER TABLE `SanPham`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `ThongKeBanHang`
--
ALTER TABLE `ThongKeBanHang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `ChiTietDonHang`
--
ALTER TABLE `ChiTietDonHang`
  ADD CONSTRAINT `ChiTietDonHang_don_fk` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ChiTietDonHang_sp_fk` FOREIGN KEY (`san_pham_id`) REFERENCES `SanPham` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `DanhGia`
--
ALTER TABLE `DanhGia`
  ADD CONSTRAINT `DanhGia_sanpham_fk` FOREIGN KEY (`san_pham_id`) REFERENCES `SanPham` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `DanhGia_user_fk` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `NguoiDung` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `DonHang`
--
ALTER TABLE `DonHang`
  ADD CONSTRAINT `DonHang_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `NguoiDung` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `SanPham`
--
ALTER TABLE `SanPham`
  ADD CONSTRAINT `SanPham_ibfk_1` FOREIGN KEY (`nhom_id`) REFERENCES `NhomSanPham` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `ThongKeBanHang`
--
ALTER TABLE `ThongKeBanHang`
  ADD CONSTRAINT `ThongKeBanHang_ibfk_1` FOREIGN KEY (`san_pham_id`) REFERENCES `SanPham` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
