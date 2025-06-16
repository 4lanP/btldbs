-- 1. Thêm một khách hàng mới
INSERT INTO KhachHang (IdKhachHang, HoTen, SoDienThoai) VALUES
(21, 'Nguyen Van X', '0933445566');
-- 2. Thêm một sản phẩm mới
INSERT INTO SanPham (MaSanPham, TenSanPham, DonViTinh, SoLuong, GiaTienBan, GiaTienNhap) VALUES
(1021, 'Drone DJI Mini 3', 'Chiec', 10, 15000000.00, 12000000.00);
-- 3. Thêm một nhân viên mới
INSERT INTO NhanVien (IdNhanVien, Ten, ChucVu, NgayThangNamSinh, DiaChi, Luong, Tuoi) VALUES
(109, 'Nguyen Van Y', 'IT Support', '1996-08-01', '321 Kim Ma, Ha Noi', 9500000.00, 28);
-- 4. Thêm một hóa đơn mới và chi tiết hóa đơn (ví dụ)
INSERT INTO HoaDon (MaDon, Ngay, TongTien, IdKhachHang, IdNhanVien) VALUES
(21, '2023-07-01', 15000000.00, 1, 102);
INSERT INTO ChiTietHoaDon (MaDon, MaSanPham, SoLuong, DonGia) VALUES
(21, 1021, 1, 15000000.00);
-- 5. Thêm một nhà cung cấp mới
INSERT INTO NhaCungCap (IdNhaCungCap, TenCongTy, SoDienThoai, Email) VALUES
(206, 'Cong ty F', '0987654321', 'contact.f@example.com');
--
-- 1. Xóa một khách hàng
DELETE FROM KhachHang WHERE IdKhachHang = 21;
-- 2. Xóa một sản phẩm không còn kinh doanh
DELETE FROM SanPham WHERE MaSanPham = 1018; -- Xóa cáp sạc đa năng
-- 3. Xóa một hóa đơn (và các chi tiết hóa đơn liên quan do ON DELETE CASCADE)
DELETE FROM HoaDon WHERE MaDon = 21;
-- 4. Xóa một nhân viên (nếu không có ràng buộc khóa ngoại đang active)
DELETE FROM NhanVien WHERE IdNhanVien = 109;
-- 5. Xóa một nhà cung cấp (và các đơn nhập hàng liên quan do ON DELETE CASCADE)
DELETE FROM NhaCungCap WHERE IdNhaCungCap = 206;
--
-- 1. Cập nhật số điện thoại của một khách hàng
UPDATE KhachHang SET SoDienThoai = '0999888777' WHERE IdKhachHang = 1;
-- 2. Cập nhật chức vụ và lương của một nhân viên
UPDATE NhanVien SET ChucVu = 'Truong phong kinh doanh', Luong = 18000000.00 WHERE IdNhanVien = 102;
-- 3. Cập nhật số lượng tồn kho của một sản phẩm
UPDATE SanPham SET SoLuong = 30 WHERE MaSanPham = 1001;
-- 4. Cập nhật tổng tiền của một hóa đơn (ví dụ sau khi điều chỉnh chi tiết)
UPDATE HoaDon SET TongTien = 25500000.00 WHERE MaDon = 1;
-- 5. Cập nhật email của một nhà cung cấp
UPDATE NhaCungCap SET Email = 'new.contact.a@example.com' WHERE IdNhaCungCap = 201;
--
-- 1. Lấy thông tin chi tiết các sản phẩm đã bán trong mỗi hóa đơn, kèm tên khách hàng và tên nhân viên xử lý
SELECT
    hd.MaDon,
    kh.HoTen AS TenKhachHang,
    nv.Ten AS TenNhanVien,
    sp.TenSanPham,
    cthd.SoLuong,
    cthd.DonGia
FROM
    HoaDon hd
JOIN
    KhachHang kh ON hd.IdKhachHang = kh.IdKhachHang
JOIN
    NhanVien nv ON hd.IdNhanVien = nv.IdNhanVien
JOIN
    ChiTietHoaDon cthd ON hd.MaDon = cthd.MaDon
JOIN
    SanPham sp ON cthd.MaSanPham = sp.MaSanPham;
-- 2.
SELECT
    kh.HoTen       AS KhachHang,
    hd.MaDon       AS SoHoaDon,
    ct.SoLuong     AS SoLuongMua,
    ct.DonGia      AS DonGiaBan,
    (ct.SoLuong * ct.DonGia) AS ThanhTien
FROM KhachHang kh
JOIN HoaDon hd
    ON kh.IdKhachHang = hd.IdKhachHang
JOIN ChiTietHoaDon ct
    ON hd.MaDon = ct.MaDon
ORDER BY hd.MaDon;

-- 3. Doanh thu của từng nhân viên theo từng sản phẩm đã bán, chỉ hiển thị những cặp nhân viên-sản phẩm có tổng doanh thu trên 10,000,000
SELECT
    nv.Ten AS TenNhanVien,
    sp.TenSanPham,
    SUM(cthd.SoLuong * cthd.DonGia) AS TongDoanhThu
FROM
    NhanVien nv
JOIN
    HoaDon hd ON nv.IdNhanVien = hd.IdNhanVien
JOIN
    ChiTietHoaDon cthd ON hd.MaDon = cthd.MaDon
JOIN
    SanPham sp ON cthd.MaSanPham = sp.MaSanPham
GROUP BY
    nv.Ten, sp.TenSanPham
HAVING
    SUM(cthd.SoLuong * cthd.DonGia) > 10000000
ORDER BY
    TongDoanhThu DESC;

-- 4. Liệt kê các sản phẩm đã được nhập từ nhà cung cấp 'Cong ty A' bởi nhân viên 'Nguyen Thi Minh', kèm theo số lượng nhập
SELECT
    sp.TenSanPham,
    ctnh.SoLuong AS SoLuongNhap,
    ncc.TenCongTy AS NhaCungCap,
    nv.Ten AS NhanVienNhap
FROM
    SanPham sp
JOIN
    ChiTietNhapHang ctnh ON sp.MaSanPham = ctnh.MaSanPham
JOIN
    DonNhapHang dnh ON ctnh.MaDon = dnh.MaDon
JOIN
    NhaCungCap ncc ON dnh.IdNhaCungCap = ncc.IdNhaCungCap
JOIN
    NhanVien nv ON dnh.IdNhanVien = nv.IdNhanVien
WHERE
    ncc.TenCongTy = 'Cong ty A' AND nv.Ten = 'Nguyen Thi Minh';

-- 5. Tổng giá trị hàng tồn kho của mỗi sản phẩm, được nhóm theo loại sản phẩm và chỉ hiển thị những loại có tổng giá trị tồn kho trên 50,000,000
SELECT
    sp.DonViTinh,
    SUM(sp.SoLuong * sp.GiaTienNhap) AS TongGiaTriTonKho
FROM
    SanPham sp
GROUP BY
    sp.DonViTinh
HAVING
    SUM(sp.SoLuong * sp.GiaTienNhap) > 50000000
ORDER BY
    TongGiaTriTonKho DESC;
