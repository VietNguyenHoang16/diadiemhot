'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Heading2, Heading3, Quote, ImageIcon, Link as LinkIcon, Undo, Redo, List, ListOrdered, RefreshCw } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeLegacyFigurePlaceholders } from '@/app/lib/image-placeholders';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string>;
  deleteImage?: (publicId: string) => Promise<void>;
  onImageClick?: (src: string) => void;
  compactPlaceholders?: boolean;
}

type SelectedImageState = {
  url: string | null;
  markerId: string | null;
  markerType: string | null;
  caption: string | null;
  className: string | null;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

const EMPTY_SELECTION: SelectedImageState = {
  url: null,
  markerId: null,
  markerType: null,
  caption: null,
  className: null,
};

export default function RichTextEditor({ content, onChange, uploadImage, deleteImage, onImageClick, compactPlaceholders = false }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hasImageSelected, setHasImageSelected] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageState>(EMPTY_SELECTION);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Refs to avoid stale closure in paste event handler
  const hasImageSelectedRef = useRef(hasImageSelected);
  const selectedImageRef = useRef(selectedImage);

  useEffect(() => {
    hasImageSelectedRef.current = hasImageSelected;
  }, [hasImageSelected]);

  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);

  const isPlaceholderNode = (attrs: Record<string, unknown>) => attrs['data-placeholder'] === true || attrs['data-placeholder'] === 'true';

  const applyImageAttrs = (element: HTMLImageElement, attrs: Record<string, unknown>) => {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) {
        element.removeAttribute(key);
        return;
      }

      element.setAttribute(key, String(value));
    });

    if (!element.getAttribute('class')) {
      element.setAttribute('class', 'cms-image');
    }
  };

  const applyPlaceholderCardAttrs = (element: HTMLDivElement, attrs: Record<string, unknown>) => {
    element.className = 'cms-placeholder-card';
    element.setAttribute('contenteditable', 'false');
    element.setAttribute('data-placeholder', 'true');

    ['data-marker-id', 'data-marker-type', 'data-caption', 'data-src'].forEach((attr) => {
      element.removeAttribute(attr);
    });

    if (attrs['data-marker-id']) element.setAttribute('data-marker-id', String(attrs['data-marker-id']));
    if (attrs['data-marker-type']) element.setAttribute('data-marker-type', String(attrs['data-marker-type']));
    if (attrs['data-caption']) element.setAttribute('data-caption', String(attrs['data-caption']));
    if (attrs.src) element.setAttribute('data-src', String(attrs.src));
  };

  const extractPublicId = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;
    const regex = /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.|\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const buildGoogleImageSearchUrl = (value: string) => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(value)}`;

  const clearImageSelection = useCallback(() => {
    setSelectedImage(EMPTY_SELECTION);
    setHasImageSelected(false);
    document.querySelectorAll('img.cms-image-placeholder.selected').forEach((el) => el.classList.remove('selected'));
    document.querySelectorAll('img.cms-image.selected').forEach((el) => el.classList.remove('selected'));
    document.querySelectorAll('.cms-placeholder-card.selected').forEach((el) => el.classList.remove('selected'));
  }, []);

  const readImageFromClipboard = async (): Promise<File | null> => {
    if (!navigator.clipboard?.read) {
      return null;
    }

    const items = await navigator.clipboard.read();

    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'));
      if (!imageType) continue;

      const blob = await item.getType(imageType);
      const extension = imageType.split('/')[1] || 'png';
      return new File([blob], `clipboard-image.${extension}`, { type: imageType });
    }

    return null;
  };

  const focusEditorForPaste = () => {
    if (!editor) return false;

    editor.chain().focus().run();
    const editorDom = editor.view.dom as HTMLElement;
    editorDom.focus();

    try {
      return typeof document.execCommand === 'function' ? document.execCommand('paste') : false;
    } catch {
      return false;
    }
  };

  const handleDeleteOldImage = useCallback(async (oldUrl: string) => {
    if (!deleteImage) return;
    const publicId = extractPublicId(oldUrl);
    if (!publicId) return;

    try {
      await deleteImage(publicId);
    } catch (err) {
      console.error('Failed to delete old image:', err);
    }
  }, [deleteImage]);

  const normalizedContent = normalizeLegacyFigurePlaceholders(content || '<p></p>');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-marker-id': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-marker-id'),
              renderHTML: (attributes) => {
                if (!attributes['data-marker-id']) return {};
                return { 'data-marker-id': attributes['data-marker-id'] };
              },
            },
            'data-marker-type': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-marker-type'),
              renderHTML: (attributes) => {
                if (!attributes['data-marker-type']) return {};
                return { 'data-marker-type': attributes['data-marker-type'] };
              },
            },
            'data-caption': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-caption'),
              renderHTML: (attributes) => {
                if (!attributes['data-caption']) return {};
                return { 'data-caption': attributes['data-caption'] };
              },
            },
            'data-placeholder': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-placeholder'),
              renderHTML: (attributes) => {
                if (!attributes['data-placeholder']) return {};
                return { 'data-placeholder': attributes['data-placeholder'] };
              },
            },
            'data-icon': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-icon'),
              renderHTML: (attributes) => {
                if (!attributes['data-icon']) return {};
                return { 'data-icon': attributes['data-icon'] };
              },
            },
            'data-label': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-label'),
              renderHTML: (attributes) => {
                if (!attributes['data-label']) return {};
                return { 'data-label': attributes['data-label'] };
              },
            },
            class: {
              default: 'cms-image',
              parseHTML: (element) => element.getAttribute('class') || 'cms-image',
              renderHTML: (attributes) => {
                if (!attributes.class) return {};
                return { class: attributes.class };
              },
            },
          };
        },
        addNodeView() {
          return ({ node, getPos, editor: currentEditor }) => {
            const attrs = node.attrs as Record<string, unknown>;
            let currentAttrs = attrs;

            const removeCurrentImageNode = async () => {
              const position = typeof getPos === 'function' ? getPos() : null;
              if (typeof position !== 'number') return;

              const latestNode = currentEditor.state.doc.nodeAt(position);
              if (!latestNode) return;

              const currentSrc = typeof currentAttrs.src === 'string' ? currentAttrs.src : '';
              if (currentSrc && !currentSrc.startsWith('data:image/')) {
                await handleDeleteOldImage(currentSrc);
              }

              currentEditor.view.dispatch(
                currentEditor.state.tr.delete(position, position + latestNode.nodeSize)
              );
              clearImageSelection();
            };

            if (compactPlaceholders && isPlaceholderNode(attrs)) {
              const dom = document.createElement('div');
              dom.className = 'cms-placeholder-row';

              const pasteButton = document.createElement('button');
              pasteButton.type = 'button';
              pasteButton.className = 'cms-placeholder-action cms-placeholder-paste';
              pasteButton.textContent = 'Dán ảnh';
              pasteButton.setAttribute('aria-label', 'Dán ảnh từ clipboard');

              const card = document.createElement('div');
              const caption = document.createElement('span');
              caption.className = 'cms-placeholder-caption';
              card.appendChild(caption);

              const searchButton = document.createElement('button');
              searchButton.type = 'button';
              searchButton.className = 'cms-placeholder-action cms-placeholder-search';
              searchButton.textContent = 'Tìm kiếm hình ảnh';
              searchButton.setAttribute('aria-label', 'Tìm kiếm hình ảnh theo caption');

              const deleteButton = document.createElement('button');
              deleteButton.type = 'button';
              deleteButton.className = 'cms-placeholder-action cms-placeholder-delete';
              deleteButton.textContent = 'X';
              deleteButton.setAttribute('aria-label', 'Bo khung anh');

              let resetPasteLabelTimer: number | null = null;
              let nativePasteCleanup: (() => void) | null = null;

              const resetPasteButtonLabel = (delay = 2400) => {
                if (resetPasteLabelTimer) {
                  window.clearTimeout(resetPasteLabelTimer);
                }

                resetPasteLabelTimer = window.setTimeout(() => {
                  pasteButton.textContent = 'Dan anh';
                  pasteButton.textContent = 'Dan anh';
                  pasteButton.textContent = 'DÃ¡n áº£nh';
                  pasteButton.textContent = 'Dan anh';
                }, delay);
              };

              const schedulePasteLabelReset = resetPasteButtonLabel;

              const clearNativePasteFallback = () => {
                nativePasteCleanup?.();
                nativePasteCleanup = null;
              };

              const syncPlaceholder = (currentAttrs: Record<string, unknown>) => {
                applyPlaceholderCardAttrs(card, currentAttrs);
                caption.textContent = String(currentAttrs['data-caption'] || currentAttrs.alt || '');
              };

              const getPlaceholderState = (): SelectedImageState => ({
                url: card.getAttribute('data-src'),
                markerId: card.getAttribute('data-marker-id'),
                markerType: card.getAttribute('data-marker-type'),
                caption: card.getAttribute('data-caption'),
                className: card.getAttribute('class'),
              });

              const selectPlaceholder = () => {
                clearImageSelection();
                card.classList.add('selected');
                const nextSelectedImage = getPlaceholderState();
                setSelectedImage(nextSelectedImage);
                setHasImageSelected(true);
                return nextSelectedImage;
              };

              const armNativePasteFallback = (targetImage: SelectedImageState) => {
                clearNativePasteFallback();

                const handleNativePaste = async (event: ClipboardEvent) => {
                  const items = event.clipboardData?.items;
                  if (!items) return;

                  for (const item of items) {
                    if (!item.type.startsWith('image/')) continue;

                    const file = item.getAsFile();
                    if (!file) continue;

                    event.preventDefault();
                    event.stopPropagation();
                    clearNativePasteFallback();

                    const didReplace = await replaceSelectedImage(file, targetImage);
                    pasteButton.textContent = didReplace ? 'ÄÃ£ dÃ¡n' : 'KhÃ´ng dÃ¡n Ä‘Æ°á»£c';
                    schedulePasteLabelReset();
                    break;
                  }
                };

                const cleanupTimer = window.setTimeout(() => {
                  clearNativePasteFallback();
                  if (pasteButton.textContent !== 'ÄÃ£ dÃ¡n') {
                    pasteButton.textContent = 'DÃ¡n áº£nh';
                  }
                }, 5000);

                document.addEventListener('paste', handleNativePaste, true);
                nativePasteCleanup = () => {
                  window.clearTimeout(cleanupTimer);
                  document.removeEventListener('paste', handleNativePaste, true);
                };
              };

              const handlePasteButtonClick = async () => {
                // NO preventDefault/stopPropagation - they kill the user gesture
                // needed for clipboard API. TipTap's stopEvent already handles
                // stopping editor events on .cms-placeholder-action.

                const nextSelectedImage = selectPlaceholder();
                clearNativePasteFallback();
                pasteButton.textContent = 'Đang dán...';

                // Try clipboard API (needs live user gesture - must NOT be consumed)
                let file: File | null = null;
                try {
                  const items = await navigator.clipboard.read();
                  for (const item of items) {
                    const imageType = item.types.find((type) => type.startsWith('image/'));
                    if (!imageType) continue;
                    const blob = await item.getType(imageType);
                    const extension = imageType.split('/')[1] || 'png';
                    file = new File([blob], `clipboard-image.${extension}`, { type: imageType });
                    break;
                  }
                } catch (err) {
                  console.error('Clipboard API failed:', err);
                }

                if (!file) {
                  armNativePasteFallback(nextSelectedImage);
                  const didTriggerNativePaste = focusEditorForPaste();
                  pasteButton.textContent = didTriggerNativePaste ? 'Dang dan...' : 'Khong dan duoc - Nhan Ctrl+V';
                  schedulePasteLabelReset(didTriggerNativePaste ? 3200 : 5000);
                  return;
                  // Show helpful message instead of falling through
                  pasteButton.textContent = 'Không dán được - Nhấn Ctrl+V';
                } else {
                  const didReplace = await replaceSelectedImage(file, nextSelectedImage);
                  pasteButton.textContent = didReplace ? 'Đã dán' : 'Không dán được';
                }

                if (resetPasteLabelTimer) {
                  window.clearTimeout(resetPasteLabelTimer);
                }

                resetPasteLabelTimer = window.setTimeout(() => {
                  pasteButton.textContent = 'Dán ảnh';
                }, 2400);
              };

              void handlePasteButtonClick;

              const openReplacePicker = () => {
                if (!replaceInputRef.current) return false;

                try {
                  replaceInputRef.current.click();
                  return true;
                } catch (err) {
                  console.error('Failed to open file picker:', err);
                  return false;
                }
              };

              const handlePasteButtonClickFixed = async () => {
                const nextSelectedImage = selectPlaceholder();
                clearNativePasteFallback();
                pasteButton.textContent = 'Dang dan...';

                let file: File | null = null;

                try {
                  file = await readImageFromClipboard();
                } catch (err) {
                  console.error('Clipboard API failed:', err);
                }

                if (!file) {
                  armNativePasteFallback(nextSelectedImage);
                  const didTriggerNativePaste = focusEditorForPaste();

                  if (didTriggerNativePaste) {
                    pasteButton.textContent = 'Dang dan...';
                    resetPasteButtonLabel(3200);
                    return;
                  }

                  const didOpenPicker = openReplacePicker();
                  pasteButton.textContent = didOpenPicker ? 'Mo chon file...' : 'Nhan Ctrl+V hoac Tai len';
                  resetPasteButtonLabel(5000);
                  return;
                }

                const didReplace = await replaceSelectedImage(file, nextSelectedImage);
                pasteButton.textContent = didReplace ? 'Da dan' : 'Khong dan duoc';
                resetPasteButtonLabel();
              };

              // Attach paste button handler (outside nodeView lifecycle)
              pasteButton.addEventListener('click', handlePasteButtonClickFixed);

              searchButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                const captionText = caption.textContent?.trim() || '';
                if (!captionText) return;

                window.open(buildGoogleImageSearchUrl(captionText), '_blank', 'noopener,noreferrer');
              });

              const handleDeleteButtonClick = async (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                await removeCurrentImageNode();
              };

              deleteButton.addEventListener('click', handleDeleteButtonClick);

              dom.appendChild(pasteButton);
              dom.appendChild(card);
              dom.appendChild(searchButton);
              dom.appendChild(deleteButton);
              syncPlaceholder(attrs);

              return {
                dom,
                update: (updatedNode) => {
                  if (updatedNode.type.name !== 'image') return false;

                  const updatedAttrs = updatedNode.attrs as Record<string, unknown>;
                  if (!(compactPlaceholders && isPlaceholderNode(updatedAttrs))) {
                    return false;
                  }

                  currentAttrs = updatedAttrs;
                  syncPlaceholder(updatedAttrs);
                  return true;
                },
                stopEvent: (event) => event.target instanceof HTMLElement && Boolean(event.target.closest('.cms-placeholder-action')),
                destroy: () => {
                  clearNativePasteFallback();
                  pasteButton.removeEventListener('click', handlePasteButtonClickFixed);
                  deleteButton.removeEventListener('click', handleDeleteButtonClick);
                  if (resetPasteLabelTimer) {
                    window.clearTimeout(resetPasteLabelTimer);
                  }
                },
              };
            }

            const imageDom = document.createElement('img');
            applyImageAttrs(imageDom, attrs);

            if (compactPlaceholders) {
              const dom = document.createElement('div');
              dom.className = 'cms-inline-image-row';

              const frame = document.createElement('div');
              frame.className = 'cms-inline-image-frame';
              frame.appendChild(imageDom);

              const deleteButton = document.createElement('button');
              deleteButton.type = 'button';
              deleteButton.className = 'cms-inline-image-delete';
              deleteButton.textContent = 'X';
              deleteButton.setAttribute('aria-label', 'Bo anh nay');

              const handleDeleteImageClick = async (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                await removeCurrentImageNode();
              };

              deleteButton.addEventListener('click', handleDeleteImageClick);

              dom.appendChild(frame);
              dom.appendChild(deleteButton);

              return {
                dom,
                update: (updatedNode) => {
                  if (updatedNode.type.name !== 'image') return false;

                  const updatedAttrs = updatedNode.attrs as Record<string, unknown>;
                  if (compactPlaceholders && isPlaceholderNode(updatedAttrs)) {
                    return false;
                  }

                  currentAttrs = updatedAttrs;
                  applyImageAttrs(imageDom, updatedAttrs);
                  return true;
                },
                stopEvent: (event) => event.target instanceof HTMLElement && Boolean(event.target.closest('.cms-inline-image-delete')),
                destroy: () => {
                  deleteButton.removeEventListener('click', handleDeleteImageClick);
                },
              };
            }

            return {
              dom: imageDom,
              update: (updatedNode) => {
                if (updatedNode.type.name !== 'image') return false;

                const updatedAttrs = updatedNode.attrs as Record<string, unknown>;
                if (compactPlaceholders && isPlaceholderNode(updatedAttrs)) {
                  return false;
                }

                currentAttrs = updatedAttrs;
                applyImageAttrs(imageDom, updatedAttrs);
                return true;
              },
            };
          };
        },
      }).configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'cms-link text-[#bb0012] underline',
        },
      }),
    ],
    content: normalizedContent,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const { from, to } = currentEditor.state.selection;
      if (from === to) {
        setHasImageSelected(false);
        return;
      }

      const { $from } = currentEditor.state.selection;
      const node = $from.node();
      if (node && node.type.name === 'image') {
        setHasImageSelected(true);
        setSelectedImage((current) => ({
          ...current,
          url: node.attrs.src,
        }));
      } else {
        setHasImageSelected(false);
      }
    },
  });

  const replaceSelectedImage = useCallback(async (file: File, targetImage: SelectedImageState = selectedImage) => {
    if (!editor || !targetImage.url) return false;

    const isPlaceholder = Boolean(targetImage.markerId);
    setIsUploading(true);

    try {
      if (!isPlaceholder) {
        await handleDeleteOldImage(targetImage.url);
      }

      const url = await uploadImage(file);
      const { state } = editor;
      let replaced = false;

      state.doc.descendants((node, pos) => {
        if (node.type.name !== 'image') return;

        const samePlaceholder = isPlaceholder && node.attrs['data-marker-id'] === targetImage.markerId;
        const sameImage = !isPlaceholder && node.attrs.src === targetImage.url;

        if (!samePlaceholder && !sameImage) return;

        const nextImageNode = editor.schema.nodes.image.create({
          src: url,
          alt: targetImage.caption || node.attrs.alt || '',
          'data-marker-id': targetImage.markerId || node.attrs['data-marker-id'] || null,
          'data-marker-type': targetImage.markerType || node.attrs['data-marker-type'] || null,
          'data-caption': targetImage.caption || node.attrs['data-caption'] || null,
          'data-placeholder': null,
          'data-icon': null,
          'data-label': null,
          class: isPlaceholder ? 'cms-image' : (targetImage.className || node.attrs.class || 'cms-image'),
        });

        const transaction = editor.state.tr.replaceWith(pos, pos + node.nodeSize, nextImageNode);
        editor.view.dispatch(transaction);

        replaced = true;
        return false;
      });

      if (!replaced) {
        const currentHtml = editor.getHTML();
        const nextHtml = isPlaceholder && targetImage.markerId
          ? currentHtml.replace(
            new RegExp(`<img[^>]*data-marker-id="${escapeRegExp(targetImage.markerId)}"[^>]*>`, 'g'),
            `<img src="${url}" alt="${targetImage.caption || ''}" data-marker-id="${targetImage.markerId}"${targetImage.markerType ? ` data-marker-type="${targetImage.markerType}"` : ''}${targetImage.caption ? ` data-caption="${targetImage.caption}"` : ''} class="cms-image" loading="lazy" />`
          )
          : currentHtml.replace(targetImage.url, url);

        if (nextHtml !== currentHtml) {
          editor.commands.setContent(nextHtml);
          replaced = true;
        }
      }
      return replaced;
    } catch {
      alert('Tai anh len that bai');
      return false;
    } finally {
      setIsUploading(false);
      clearImageSelection();
      if (replaceInputRef.current) replaceInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor, handleDeleteOldImage, selectedImage, uploadImage]);

  const handleReplaceImage = () => {
    replaceInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await replaceSelectedImage(file, selectedImageRef.current);
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Use refs to avoid stale closure - these are always current
      const currentHasImageSelected = hasImageSelectedRef.current;
      const currentSelectedImage = selectedImageRef.current;

      if (!currentHasImageSelected || !currentSelectedImage.url || !editor) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (!file) continue;

        e.preventDefault();
        e.stopPropagation();
        await replaceSelectedImage(file, currentSelectedImage);
        break;
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [editor, replaceSelectedImage]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = normalizeLegacyFigurePlaceholders(content || '<p></p>');
    if (editor.getHTML() === nextContent) return;

    editor.commands.setContent(nextContent, { emitUpdate: false });
    clearImageSelection();
  }, [content, editor]);

  useEffect(() => {
    const editorDom = editor?.view?.dom;
    if (!editorDom) return;

    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const placeholderTarget = target.closest('.cms-placeholder-card, img.cms-image-placeholder, img[data-placeholder="true"]') as HTMLElement | null;
      const isPlaceholder = Boolean(placeholderTarget);

      if (isPlaceholder) {
        e.preventDefault();
        const placeholder = placeholderTarget as HTMLElement;
        clearImageSelection();
        placeholder.classList.add('selected');
        setSelectedImage({
          url: placeholder instanceof HTMLImageElement ? (placeholder.currentSrc || placeholder.src) : placeholder.getAttribute('data-src'),
          markerId: placeholder.getAttribute('data-marker-id'),
          markerType: placeholder.getAttribute('data-marker-type'),
          caption: placeholder.getAttribute('data-caption'),
          className: placeholder.getAttribute('class'),
        });
        setHasImageSelected(true);
        return;
      }

      if (target.tagName === 'IMG') {
        e.preventDefault();
        const img = target as HTMLImageElement;
        clearImageSelection();
        img.classList.add('selected');
        setSelectedImage({
          url: img.currentSrc || img.src,
          markerId: img.getAttribute('data-marker-id'),
          markerType: img.getAttribute('data-marker-type'),
          caption: img.getAttribute('data-caption'),
          className: img.getAttribute('class'),
        });
        setHasImageSelected(true);
        onImageClick?.(img.currentSrc || img.src);
        return;
      }

      clearImageSelection();
    };

    editorDom.addEventListener('click', handleEditorClick);
    return () => editorDom.removeEventListener('click', handleEditorClick);
  }, [editor, onImageClick]);

  useEffect(() => {
    const handleScrollToMarker = (e: Event) => {
      if (!editor) return;

      const event = e as CustomEvent<{ markerId: string }>;
      const { markerId } = event.detail;
      const element = editor.view.dom.querySelector(`[data-marker-id="${markerId}"]`);

      let target = element;
      if (!target) {
        const doc = editor.view.dom;
        const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes(`[IMAGE:${markerId}:`)) {
            target = node.parentElement;
            break;
          }
        }
      }

      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (target as HTMLElement).style.outline = '4px solid #8b5cf6';
      (target as HTMLElement).style.outlineOffset = '4px';
      (target as HTMLElement).style.borderRadius = '8px';
      setTimeout(() => {
        (target as HTMLElement).style.outline = 'none';
      }, 2000);
    };

    window.addEventListener('scroll-to-marker', handleScrollToMarker);
    return () => window.removeEventListener('scroll-to-marker', handleScrollToMarker);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ onClick, isActive = false, disabled = false, children }: ToolbarButtonProps) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-[#00173a] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
    >
      {children}
    </button>
  );

  return (
    <div className={`rich-editor-mode ${compactPlaceholders ? 'rich-editor-compact' : ''} border-2 border-slate-100 rounded-2xl bg-white overflow-hidden flex flex-col focus-within:border-[#00173a] transition-colors`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={replaceInputRef}
      />

      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b-2 border-slate-100">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <ImageIcon className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`} />
        </ToolbarButton>

        {hasImageSelected && selectedImage.url && (
          <ToolbarButton onClick={handleReplaceImage} disabled={isUploading}>
            <RefreshCw className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
          </ToolbarButton>
        )}

        <div className="flex-1" />

        {hasImageSelected && (
          <span className="text-[10px] font-bold text-[#bb0012] bg-[#fff1f2] px-3 py-1 rounded-xl">
            Khung da chon - Ctrl+V de thay anh
          </span>
        )}

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="p-4 w-full h-full max-h-[75vh] overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} className="blog-content outline-none min-h-[300px]" />
      </div>
    </div>
  );
}
