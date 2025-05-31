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
    DiaChi VARCHAR(255),
    Luong DECIMAL(15,2) CHECK (Luong >= 0),
    Tuoi INT CHECK (Tuoi >= 18)
);

CREATE TABLE NhaCungCap (
    IdNhaCungCap INT PRIMARY KEY,
    TenCongTy VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE HoaDon (
    MaDon INT PRIMARY KEY,
    Ngay DATE,
    TongTien DECIMAL(15,2),
    IdKhachHang INT,
    IdNhanVien INT,
    FOREIGN KEY (IdKhachHang) REFERENCES KhachHang(IdKhachHang),
    FOREIGN KEY (IdNhanVien) REFERENCES NhanVien(IdNhanVien)
);

CREATE TABLE DonNhapHang (
    MaDon INT PRIMARY KEY,
    Ngay DATE,
    TongTien DECIMAL(15,2),
    IdNhanVien INT,
    IdNhaCungCap INT,
    FOREIGN KEY (IdNhanVien) REFERENCES NhanVien(IdNhanVien),
    FOREIGN KEY (IdNhaCungCap) REFERENCES NhaCungCap(IdNhaCungCap)
);

CREATE TABLE SanPham (
    MaSanPham INT PRIMARY KEY,
    TenSanPham VARCHAR(100),
    DonViTinh VARCHAR(50),
    SoLuong INT CHECK (SoLuong >= 0),
    NgaySanXuat DATE,
    HanSuDung DATE,
    GiaTien DECIMAL(15,2) CHECK (GiaTien >= 0)
);

CREATE TABLE ChiTietHoaDon (
    MaDon INT,
    MaSanPham INT,
    SoLuong INT CHECK (SoLuong >= 0),
    DonGia DECIMAL(15,2) CHECK (DonGia >= 0),
    PRIMARY KEY (MaDon, MaSanPham),
    FOREIGN KEY (MaDon) REFERENCES HoaDon(MaDon),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

CREATE TABLE ChiTietNhapHang (
    MaDon INT,
    MaSanPham INT,
    SoLuong INT CHECK (SoLuong >= 0),
    DonGia DECIMAL(15,2) CHECK (DonGia >= 0),
    PRIMARY KEY (MaDon, MaSanPham),
    FOREIGN KEY (MaDon) REFERENCES DonNhapHang(MaDon),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);
