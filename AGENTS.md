<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# QUY TẮC CODE (Karpathy-style)

## 1. Think Before Coding
- Đừng assume. Đừng giấu confusion.
- Trước khi code: Nêu assumptions, hỏi nếu không chắc.
- Nếu có nhiều cách hiểu, present tất cả - đừng chọn im lặng.
- Nếu có cách đơn giản hơn, nói ra.

## 2. Simplicity First
- Code tối thiểu solve problem. Không speculative.
- Không features ngoài yêu cầu.
- Không abstraction cho code dùng 1 lần.
- Nếu viết 200 lines mà có thể 50, viết lại.

## 3. Surgical Changes
- Touch chỉ what you must. Clean up only your own mess.
- Khi edit: Đừng "improve" code xung quanh.
- Match existing style.
- Đừng refactor nếu không broken.

## 4. Goal-Driven Execution  
- Define success criteria. Loop until verified.
- Multi-step: Nêu plan ngắn gọn trước.
- Test mỗi bước trước khi next.

# DEVELOPMENT RULES

## Server Configuration
- ALWAYS run dev server on port 3000 (localhost:3000)
- If port 3000 is in use, kill the process first before starting new server
- NEVER start multiple dev servers on different ports
- Use `npm run dev` to start the development server
- Command to kill port: `taskkill /PID <pid> /F` or find and kill node process

## Fonts
- ALWAYS use "Be Vietnam Pro" font for all text in the project
- Font configuration is in: `app/layout.tsx` and `app/globals.css`
- See `FONTS.md` for font details

## Authentication  
- Login ONLY via Gmail (Google OAuth)
- NO Facebook login
- Use NextAuth.js for authentication
- NO registration for regular users - contact admin for business accounts

## Database
- PostgreSQL (Neon) - connection in .env
- Use Prisma for database operations
- Database lib: `app/lib/db.ts`

## Code Style
- Use Tailwind CSS for styling
- Use Be Vietnam Pro font
- Keep the existing design patterns from page.tsx
- NO custom fonts other than Be Vietnam Pro
<!-- END:development-rules -->

# CAVEMAN SKILLS
@./skills/caveman/SKILL.md
@./skills/caveman-commit/SKILL.md
@./skills/caveman-review/SKILL.md
@./caveman-compress/SKILL.md