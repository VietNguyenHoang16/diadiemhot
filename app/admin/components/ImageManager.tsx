'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Eye, AlertCircle, Check, MapPin, Search, Crosshair, ExternalLink, RefreshCw } from 'lucide-react';

interface ImageMarker {
  id: string;
  type: 'hero' | 'content' | 'gallery' | 'food' | 'space' | 'person' | 'product';
  description: string;
  uploadedUrl?: string;
}

interface ImageManagerProps {
  content: string;
  articleTitle?: string;
  onContentChange: (newContent: string) => void;
  onUploadImage: (file: File, folder: string) => Promise<string>;
  onDeleteImage?: (publicId: string) => Promise<void>;
  defaultFolder?: string;
}

const imageTypeLabels: Record<string, { label: string; aspect: string }> = {
  hero: { label: 'Ảnh Bìa', aspect: '21:9' },
  content: { label: 'Ảnh Nội Dung', aspect: '16:9' },
  gallery: { label: 'Gallery', aspect: '1:1' },
  food: { label: 'Ảnh Món Ăn', aspect: '4:3' },
  space: { label: 'Ảnh Không Gian', aspect: '16:9' },
  person: { label: 'Ảnh Người', aspect: '3:4' },
  product: { label: 'Ảnh Sản Phẩm', aspect: '1:1' }
};

const imageTypeClasses: Record<string, string> = {
  hero: 'aspect-[21/9] w-full object-cover',
  content: 'aspect-video w-full object-cover',
  gallery: 'aspect-square w-full object-cover',
  food: 'aspect-[4/3] w-full object-cover',
  space: 'aspect-video w-full object-cover',
  person: 'aspect-[3/4] w-full object-cover',
  product: 'aspect-square w-full object-cover'
};

export function extractImageMarkers(content: string): ImageMarker[] {
  const markers: ImageMarker[] = [];

  // 1. Extract from text markers ￼[IMAGE:...]
  const markerRegex = /￼\[IMAGE:([^:]+):([^:]+):"([^"]+)"\]/g;
  let match;
  while ((match = markerRegex.exec(content)) !== null) {
    markers.push({
      id: match[1],
      type: match[2] as ImageMarker['type'],
      description: match[3]
    });
  }

  // 2. Extract from already replaced images with data-marker-id
  const imgRegex = /<img[^>]*data-marker-id="([^"]+)"[^>]*src="([^"]+)"/g;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const markerId = imgMatch[1];
    const uploadedUrl = imgMatch[2];

    const existing = markers.find(m => m.id === markerId);
    if (!existing) {
      markers.push({
        id: markerId,
        type: 'content',
        description: 'Đã tải lên',
        uploadedUrl
      });
    } else {
      existing.uploadedUrl = uploadedUrl;
    }
  }

  return markers;
}

export function replaceImageMarker(content: string, markerId: string, imageUrl: string, altText: string = ''): string {
  const markerRegex = new RegExp(
    `￼\\[IMAGE:${markerId}:([^:]+):"([^"]+)"\\]`,
    'g'
  );

  let updatedContent = content;

  const match = new RegExp(`￼\\[IMAGE:${markerId}:([^:]+):"([^"]+)"\\]`).exec(content);
  if (match) {
    const type = match[1];
    const description = match[2];
    const aspectClass = imageTypeClasses[type] || 'aspect-video';
    const alt = altText || description || '';

    const replacement = type === 'hero'
      ? `<div class="mb-8 overflow-hidden rounded-[2rem] shadow-lg" data-marker-container="${markerId}"><img src="${imageUrl}" alt="${alt}" data-marker-id="${markerId}" class="${aspectClass} object-cover" loading="lazy" /></div>`
      : `<img src="${imageUrl}" alt="${alt}" data-marker-id="${markerId}" class="${aspectClass} rounded-2xl my-6" loading="lazy" />`;

    updatedContent = content.replace(markerRegex, replacement);
  } else {
    const existingImgRegex = new RegExp(`<img[^>]*data-marker-id="${markerId}"[^>]*src="([^"]+)"`, 'g');
    updatedContent = content.replace(existingImgRegex, (match) => {
      return match.replace(/src="([^"]+)"/, `src="${imageUrl}"`);
    });
  }

  return updatedContent;
}

export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
  // or: https://res.cloudinary.com/{cloud}/image/upload/{public_id}.{format}
  const regex = /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.|\?|$)/;
  const match = url.match(regex);

  if (match && match[1]) {
    // Remove folder prefix if present (e.g., diadiemhot/blog/content/abc123 -> diadiemhot/blog/content/abc123)
    return match[1];
  }

  return null;
}

