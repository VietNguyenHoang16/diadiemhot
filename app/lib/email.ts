import nodemailer from 'nodemailer';

const TO_EMAIL = 'anivia161@gmail.com';
const FROM_EMAIL = 'oxvietnguyen@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendLeadNotification(data: {
  email?: string;
  phone?: string;
  businessName?: string;
  contactName?: string;
  package?: string;
  description?: string;
}) {
  const {
    email,
    phone,
    businessName,
    contactName,
    package: leadPackage,
    description,
  } = data;

  const subject = email
    ? `📩 Liên hệ mới từ ${email}`
    : phone
      ? `📩 Liên hệ mới từ ${phone}`
      : '📩 Liên hệ mới từ Địa Điểm Hot';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #00173a; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📍 Địa Điểm Hot — Liên Hệ Mới</h2>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${email ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a; width: 120px;">Email</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #bb0012;">${email}</a></td>
          </tr>` : ''}
          ${phone ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a;">Điện thoại</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><a href="tel:${phone}" style="color: #bb0012;">${phone}</a></td>
          </tr>` : ''}
          ${businessName && businessName !== 'N/A' ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a;">Doanh nghiệp</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${businessName}</td>
          </tr>` : ''}
          ${contactName && contactName !== 'N/A' ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a;">Người liên hệ</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${contactName}</td>
          </tr>` : ''}
          ${leadPackage && leadPackage !== 'N/A' ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a;">Gói quan tâm</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${leadPackage}</td>
          </tr>` : ''}
          ${description ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #00173a;">Ghi chú</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${description}</td>
          </tr>` : ''}
        </table>
        <p style="margin-top: 20px; color: #64748b; font-size: 12px;">
          Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        </p>
      </div>
    </div>
  `;

  const text = [
    'Địa Điểm Hot — Liên Hệ Mới',
    '================================',
    email ? `Email: ${email}` : '',
    phone ? `Điện thoại: ${phone}` : '',
    businessName && businessName !== 'N/A' ? `Doanh nghiệp: ${businessName}` : '',
    contactName && contactName !== 'N/A' ? `Người liên hệ: ${contactName}` : '',
    leadPackage && leadPackage !== 'N/A' ? `Gói quan tâm: ${leadPackage}` : '',
    description ? `Ghi chú: ${description}` : '',
    `Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
  ].filter(Boolean).join('\n');

  try {
    await transporter.sendMail({
      from: `"Địa Điểm Hot" <${FROM_EMAIL}>`,
      to: TO_EMAIL,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}
