import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Tag,
  Search,
  Upload,
  Eye,
  X,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  Filter,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export function GalleryManagement() {
  const { galleryItems = [], addGalleryItem, updateGalleryItem, deleteGalleryItem } = useAdmin();

  const [filterCat, setFilterCat] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Team');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef(null);

  // ESC to close preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewItem(null);
      }
    };
    if (previewItem) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewItem]);

  const categories = ['All', 'Team', 'Office', 'Events', 'Community'];

  const getCategoryCount = (cat) => {
    if (cat === 'All') return galleryItems.length;
    return galleryItems.filter((g) => (g.category || '').toLowerCase() === cat.toLowerCase()).length;
  };

  const filtered = galleryItems.filter((item) => {
    const matchesCategory =
      filterCat === 'All' || (item.category || '').toLowerCase() === filterCat.toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (item.title || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Team');
    setImageUrl('');
    setDescription('');
    setImagePreview('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'Team');
    setImageUrl(item.imageUrl || '');
    setDescription(item.description || '');
    setImagePreview(item.imageUrl || '');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setImagePreview(dataUrl);
        setImageUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!imageUrl.trim()) {
      alert('Please upload an image file or provide an image URL.');
      return;
    }

    const todayDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    if (editingId) {
      updateGalleryItem(editingId, {
        title,
        category,
        imageUrl,
        description
      });
      setToastMessage('Gallery photograph updated successfully.');
    } else {
      addGalleryItem({
        title,
        category,
        imageUrl,
        description,
        date: todayDate,
      });
      setToastMessage('New photograph added to gallery successfully.');
    }

    setModalOpen(false);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this photograph from the corporate gallery?')) {
      deleteGalleryItem(id);
      setToastMessage('Photograph removed from gallery.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in select-none">
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1528] text-white px-4 py-3 rounded-2xl border border-blue-500 shadow-2xl flex items-center gap-2.5 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gallery Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {galleryItems.length} Photos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage corporate team photographs, branch events, AGM archives, and community initiatives shown on the public portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#004085] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all hover:shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Photographs
            </span>
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{galleryItems.length}</div>
          <p className="text-[11px] text-slate-400 font-medium">Published in repository</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Leadership & Team
            </span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">{getCategoryCount('Team')}</div>
          <p className="text-[11px] text-indigo-600 font-medium">Board & Branch staff</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Corporate Events
            </span>
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">{getCategoryCount('Events')}</div>
          <p className="text-[11px] text-emerald-600 font-medium">AGM & Celebrations</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Office & Community
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">
            {getCategoryCount('Office') + getCategoryCount('Community')}
          </div>
          <p className="text-[11px] text-amber-600 font-medium">HQ Infrastructure & CSR</p>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* CATEGORY TABS */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => {
              const count = getCategoryCount(cat);
              const isActive = filterCat.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCat(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                      ? 'bg-[#004085] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search photographs..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group hover:-translate-y-1"
            >
              {/* IMAGE PREVIEW CONTAINER WITH HOVER CONTROLS */}
              <div className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => { setPreviewItem(item); setZoomLevel(1); setRotation(0); }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2.5 rounded-xl bg-white/90 text-slate-900 shadow-md hover:bg-white hover:scale-110 transition-all font-bold text-xs flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-700" />
                    <span>View Fullscreen</span>
                  </span>
                </div>
                <span className="absolute top-3 left-3 bg-[#0B1528]/85 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-xs border border-white/10 shadow-xs">
                  {item.category}
                </span>
              </div>

              {/* CARD DETAILS */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || 'Statutory corporate photograph of New Utkal Finance Ltd.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {item.date || 'Live Archive'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Caption & Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-black text-slate-800">No photographs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No gallery items match "${searchTerm}". Try another search term or select another category.`
              : `No photographs uploaded under the "${filterCat}" category yet.`}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo Now</span>
          </button>
        </div>
      )}

      {/* UPLOAD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 w-[calc(100%-24px)] max-w-lg max-h-[90vh] overflow-y-auto space-y-5 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">
                  {editingId ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {editingId ? 'Update photo details and caption.' : 'Upload a corporate photograph to public gallery.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* IMAGE UPLOAD / PREVIEW BOX */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase text-slate-700 block">
                  Photograph File / Image *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
                    <img
                      src={imagePreview}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImagePreview(''); setImageUrl(''); }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50/70 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Click to upload an image from device
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Supports PNG, JPG, JPEG, WebP up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                {/* OR IMAGE URL */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Or Enter Image URL:
                  </span>
                  <input
                    type="url"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-700 block">
                  Photo Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Executive Board Meeting & AGM 2026"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              {/* CATEGORY */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-700 block">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="Team">Team (Leadership & Staff)</option>
                  <option value="Office">Office (HQ & Branch Infrastructure)</option>
                  <option value="Events">Events (Conferences, AGM, Celebrations)</option>
                  <option value="Community">Community (CSR & Outreach)</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-700 block">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context about this photograph..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#004085] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all hover:shadow-lg"
                >
                  {editingId ? 'Save Changes' : 'Publish Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md select-none animate-fade-in">
          <div className="relative max-w-5xl w-full h-full max-h-[92vh] flex flex-col justify-between">
            {/* TOP CONTROLS BAR */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white z-10">
              <div className="space-y-0.5 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-white truncate">{previewItem.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase">
                    {previewItem.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {previewItem.date || 'Archive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={previewItem.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer inline-flex items-center"
                  title="Open Original Image"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer ml-2"
                  title="Close Lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* IMAGE CANVAS */}
            <div className="flex-1 flex items-center justify-center overflow-hidden my-3">
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              />
            </div>

            {/* BOTTOM CAPTION */}
            {previewItem.description && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white text-xs font-medium text-center">
                {previewItem.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryManagement;