export default function ImageManager({
  content,
  articleTitle = '',
  onContentChange,
  onUploadImage,
  onDeleteImage,
  defaultFolder = 'diadiemhot/blog/content'
}: ImageManagerProps) {
  const [markers, setMarkers] = useState<ImageMarker[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewMarker, setPreviewMarker] = useState<ImageMarker | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [pasteTargetId, setPasteTargetId] = useState<string | null>(null);
  const pasteInputRef = useRef<HTMLInputElement | null>(null);

  // Extract markers when content changes
  useEffect(() => {
    const extracted = extractImageMarkers(content);
    setMarkers(extracted);
  }, [content]);

  // Global paste listener
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (!pasteTargetId) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(pasteTargetId, file);
            setPasteTargetId(null);
          }
          break;
        }
      }
    }

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [pasteTargetId, content, articleTitle, onContentChange, onUploadImage, defaultFolder]);

  const handleFileSelect = useCallback(async (markerId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    setUploadingId(markerId);

    try {
      // Get old URL to delete later
      const currentMarker = markers.find(m => m.id === markerId);
      const oldUrl = currentMarker?.uploadedUrl;

      const url = await onUploadImage(file, defaultFolder);
      const newContent = replaceImageMarker(content, markerId, url, articleTitle);
      onContentChange(newContent);

      // Delete old image from Cloudinary if we have a public_id and delete handler
      if (oldUrl && onDeleteImage) {
        const publicId = extractPublicIdFromUrl(oldUrl);
        if (publicId) {
          try {
            await onDeleteImage(publicId);
          } catch (err) {
            console.error('Failed to delete old image:', err);
          }
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingId(null);
    }
  }, [content, articleTitle, onContentChange, onUploadImage, onDeleteImage, defaultFolder, markers]);

  const handleChangeImage = (markerId: string) => {
    setPasteTargetId(markerId);
    // Create hidden paste input
    if (pasteInputRef.current) {
      pasteInputRef.current.click();
    }
  };

  const handleLocate = (markerId: string) => {
    window.dispatchEvent(new CustomEvent('scroll-to-marker', { detail: { markerId } }));
  };

  const handleSearch = (query: string, engine: 'google' | 'unsplash') => {
    const q = encodeURIComponent(query);
    const url = engine === 'google'
      ? `https://www.google.com/search?q=${q}&tbm=isch`
      : `https://unsplash.com/s/photos/${q}`;
    window.open(url, '_blank');
  };

  const progress = markers.length === 0 ? 100 : Math.round((markers.filter(m => m.uploadedUrl).length / markers.length) * 100);

  return (
    <div className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
      {/* Hidden paste input */}
      <input
        type="file"
        ref={pasteInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pasteTargetId) {
            handleFileSelect(pasteTargetId, file);
            setPasteTargetId(null);
          }
          e.target.value = '';
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between p-5 bg-slate-50/50 border-b border-slate-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-100">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-black text-[10px] uppercase tracking-widest text-[#00173a]">HỖ TRỢ HÌNH ẢNH AI</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              {markers.filter(m => m.uploadedUrl).length} / {markers.length} ảnh đã sẵn sàng
              {pasteTargetId && <span className="text-violet-600 ml-2">— Dán ảnh vào đây (Ctrl+V)</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-violet-600">{progress}%</span>
          </div>
          <button className={`p-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <AlertCircle className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* List */}
      {isExpanded && (
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {markers.map((marker) => {
            const isUploaded = !!marker.uploadedUrl;
            const typeInfo = imageTypeLabels[marker.type] || { label: 'Ảnh', aspect: '16:9' };

            return (
              <div
                key={marker.id}
                className={`group flex gap-4 p-4 rounded-3xl border-2 transition-all ${
                  isUploaded
                    ? 'bg-green-50/30 border-green-100'
                    : 'bg-slate-50/30 border-slate-50'
                }`}
              >
                {/* Thumbnail / Upload */}
                <div className="relative w-28 shrink-0">
                  <div className={`rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm ${imageTypeClasses[marker.type]}`}>
                    {isUploaded ? (
                      <>
                        <img src={marker.uploadedUrl} alt="" className="w-full h-full object-cover" />
                        {/* Change image button - center of thumbnail, only visible to admin */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleChangeImage(marker.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-all shadow-lg"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Đổi ảnh
                          </button>
                        </div>
                        {/* Ctrl+V hint badge */}
                        <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-[8px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          Ctrl+V to paste
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {uploadingId === marker.id ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                    )}
                  </div>

                  {!isUploaded && (
                    <label className="absolute inset-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(marker.id, file);
                        }}
                      />
                    </label>
                  )}
                  {isUploaded && (
                    <label className="absolute inset-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(marker.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-100 text-[8px] font-black uppercase text-slate-400">
                        {marker.id}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLocate(marker.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-violet-600 hover:border-violet-100 transition-all"
                          title="Tìm vị trí trong bài"
                        >
                          <Crosshair className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs font-bold leading-relaxed line-clamp-2 ${isUploaded ? 'text-green-700' : 'text-[#00173a]'}`}>
                      {marker.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleSearch(marker.description, 'google')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      <Search className="h-2.5 w-2.5" /> Google
                    </button>
                    <button
                      onClick={() => handleSearch(marker.description, 'unsplash')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      <ExternalLink className="h-2.5 w-2.5" /> Unsplash
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
