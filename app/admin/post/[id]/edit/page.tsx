'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, RefreshCw, Save, Upload, X } from 'lucide-react';
import RichTextEditor from '../../../components/RichTextEditor';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  province: string;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
};

type CategoryOption = {
  name: string;
};

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverSelected, setCoverSelected] = useState(false);
  const [coverPasteLabel, setCoverPasteLabel] = useState('Dan anh');
  const [categories, setCategories] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Du lich',
    province: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    tags: [] as string[],
  });

  const coverSearchQuery = useMemo(
    () => (form.title || form.excerpt || 'anh bia bai viet').trim(),
    [form.excerpt, form.title]
  );

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch('/api/admin/blog');
        const posts = await res.json();
        const found = posts.find((item: Post) => item.id === postId);

        if (found) {
          setPost(found);
          setForm({
            title: found.title || '',
            slug: found.slug || '',
            excerpt: found.excerpt || '',
            content: found.content || '',
            image: found.image || '',
            category: found.category || 'Du lich',
            province: found.province || '',
            status: found.status || 'DRAFT',
            tags: found.tags || [],
          });
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchMeta() {
      try {
        const [catRes, provRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/locations'),
        ]);

        const cats = await catRes.json() as CategoryOption[];
        const provs = await provRes.json();

        setCategories(cats.map((item) => item.name));
        setProvinces(provs);
      } catch (err) {
        console.error('Failed to load meta:', err);
      }
    }

    void fetchPost();
    void fetchMeta();
  }, [postId]);

  const getUploadSignature = useCallback(async (folder: string) => {
    const res = await fetch('/api/admin/uploads/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });

    if (!res.ok) throw new Error('Sign failed');
    return res.json();
  }, []);

  const uploadToCloudinary = useCallback(async (file: File, folder: string) => {
    const sign = await getUploadSignature(folder);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sign.apiKey);
    formData.append('timestamp', String(sign.timestamp));
    formData.append('folder', sign.folder);
    formData.append('signature', sign.signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();
    return data.secure_url as string;
  }, [getUploadSignature]);

  const deleteImage = useCallback(async (publicId: string) => {
    const res = await fetch('/api/admin/uploads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });

    if (!res.ok) throw new Error('Delete failed');
  }, []);

  function extractPublicId(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;

    const regex = /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.|\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const resetCoverPasteLabel = useCallback((nextLabel: string, delay = 2200) => {
    setCoverPasteLabel(nextLabel);
    window.setTimeout(() => {
      setCoverPasteLabel('Dan anh');
    }, delay);
  }, []);

  const uploadCoverFile = useCallback(async (file: File) => {
    setUploading(true);

    try {
      const oldId = form.image ? extractPublicId(form.image) : null;
      if (oldId) {
        await deleteImage(oldId);
      }

      const url = await uploadToCloudinary(file, 'diadiemhot/blog/cover');
      setForm((current) => ({ ...current, image: url }));
    } catch {
      alert('Upload cover failed');
    } finally {
      setUploading(false);
      setCoverSelected(false);
      setCoverPasteLabel('Dan anh');
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  }, [deleteImage, form.image, uploadToCloudinary]);

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadCoverFile(file);
  }, [uploadCoverFile]);

  const readImageFromClipboard = useCallback(async (): Promise<File | null> => {
    if (!navigator.clipboard?.read) {
      return null;
    }

    const items = await navigator.clipboard.read();

    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'));
      if (!imageType) continue;

      const blob = await item.getType(imageType);
      const extension = imageType.split('/')[1] || 'png';
      return new File([blob], `cover-image.${extension}`, { type: imageType });
    }

    return null;
  }, []);

  const focusCoverForPaste = useCallback(() => {
    const active = document.activeElement as HTMLElement | null;
    active?.blur();

    try {
      return typeof document.execCommand === 'function' ? document.execCommand('paste') : false;
    } catch {
      return false;
    }
  }, []);

  const handleCoverPasteButton = useCallback(async () => {
    setCoverSelected(true);
    setCoverPasteLabel('Dang dan...');

    try {
      const file = await readImageFromClipboard();
      if (!file) {
        const didTriggerNativePaste = focusCoverForPaste();
        resetCoverPasteLabel(didTriggerNativePaste ? 'Dang dan...' : 'Nhan Ctrl+V');
        return;
      }

      await uploadCoverFile(file);
      resetCoverPasteLabel('Da dan');
    } catch (err) {
      console.error('Failed to paste cover image:', err);
      const didTriggerNativePaste = focusCoverForPaste();
      resetCoverPasteLabel(didTriggerNativePaste ? 'Dang dan...' : 'Nhan Ctrl+V');
    }
  }, [focusCoverForPaste, readImageFromClipboard, resetCoverPasteLabel, uploadCoverFile]);

  const handleCoverSearch = useCallback(() => {
    if (!coverSearchQuery) return;
    window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(coverSearchQuery)}`, '_blank', 'noopener,noreferrer');
  }, [coverSearchQuery]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!coverSelected) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (!item.type.startsWith('image/')) continue;

        const file = item.getAsFile();
        if (!file) continue;

        e.preventDefault();
        await uploadCoverFile(file);
        break;
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [coverSelected, uploadCoverFile]);

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          image: form.image,
          category: form.category,
          province: form.province,
          status: form.status,
          tags: form.tags,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      router.push('/admin?tab=blog');
    } catch {
      alert('Luu that bai');
    } finally {
      setSaving(false);
    }
  }

  function addTag(name: string) {
    const tag = name.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((current) => ({ ...current, tags: [...current.tags, tag] }));
    }
    setTagInput('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-slate-500">Dang tai...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Bai viet khong ton tai</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin?tab=blog')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lai
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800">Chinh sua bai viet</h1>
              <p className="text-xs text-slate-400">{post.status === 'PUBLISHED' ? 'Da xuat ban' : 'Nhap'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm font-bold"
            >
              <Eye className="w-4 h-4" />
              Xem truoc
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#bb0012] text-white hover:bg-[#a00010] transition-all text-sm font-bold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Dang luu...' : 'Luu'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Tieu de bai viet..."
              className="w-full text-xl font-black text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-300"
            />
          </div>

          <div>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm((current) => ({ ...current, content: html }))}
              uploadImage={async (file) => uploadToCloudinary(file, 'diadiemhot/blog/content')}
              deleteImage={deleteImage}
              compactPlaceholders
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Anh Cover</label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={coverInputRef}
              onChange={handleCoverUpload}
            />

            <div
              className={`relative aspect-[16/6] rounded-xl overflow-hidden bg-slate-100 border-2 transition-all ${
                coverSelected ? 'border-[#bb0012] shadow-[0_0_0_4px_rgba(187,0,18,0.16)]' : 'border-dashed border-slate-200'
              }`}
              onClick={() => setCoverSelected((current) => !current)}
            >
              {form.image ? (
                <>
                  <img
                    src={form.image}
                    alt=""
                    className="cover-image w-full h-full object-cover cursor-pointer"
                  />
                  {coverSelected && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-xl">Anh bia da chon</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                  <Upload className="w-8 h-8 text-slate-300 mb-3" />
                  <span className="text-xs text-slate-500 font-black uppercase tracking-widest">
                    {coverSelected ? 'Khung anh bia da chon' : 'Khung anh bia trong'}
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-slate-400 leading-relaxed">
                    {coverSearchQuery || 'Anh bia bai viet'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCoverPasteButton}
                disabled={uploading}
                className="flex-1 py-2 rounded-xl border-2 border-[#bb0012] bg-white text-xs font-bold text-[#bb0012] hover:bg-[#bb0012] hover:text-white transition-all disabled:opacity-50"
              >
                {coverPasteLabel}
              </button>
              <button
                type="button"
                onClick={handleCoverSearch}
                className="flex-1 py-2 rounded-xl border-2 border-slate-100 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Tim kiem hinh anh
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${uploading ? 'animate-spin' : ''}`} />
                Tai len
              </button>
            </div>

            <p className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wider ${coverSelected ? 'text-[#bb0012]' : 'text-slate-400'}`}>
              {coverSelected ? 'Khung cover da chon - Ctrl+V de thay anh' : 'Click khung cover roi Ctrl+V, bam Dan anh hoac Tim kiem hinh anh'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">URL BAI VIET (SLUG)</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border-2 border-slate-100 focus-within:border-[#bb0012]/30 transition-all">
              <span className="text-sm font-bold text-slate-400 select-none">/blog/</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
                placeholder="duong-dan-bai-viet (de trong tu tao)"
                className="flex-1 bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-300 text-[#00173a]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Danh muc</label>
            <select
              value={form.category}
              onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
              className="w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-violet-400 transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Khu vuc</label>
            <select
              value={form.province}
              onChange={(e) => setForm((current) => ({ ...current, province: e.target.value }))}
              className="w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-violet-400 transition-all"
            >
              <option value="">Toan quoc</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-xs font-bold text-violet-600"
                >
                  {tag}
                  <button onClick={() => setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Nhap tag..."
                className="flex-1 rounded-xl border-2 border-slate-100 px-3 py-2 text-xs font-bold outline-none focus:border-violet-400 transition-all"
              />
              <button
                onClick={() => addTag(tagInput)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all"
              >
                Them
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Mo ta ngan</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((current) => ({ ...current, excerpt: e.target.value }))}
              placeholder="Mo ta ngan cho bai viet..."
              rows={3}
              className="w-full rounded-xl border-2 border-slate-100 px-3 py-2 text-sm font-bold outline-none resize-none focus:border-violet-400 transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-3 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Trang thai</label>
            <div className="flex gap-2">
              {(['DRAFT', 'PUBLISHED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setForm((current) => ({ ...current, status }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    form.status === status
                      ? status === 'PUBLISHED'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {status === 'PUBLISHED' ? 'Xuat ban' : 'Nhap'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
