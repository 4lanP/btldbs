
-- INSERT dữ liệu vào bảng KhachHang
INSERT INTO KhachHang VALUES (1, 'Khach Hang 1', '0900654448');
INSERT INTO KhachHang VALUES (2, 'Khach Hang 2', '0900450791');
INSERT INTO KhachHang VALUES (3, 'Khach Hang 3', '0900651322');
INSERT INTO KhachHang VALUES (4, 'Khach Hang 4', '0900938135');
INSERT INTO KhachHang VALUES (5, 'Khach Hang 5', '0900824833');

-- INSERT dữ liệu vào bảng NhanVien
INSERT INTO NhanVien VALUES (1, 'Nhan Vien 1', 'Ban hang', '1991-01-01', 'Dia chi 1', 8100000, 31);
INSERT INTO NhanVien VALUES (2, 'Nhan Vien 2', 'Ban hang', '1992-01-01', 'Dia chi 2', 8200000, 32);
INSERT INTO NhanVien VALUES (3, 'Nhan Vien 3', 'Ban hang', '1992-12-31', 'Dia chi 3', 8300000, 33);

-- INSERT dữ liệu vào bảng SanPham
INSERT INTO SanPham VALUES (1, 'San Pham 1', 'Cai', 44, '2024-01-01', '2025-01-01', 55000);
INSERT INTO SanPham VALUES (2, 'San Pham 2', 'Cai', 15, '2024-01-01', '2025-01-01', 60000);
INSERT INTO SanPham VALUES (3, 'San Pham 3', 'Cai', 93, '2024-01-01', '2025-01-01', 65000);
INSERT INTO SanPham VALUES (4, 'San Pham 4', 'Cai', 43, '2024-01-01', '2025-01-01', 70000);
INSERT INTO SanPham VALUES (5, 'San Pham 5', 'Cai', 31, '2024-01-01', '2025-01-01', 75000);

-- INSERT dữ liệu vào bảng NhaCungCap
INSERT INTO NhaCungCap VALUES (1, 'NCC Cong Ty 1', '0988782212', 'ncc1@mail.com');
INSERT INTO NhaCungCap VALUES (2, 'NCC Cong Ty 2', '0988504721', 'ncc2@mail.com');
INSERT INTO NhaCungCap VALUES (3, 'NCC Cong Ty 3', '0988417202', 'ncc3@mail.com');

-- INSERT dữ liệu vào bảng HoaDon
INSERT INTO HoaDon VALUES (1, '2025-05-01', 0, 2, 1);
INSERT INTO HoaDon VALUES (2, '2025-05-02', 0, 3, 1);
INSERT INTO HoaDon VALUES (3, '2025-05-03', 0, 4, 1);
INSERT INTO HoaDon VALUES (4, '2025-05-04', 0, 5, 1);
INSERT INTO HoaDon VALUES (5, '2025-05-05', 0, 1, 1);

-- INSERT dữ liệu vào bảng ChiTietHoaDon
INSERT INTO ChiTietHoaDon VALUES (1, 3, 4, 65000);
INSERT INTO ChiTietHoaDon VALUES (2, 2, 4, 60000);
INSERT INTO ChiTietHoaDon VALUES (3, 2, 1, 60000);
INSERT INTO ChiTietHoaDon VALUES (4, 3, 4, 65000);
INSERT INTO ChiTietHoaDon VALUES (5, 4, 1, 70000);

-- INSERT dữ liệu vào bảng DonNhapHang
INSERT INTO DonNhapHang VALUES (1, '2025-04-01', 0, 2, 2);
INSERT INTO DonNhapHang VALUES (2, '2025-04-02', 0, 2, 3);
INSERT INTO DonNhapHang VALUES (3, '2025-04-03', 0, 2, 1);
INSERT INTO DonNhapHang VALUES (4, '2025-04-04', 0, 2, 2);
INSERT INTO DonNhapHang VALUES (5, '2025-04-05', 0, 2, 3);

-- INSERT dữ liệu vào bảng ChiTietNhapHang
INSERT INTO ChiTietNhapHang VALUES (1, 4, 12, 65000);
INSERT INTO ChiTietNhapHang VALUES (2, 3, 44, 60000);
INSERT INTO ChiTietNhapHang VALUES (3, 3, 23, 60000);
INSERT INTO ChiTietNhapHang VALUES (4, 5, 23, 70000);
INSERT INTO ChiTietNhapHang VALUES (5, 2, 13, 55000);
