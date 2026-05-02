# QUY TẮC FONT CHỮ

## Font chính: Be Vietnam Pro

- **Nhà cung cấp:** Google Fonts
- **Package:** `next/font/google`
- **Tên font:** `Be_Vietnam_Pro`
- **Biến CSS:** `--font-be-vietnam-pro`

## Cách sử dụng

```tsx
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Trong component
<html className={`${beVietnamPro.variable} h-full antialiased`}>
<body className="font-sans">...</body>
</html>
```

## Lưu ý

1. **LUÔN LUÔN sử dụng font Be Vietnam Pro** cho tất cả các trang và component trong dự án
2. Không sử dụng các font khác như Geist, Inter, Roboto...
3. Đặt biến CSS là `--font-be-vietnam-pro`
4. Sử dụng class `font-sans` trong body để áp dụng font
5. Cần các weight: 100, 200, 300, 400, 500, 600, 700, 800, 900

## Test font

Kiểm tra font hoạt động bằng cách xem các text trên trang web có hiển thị đúng font Be Vietnam Pro không.

---

# QUY TẮC PHÁT TRIỂN

## Server
- **LUÔN chạy trên localhost:3000**
- Nếu port 3000 đang bận → kill process trước khi start mới
- Kiểm tra: `netstat -ano | findstr :3000`
- Kill: `taskkill /F /PID <pid>`

## Authentication
- Chỉ dùng Gmail login (Google OAuth)
- Ko dùng Facebook
- Xem `AUTH.md` để biết cấu hình

## Database
- Xem `.env` để lấy DATABASE_URL
- Dùng Prisma để query: `app/lib/db.ts`

## Code Style
- Font: Be Vietnam Pro (ko dùng font khác)
- CSS: Tailwind CSS
- Ko tạo file mới nếu ko cần thiết