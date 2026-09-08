import React, { useState, useRef } from 'react';
import { StockpickItem } from '../types';
import { Sparkles, PlusCircle, ShieldAlert, Image as ImageIcon, CheckCircle, Target } from 'lucide-react';

interface StockpickViewProps {
  stockpicks: StockpickItem[];
  onAddStockpick: (post: StockpickItem) => void;
}

export const StockpickView: React.FC<StockpickViewProps> = ({ stockpicks, onAddStockpick }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [ticker, setTicker] = useState('');
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [ta, setTa] = useState('');
  const [bandar, setBandar] = useState('');
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleProcessWatermark = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.save();
        ctx.font = `bold ${Math.floor(img.width / 16)}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.textAlign = 'center';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('SAHAM CORE', 0, 0);
        ctx.restore();

        const base64 = canvas.toDataURL('image/png');
        setWatermarkedImage(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: StockpickItem = {
      ticker: ticker.toUpperCase(),
      title,
      entry,
      tp,
      sl,
      ta_rationale: ta,
      bandar_rationale: bandar,
      chart_url:
        watermarkedImage ||
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
      created_at: 'Baru saja',
    };

    onAddStockpick(newPost);
    // Reset form
    setTicker('');
    setTitle('');
    setEntry('');
    setTp('');
    setSl('');
    setTa('');
    setBandar('');
    setWatermarkedImage(null);
    setIsAdminOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-900/50 bg-slate-900 p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
              VIP Analysis Feed
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Kurasi Setup &amp; Bandarmologi Saham Core
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Feed Stockpick Tim Saham Core
          </h2>
        </div>

        <button
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition font-mono self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          {isAdminOpen ? 'Tutup Form' : 'Publish Setup Baru'}
        </button>
      </div>

      {/* Admin Upload Form */}
      {isAdminOpen && (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-5 sm:p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase font-mono flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Form Upload Tim Saham Core (Auto-Watermark Engine)
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">TICKER</label>
                <input
                  type="text"
                  placeholder="BREN"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 uppercase text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ENTRY</label>
                <input
                  type="text"
                  placeholder="9.450 - 9.600"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">TARGET PRICE (TP)</label>
                <input
                  type="text"
                  placeholder="10.800"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">STOP LOSS (SL)</label>
                <input
                  type="text"
                  placeholder="9.150"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-rose-400 font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">JUDUL SETUP</label>
              <input
                type="text"
                placeholder="Breakout Cup & Handle + Akumulasi Asing Massive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">TECHNICAL ANALYSIS RATIONALE</label>
                <textarea
                  rows={3}
                  placeholder="Volume breakout di atas resistance, MACD histogram melebar..."
                  value={ta}
                  onChange={(e) => setTa(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">BANDARMOLOGY RATIONALE</label>
                <textarea
                  rows={3}
                  placeholder="Net foreign buy masif, broker summary top 3 buyer..."
                  value={bandar}
                  onChange={(e) => setBandar(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                UPLOAD GAMBAR CHART (OTOMATIS WATERMARK &quot;SAHAM CORE&quot;)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProcessWatermark}
                className="text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
              />
              <canvas ref={canvasRef} className="hidden" />

              {watermarkedImage && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 max-w-sm">
                  <img src={watermarkedImage} alt="Watermarked Preview" className="w-full h-auto" />
                  <span className="absolute top-2 right-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] text-emerald-400 border border-slate-700 font-mono">
                    Watermarked &quot;SAHAM CORE&quot;
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-6 py-2 font-bold text-slate-950 hover:bg-emerald-400"
              >
                PUBLISH STOCKPICK
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stockpicks.map((post, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg transition hover:border-slate-700 flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-emerald-400 font-mono text-base">{post.ticker}</span>
                <span className="text-slate-300 font-medium text-xs truncate">&bull; {post.title}</span>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-800/80 font-mono font-bold shrink-0">
                TP: {post.tp}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Chart Image */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black">
                  <img
                    src={post.chart_url}
                    alt={post.ticker}
                    className="w-full max-h-60 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    SAHAM CORE &copy; VERIFIED
                  </div>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ENTRY ZONE</span>
                    <strong className="text-slate-200">{post.entry}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TARGET (TP)</span>
                    <strong className="text-emerald-400">{post.tp}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">STOP LOSS (SL)</span>
                    <strong className="text-rose-400">{post.sl}</strong>
                  </div>
                </div>

                {/* Rationales */}
                <div className="text-xs text-slate-300 space-y-2 font-mono">
                  <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800/50">
                    <strong className="text-sky-400 block mb-0.5">Analisis Teknikal (TA):</strong>
                    <p className="text-slate-300 leading-relaxed">{post.ta_rationale}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/40 p-2.5 border border-slate-800/50">
                    <strong className="text-amber-400 block mb-0.5">Bandarmologi &amp; Foreign Flow:</strong>
                    <p className="text-slate-300 leading-relaxed">{post.bandar_rationale}</p>
                  </div>
                </div>
              </div>

              {post.created_at && (
                <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/40">
                  <span>Diposting: {post.created_at}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Tim Saham Core
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
