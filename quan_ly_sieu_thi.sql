CREATE TABLE KhachHang (
    IdKhachHang INT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE NhanVien (
    IdNhanVien INT PRIMARY KEY,
    Ten VARCHAR(100) NOT NULL,
    ChucVu VARCHAR(50),
    NgayThangNamSinh DATE,
    DiaChi VARCHAR(255)
);

CREATE TABLE NhaCungCap (
    IdNhaCungCap INT PRIMARY KEY,
    TenCongTy VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE SanPham (
    MaSanPham INT PRIMARY KEY,
    TenSanPham VARCHAR(100) NOT NULL,
    DonViTinh VARCHAR(50),
    SoLuong INT CHECK (SoLuong >= 0) DEFAULT 0,
    GiaTienBan DECIMAL(15,2) CHECK (GiaTienBan >= 0) NOT NULL DEFAULT 0,
    GiaTienNhap DECIMAL(15,2) CHECK (GiaTienNhap >= 0) NOT NULL DEFAULT 0
);

CREATE TABLE HoaDon (
    MaDon INT PRIMARY KEY,
    Ngay DATE,
    TongTien DECIMAL(15,2),
    IdKhachHang INT,
    IdNhanVien INT,
    CONSTRAINT fk_hoadon_khachhang FOREIGN KEY (IdKhachHang)
        REFERENCES KhachHang(IdKhachHang) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_hoadon_nhanvien FOREIGN KEY (IdNhanVien)
        REFERENCES NhanVien(IdNhanVien)
);

CREATE TABLE DonNhapHang (
    MaDon INT PRIMARY KEY,
    Ngay DATE,
    TongTien DECIMAL(15,2),
    IdNhanVien INT,
    IdNhaCungCap INT,
    CONSTRAINT fk_donnhaphang_nhanvien FOREIGN KEY (IdNhanVien)
        REFERENCES NhanVien(IdNhanVien),
    CONSTRAINT fk_donnhaphang_nhacungcap FOREIGN KEY (IdNhaCungCap)
        REFERENCES NhaCungCap(IdNhaCungCap) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ChiTietHoaDon (
    MaDon INT,
    MaSanPham INT,
    SoLuong INT CHECK (SoLuong >= 0),
    DonGia DECIMAL(15,2) CHECK (DonGia >= 0),
    PRIMARY KEY (MaDon, MaSanPham),
    CONSTRAINT fk_chitiethoadon_hoadon FOREIGN KEY (MaDon)
        REFERENCES HoaDon(MaDon) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_chitiethoadon_sanpham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ChiTietNhapHang (
    MaDon INT,
    MaSanPham INT,
    SoLuong INT CHECK (SoLuong >= 0),
    DonGia DECIMAL(15,2) CHECK (DonGia >= 0),
    PRIMARY KEY (MaDon, MaSanPham),
    CONSTRAINT fk_chitietnhaphang_donnhaphang FOREIGN KEY (MaDon)
        REFERENCES DonNhapHang(MaDon) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_chitietnhaphang_sanpham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham) ON UPDATE CASCADE ON DELETE CASCADE
);
