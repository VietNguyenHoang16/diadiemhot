import { createImagePlaceholderHtml } from '@/app/lib/image-placeholders';
import { PromptModule } from './types';

export const imageMarkerPrompt: PromptModule = {
  name: 'images',
  priority: 8,
  content: `## HE THONG ANH MARKER (QUAN TRONG)

### NGUYEN TAC QUAN TRONG NHAT - CHON ANH DUNG Y:
1. **DUNG CHU DE**: Anh phai LIEN QUAN TRUC TIEP den noi dung dang viet. Khong chon anh chung chung, khong lien quan.
2. **GIU CHAN DOC GIA**: Anh phai hap dan, khieng nguoi doc MUON o lai xem tiep. Anh dep nhung sai ngu canh = mat nguoi doc.
3. **MO TA CU THE**: Description phai chi tiet ro rang, goi dung hinh anh thuc te nhat co the.

### MARKER FORMAT (tuyet doi tuan thu):
[IMAGE:id:type:description]

- **id**: unique identifier (vd: hero_1, food_1, space_1, gallery_1, person_1)
- **type**: loai anh - anh huong CSS class
  - <code>hero</code>: Anh bia chinh (21:9)
  - <code>content</code>: Anh trong noi dung (16:9)
  - <code>gallery</code>: Anh gallery nho (1:1)
  - <code>food</code>: Anh mon an (4:3)
  - <code>space</code>: Anh khong gian (16:9)
  - <code>person</code>: Anh nguoi (3:4)
  - <code>product</code>: Anh san pham (1:1)
- **description**: Mo ta ngan gon anh can tim - phai dung chu de bai viet, ro what/where. TOI DA 40 KY TU hoac 8 TU. Khong viet cau hoan chinh, khong chen ly do, loi ich, nhan dinh dai dong. Description nay se thanh caption anh nen phai ngan, du y.

### VI DU MARKER DUNG Y (lien quan chu de):
- Chu de review quan ca phe: \`[IMAGE:hero_1:hero:"Mat tien quan Giang 1946"]\`
- Chu de du lich Da Nang: \`[IMAGE:space_1:space:"Cau Tinh Yeu hoang hon"]\`
- Chu de am thuc: \`[IMAGE:food_1:food:"Banh mi bo toi Phung"]\`

### VI DU MARKER SAI - KHONG LAM:
- \`[IMAGE:hero_1:hero:"Quan cafe Giang Ha Noi, mat tien tu nam 1946, bang hieu go truyen thong"]\` (QUA DAI - tren 40 ky tu)
- \`[IMAGE:food_1:food:"Banh mi bo toi Phung Sai Gon, goc chup can canh nhan banh dang nong"]\` (QUA DAI)
- \`[IMAGE:space_1:space:"Xuong san xuat hien dai giup don vi kiem soat chat luong va gia thanh tot hon doi thu"]\` (QUA DAI - caption thanh mot doan van)
- \`[IMAGE:hero_1:hero:"Beautiful coffee shop"]\` (qua chung chung)
- \`[IMAGE:food_1:food:"Food photo"]\` (khong mo ta gi)
- \`[IMAGE:space_1:space:"Random interior"]\` (khong lien quan chu de)

### SO LUONG ANH & VI TRI TOI UU:
- **Quy tac vang**: Chen it nhat 1 anh ngay sau moi tieu de H2 de giu chan nguoi doc.
- **Review**: Toi thieu 5 anh (1 hero, 2 space, 2 food/service).
- **Ranking**: Moi dia diem bat buoc co it nhat 1 anh rieng + 1 hero.
- **Travel Guide**: Moi ngay it nhat 2 anh + 1 hero.
- **Culture Story**: 4-6 anh xen ke minh hoa cac y chinh.

### CSS CLASSES (de user biet kich thuoc):
- hero: <code>aspect-[21/9] rounded object-cover</code>
- content: <code>aspect-[16/9] rounded object-cover</code>
- gallery: <code>aspect-square rounded object-cover</code>
- food: <code>aspect-[4/3] rounded object-cover</code>
- space: <code>aspect-[16/9] rounded object-cover</code>
- person: <code>aspect-[3/4] rounded object-cover</code>
- product: <code>aspect-square rounded object-cover</code>`
};

export function extractImageMarkers(content: string): Array<{ id: string; type: string; description: string }> {
  const markerRegex = /\[IMAGE:([^:]+):([^:]+):"([^"]+)"\]/g;
  const markers: Array<{ id: string; type: string; description: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = markerRegex.exec(content)) !== null) {
    markers.push({
      id: match[1],
      type: match[2],
      description: match[3],
    });
  }

  return markers;
}

export function replaceImageMarker(content: string, markerId: string, imageUrl: string): string {
  const markerRegex = new RegExp(
    `\\[IMAGE:${markerId}:[^:]+:"[^"]+"\\]`,
    'g'
  );
  return content.replace(markerRegex, imageUrl);
}

const unsplashPhotoPool = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1497935586351-bec78aea704b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800',
];

export function replaceAllImageMarkers(content: string): string {
  const markerRegex = /\[IMAGE:([^:]+):([^:]+):"([^"]+)"\]/g;

  const processedContent = content.replace(/<p>([\s\S]*?)(\[IMAGE:[^\]]+\])([\s\S]*?)<\/p>/g, (match, before, marker, after) => {
    let result = '';
    if (before.trim()) result += `<p>${before.trim()}</p>`;
    result += marker;
    if (after.trim()) result += `<p>${after.trim()}</p>`;
    return result;
  });

  return processedContent.replace(markerRegex, (match, id, type, description) => {
    const cleanDesc = description.replace(/\s+/g, ' ').trim();
    return createImagePlaceholderHtml(id, type, cleanDesc);
  });
}

export const imageTypeClasses: Record<string, string> = {
  hero: 'aspect-[21/9] rounded object-cover w-full',
  content: 'aspect-[16/9] rounded object-cover w-full',
  gallery: 'aspect-square rounded object-cover w-full',
  food: 'aspect-[4/3] rounded object-cover w-full',
  space: 'aspect-[16/9] rounded object-cover w-full',
  person: 'aspect-[3/4] rounded object-cover w-full',
  product: 'aspect-square rounded object-cover w-full',
};

export function wrapImageWithHtml(url: string, type: string, alt: string): string {
  const baseClass = imageTypeClasses[type] || imageTypeClasses.content;

  if (type === 'hero') {
    return `<div class="mb-8 overflow-hidden rounded shadow-lg">\n  <img src="${url}" alt="${alt}" class="${baseClass}" loading="lazy" />\n</div>`;
  }

  return `<img src="${url}" alt="${alt}" class="${baseClass} my-6" loading="lazy" />`;
}

void unsplashPhotoPool;
