# Migration Guide - PR #1: Schema Taxonomy System

## 🎯 Mục tiêu
Cập nhật database schema để hỗ trợ:
- Industries (10 ngành nghề)
- Regions (4 vùng miền)
- Provinces (63 tỉnh)
- Tags (nhãn cho bài viết)
- Relations mới cho Business và BlogPost

## 📋 Các bước thực hiện

### Bước 1: Backup Database (Tự động)
```bash
# Trước khi migrate, hệ thống sẽ tự động backup data cũ
# Tables backup: _BusinessBackup, _LocationBackup
```

### Bước 2: Chạy Migration
```bash
# 1. Generate migration
npx prisma migrate dev --name add_taxonomy_system

# 2. Nếu có lỗi conflict, xóa migration cũ và chạy lại:
# rm -rf prisma/migrations/[timestamp]_add_taxonomy_system
# npx prisma migrate dev --name add_taxonomy_system
```

### Bước 3: Seed Data
```bash
# Seed industries, regions, provinces, tags, categories
npx prisma db seed
```

### Bước 4: Migrate Data Cũ (Nếu có data)
```bash
# Chạy script chuyển đổi data cũ sang relations mới
npx ts-node scripts/migrate-data.ts
```

### Bước 5: Verify
```bash
# Kiểm tra data đã migrate đúng
npx prisma studio
# Hoặc truy cập: npx prisma studio
```

## 🔍 Kiểm tra sau Migration

### Trong Prisma Studio, kiểm tra:
1. **Industry**: Có 10 records
2. **Region**: Có 4 records (Miền Bắc, Trung, Nam, Biển & Đảo)
3. **Province**: Có 63+ records
4. **Tag**: Có 8+ records
5. **Category**: Có 6+ records
6. **Business**: Có industryId được gán
7. **Location**: Có provinceId được gán (nếu có data cũ)

## 🛡️ Rollback (Nếu cần)

### Cách 1: Rollback Migration
```bash
# Rollback 1 migration
cd prisma/migrations
npx prisma migrate resolve --rolled-back "[timestamp]_add_taxonomy_system"

# Hoặc reset về migration cũ
npx prisma migrate reset --force
```

### Cách 2: Restore từ Backup Tables
```sql
-- Trong database, chạy SQL:
-- Restore Business
UPDATE "Business" b
SET "industryId" = NULL
FROM "_BusinessBackup" backup
WHERE b.id = backup.id;

-- Restore Location  
UPDATE "Location" l
SET "provinceId" = NULL
FROM "_LocationBackup" backup
WHERE l.id = backup.id;
```

### Cách 3: Xóa Migration
```bash
# Xóa migration files
rm -rf prisma/migrations/[timestamp]_add_taxonomy_system

# Reset schema về state cũ (nếu cần)
git checkout HEAD -- prisma/schema.prisma

# Sau đó migrate lại
npx prisma migrate dev
```

## ⚠️ Lưu ý Quan trọng

1. **LUÔN backup database** trước khi chạy migration production
2. **Test trên local** trước khi deploy
3. Migration sẽ tạo backup tables tự động (`_BusinessBackup`, `_LocationBackup`)
4. Có thể rollback bất cứ lúc nào
5. Data mockup/cũ được giữ nguyên qua migration

## 🐛 Xử lý Lỗi Thường Gặp

### Lỗi: "Migration already exists"
```bash
# Xóa migration cũ và chạy lại
rm -rf prisma/migrations/[timestamp]_*
npx prisma migrate dev --name add_taxonomy_system
```

### Lỗi: "Data loss detected"
```bash
# Force migration (cẩn thận!)
npx prisma migrate dev --name add_taxonomy_system --create-only
# Sau đó sửa migration file rồi chạy lại
```

### Lỗi: "Foreign key constraint"
```bash
# Reset database (mất data!)
npx prisma migrate reset
# Hoặc xóa từng bảng thủ công trong DB
```

## ✅ Checklist Hoàn Thành

- [ ] Schema updated
- [ ] Migration created
- [ ] Seed data chạy thành công
- [ ] Data cũ migrated (nếu có)
- [ ] Prisma Studio mở được
- [ ] Tất cả tables có data đúng
- [ ] Backup tables tồn tại
- [ ] Không có lỗi console

## 📞 Hỗ trợ

Nếu gặp lỗi, kiểm tra:
1. `.env` có DATABASE_URL đúng không?
2. PostgreSQL đang chạy?
3. Quyền write trong thư mục prisma?
4. Node_modules cập nhật? (`npm install`)

Sau khi hoàn thành PR #1, sang **PR #2: API Endpoints**.
