import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// Danh sách tỉnh/thành phố mặc định của Việt Nam
const DEFAULT_PROVINCES = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cần Thơ',
  'Cao Bằng',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP. Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      select: { province: { select: { name: true } } },
    });

    const dbProvinces = Array.from(
      new Set(
        locations
          .map((location) => location.province?.name?.trim())
          .filter((province): province is string => Boolean(province))
      )
    ).sort();

    // Kết hợp provinces từ database và danh sách mặc định
    const allProvinces = Array.from(new Set([...dbProvinces, ...DEFAULT_PROVINCES]));

    // Sắp xếp theo bảng chữ cái
    allProvinces.sort((a, b) => a.localeCompare(b, 'vi'));

    return NextResponse.json(allProvinces);
  } catch {
    // Trả về danh sách mặc định nếu có lỗi
    return NextResponse.json(DEFAULT_PROVINCES);
  }
}
