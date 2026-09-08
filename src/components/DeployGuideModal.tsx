import React, { useState } from 'react';
import { 
  X, 
  Rocket, 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Globe, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: initial commit idx core stocks database"
git branch -M main
git remote add origin https://github.com/USERNAME/DATABASE-SAHAM-CORE.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-800/80 bg-indigo-950/50 p-2.5 text-indigo-400">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Panduan Push ke GitHub &amp; Deploy ke Vercel
              </h2>
              <p className="text-xs text-slate-400">
                Aplikasi siap pakai (Vite + React SPA), tinggal 2 langkah mudah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto text-xs sm:text-sm text-slate-300">
          {/* Step 1: Export or Git Push */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Github className="h-4 w-4 text-white" />
                Langkah 1: Push Project ke Repository GitHub
              </h3>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
              >
                Buat Repo di GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Buat repository baru di GitHub (contoh: <code className="text-emerald-400 font-mono">database-saham-core</code>), lalu jalankan perintah berikut di terminal:
            </p>

            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-[11px] text-slate-200">
              <pre className="overflow-x-auto whitespace-pre">{gitCommands}</pre>
              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700 transition"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Ganti <code className="text-slate-400">USERNAME</code> dan <code className="text-slate-400">DATABASE-SAHAM-CORE</code> dengan akun dan nama repo Anda.
            </p>
          </div>

          {/* Step 2: Vercel Deploy */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                Langkah 2: Hubungkan ke Vercel (Auto Deploy)
              </h3>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
              >
                Buka Vercel Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                Masuk ke akun Anda di <strong className="text-white">vercel.com</strong> &gt; klik <strong>Add New... &gt; Project</strong>.
              </li>
              <li>
                Pilih repository GitHub yang baru saja Anda push.
              </li>
              <li>
                Vercel akan <strong>secara otomatis mendeteksi konfigurasi Vite</strong>:
                <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div>Framework: <span className="text-emerald-400 font-bold">Vite</span></div>
                  <div>Build Command: <span className="text-slate-200">npm run build</span></div>
                  <div>Output Directory: <span className="text-slate-200">dist</span></div>
                  <div>Rewrites: <span className="text-teal-400">vercel.json (Included)</span></div>
                </div>
              </li>
              <li>
                Klik tombol biru <strong>Deploy</strong>! Dalam waktu ~30 detik, website database saham core Anda sudah live online dengan URL domain gratis dari Vercel (contoh: <code className="text-teal-300">saham-core.vercel.app</code>).
              </li>
            </ol>
          </div>

          {/* Features Included */}
          <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Sudah Dikonfigurasi Siap Produksi
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                <span>File <code>vercel.json</code> sudah tersedia di root untuk menangani SPA client-side routing.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                <span>Penyimpanan data lokal otomatis di browser via <code>localStorage</code> dan sinkronisasi Google Apps Script.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                <span>Desain responsif untuk dibuka di desktop maupun layar smartphone.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
