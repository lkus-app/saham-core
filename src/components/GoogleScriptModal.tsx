import React, { useState, useMemo } from 'react';
import { CoreStock, GoogleScriptConfig } from '../types';
import { 
  SAMPLE_GOOGLE_SCRIPT_CODE, 
  DEFAULT_SHEET_ID, 
  DEFAULT_SHEET_GID, 
  USER_PROJECT_ID,
  parseDelimitedTextToStocks,
  ParseResult
} from '../services/googleScriptService';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  Copy, 
  Check, 
  DownloadCloud, 
  UploadCloud, 
  AlertTriangle,
  Info,
  CheckCircle2,
  Code,
  Lock,
  Globe2,
  ClipboardPaste,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface GoogleScriptModalProps {
  isOpen: boolean;
  config: GoogleScriptConfig;
  onClose: () => void;
  onSaveConfig: (config: Partial<GoogleScriptConfig>) => void;
  onSyncPull: () => Promise<void>;
  onSyncPush: () => Promise<void>;
  onSyncPullSheet: (sheetId?: string, gid?: string) => Promise<void>;
  onImportStocks?: (stocks: CoreStock[]) => void;
  onResetDefaultData: () => void;
}

export const GoogleScriptModal: React.FC<GoogleScriptModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
  onSyncPull,
  onSyncPush,
  onSyncPullSheet,
  onImportStocks,
  onResetDefaultData,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'paste' | 'code' | 'help'>('paste');
  const [url, setUrl] = useState(config.webAppUrl || '');
  const [sheetId, setSheetId] = useState(config.sheetId || DEFAULT_SHEET_ID);
  const [sheetGid, setSheetGid] = useState(config.sheetGid || DEFAULT_SHEET_GID);
  const [isPulling, setIsPulling] = useState(false);
  const [isPullingSheet, setIsPullingSheet] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Direct paste state
  const [pastedText, setPastedText] = useState('');
  const [showSkipped, setShowSkipped] = useState(false);

  // Parse direct paste text dynamically
  const parseResult: ParseResult | null = useMemo(() => {
    if (!pastedText.trim()) return null;
    try {
      return parseDelimitedTextToStocks(pastedText);
    } catch {
      return null;
    }
  }, [pastedText]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    onSaveConfig({ 
      webAppUrl: url.trim(),
      sheetId: sheetId.trim(),
      sheetGid: sheetGid.trim(),
    });
    setStatusMessage({ type: 'success', text: 'Pengaturan Google Sheet & Apps Script tersimpan!' });
  };

  const handlePullDirectSheet = async (overrideGid?: string) => {
    setIsPullingSheet(true);
    setStatusMessage(null);
    const effectiveGid = (overrideGid !== undefined ? overrideGid : sheetGid).trim();
    try {
      onSaveConfig({ sheetId: sheetId.trim(), sheetGid: effectiveGid });
      await onSyncPullSheet(sheetId.trim(), effectiveGid);
      setStatusMessage({ 
        type: 'success', 
        text: `Berhasil membaca dan memperbarui data saham langsung dari Google Sheet (tab gid: ${effectiveGid})!` 
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsPullingSheet(false);
    }
  };

  const handleApplyPastedStocks = () => {
    if (!parseResult || parseResult.stocks.length === 0) {
      setStatusMessage({ type: 'error', text: 'Tidak ada data saham valid yang ditemukan dalam teks yang Anda paste.' });
      return;
    }

    if (onImportStocks) {
      onImportStocks(parseResult.stocks);
      setStatusMessage({
        type: 'success',
        text: `Berhasil menerapkan ${parseResult.stocks.length} emiten (${parseResult.diagnostics.tickers.join(', ')}) ke database dashboard!`,
      });
    }
  };

  const handlePullData = async () => {
    if (!url.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan Web App URL terlebih dahulu.' });
      return;
    }
    setIsPulling(true);
    setStatusMessage(null);
    try {
      onSaveConfig({ webAppUrl: url.trim() });
      await onSyncPull();
      setStatusMessage({ type: 'success', text: 'Data saham berhasil ditarik dari Google Apps Script Web App!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Gagal menarik data dari Google Apps Script: ${err instanceof Error ? err.message : String(err)}. Pastikan pengaturan Deploy 'Who has access' diset ke 'Anyone'.`,
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handlePushData = async () => {
    if (!url.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan Web App URL terlebih dahulu.' });
      return;
    }
    setIsPushing(true);
    setStatusMessage(null);
    try {
      onSaveConfig({ webAppUrl: url.trim() });
      await onSyncPush();
      setStatusMessage({ type: 'success', text: 'Data lokal berhasil dikirim dan disimpan ke Google Sheet!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Gagal mengirim data: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GOOGLE_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sheetDirectUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=${sheetGid}#gid=${sheetGid}`;
  const scriptDirectUrl = `https://script.google.com/u/0/home/projects/${USER_PROJECT_ID}/edit`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/50 p-2.5 text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Koneksi &amp; Sinkronisasi Database Google Sheet
              </h2>
              <p className="text-xs text-slate-400">
                Solusi sinkronisasi data emiten, deteksi multi-tab, &amp; paste instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3.5 transition whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span>Paste Langsung (100% Pasti Terbaca)</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-bold border border-emerald-500/30">
              Paling Cepat
            </span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3.5 transition whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>Link Sheet &amp; Tab (gid)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3.5 transition whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Kode Apps Script (API)</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`border-b-2 py-3 px-3.5 transition whitespace-nowrap ${
              activeTab === 'help'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Solusi Emiten Belum Terbaca
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* TAB 1: PASTE DIRECT */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Cara Paling Cepat: Salin &amp; Tempel Langsung Semua Sel Spreadsheet</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika link spreadsheet Anda berstatus <em>Private</em> atau emiten Anda tersebar di baris/kolom khusus, Anda cukup:
                </p>
                <ol className="list-decimal pl-5 text-xs text-slate-300 space-y-1">
                  <li>Buka Google Sheet Anda: <a href={sheetDirectUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Buka Tab gid {sheetGid}</a></li>
                  <li>Tekan <strong>Ctrl + A</strong> (Pilih Semua) lalu <strong>Ctrl + C</strong> (Salin).</li>
                  <li>Klik pada kotak di bawah dan tekan <strong>Ctrl + V</strong> (Tempel).</li>
                </ol>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">
                    Tempelkan (Paste) Teks atau Sel Spreadsheet di Sini:
                  </label>
                  {pastedText && (
                    <button
                      onClick={() => setPastedText('')}
                      className="text-slate-400 hover:text-rose-400 text-[11px]"
                    >
                      Bersihkan teks
                    </button>
                  )}
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Contoh salin-tempel dari Google Sheets:
Ticker	Nama Perusahaan	Harga	Harga Wajar	MoS%	Sektor
BBCA	Bank Central Asia	6625	7500	11.7%	Financials
BBRI	Bank Rakyat Indonesia	3370	4200	19.8%	Financials
BMRI	Bank Mandiri	4390	5500	20.2%	Financials
TLKM	Telkom Indonesia	2610	3300	20.9%	Infrastructure"
                  rows={6}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Real-time Diagnostics preview if parsed */}
              {parseResult && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        {parseResult.stocks.length} Saham Terdeteksi
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Format: {parseResult.diagnostics.delimiter} &bull; Header di baris {parseResult.diagnostics.detectedHeaderRowIndex}
                      </span>
                    </div>

                    <button
                      onClick={handleApplyPastedStocks}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="h-4 w-4" />
                      <span>Terapkan {parseResult.stocks.length} Emiten ke Dashboard</span>
                    </button>
                  </div>

                  {/* List of detected tickers */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Daftar Kode Saham Ditemukan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseResult.diagnostics.tickers.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Table Sample */}
                  <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-800">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-2">Kode</th>
                          <th className="p-2">Nama Perusahaan</th>
                          <th className="p-2">Sektor</th>
                          <th className="p-2 text-right">Harga</th>
                          <th className="p-2 text-right">Wajar</th>
                          <th className="p-2 text-right">MoS</th>
                          <th className="p-2">Valuasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {parseResult.stocks.slice(0, 10).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-900/50">
                            <td className="p-2 font-bold text-white">{s.ticker}</td>
                            <td className="p-2 truncate max-w-[150px]">{s.name}</td>
                            <td className="p-2 text-[10px] text-slate-400">{s.sector}</td>
                            <td className="p-2 text-right">Rp {s.currentPrice.toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right">Rp {s.fairValue.toLocaleString('id-ID')}</td>
                            <td className={`p-2 text-right font-bold ${s.marginOfSafety >= 15 ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {s.marginOfSafety}%
                            </td>
                            <td className="p-2 text-[10px]">{s.valuationStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Collapsible Skipped Rows (Diagnostics) */}
                  {parseResult.diagnostics.skippedRows.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowSkipped(!showSkipped)}
                        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        {showSkipped ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span>
                          {parseResult.diagnostics.skippedRows.length} baris dilewati (ringkasan, header berulang, atau baris kosong)
                        </span>
                      </button>

                      {showSkipped && (
                        <div className="mt-2 rounded-lg bg-slate-900 p-2.5 space-y-1 text-[10px] text-slate-400 max-h-32 overflow-y-auto border border-slate-800">
                          {parseResult.diagnostics.skippedRows.map((sr, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-slate-500 font-mono">Baris {sr.line}:</span>
                              <span className="text-amber-400/80">{sr.reason}</span>
                              <span className="text-slate-600 truncate">({sr.preview})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LINK GOOGLE SHEET CONFIG & MULTI-TAB */}
          {activeTab === 'config' && (
            <>
              {/* Box Database Google Sheet Target */}
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                        TARGET SPREADSHEET
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {sheetId}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-300">Tab Aktif (GID):</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-emerald-400 font-bold border border-slate-700">
                        {sheetGid}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={sheetDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-700/80 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition"
                    >
                      <span>Buka Sheet di Tab Baru</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Multi-Tab Selector */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pilih Tab / Sheet yang Ingin Disinkronkan:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSheetGid('2051754762');
                        handlePullDirectSheet('2051754762');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
                        sheetGid === '2051754762'
                          ? 'bg-emerald-600 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Tab Utama (gid: 2051754762)
                    </button>

                    <button
                      onClick={() => {
                        setSheetGid('0');
                        handlePullDirectSheet('0');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
                        sheetGid === '0'
                          ? 'bg-emerald-600 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Tab Pertama (gid: 0)
                    </button>

                    <button
                      onClick={() => {
                        setSheetGid('2051754762,0');
                        handlePullDirectSheet('2051754762,0');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
                        sheetGid.includes(',')
                          ? 'bg-emerald-600 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Gabungkan Kedua Tab (2051754762 + 0)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Setiap tab di Google Sheet memiliki ID (GID) di akhir URL, contoh: <code>#gid=2051754762</code>. Jika sebagian saham ada di tab 1 dan lainnya di tab 2, pilih opsi <em>Gabungkan Kedua Tab</em>.
                  </p>
                </div>

                {/* Important Permission Notice */}
                <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Syarat Membaca Langsung Tanpa Login:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Google Sheet Anda saat ini berstatus <strong>Private (Hanya Anda)</strong>. Agar server kami dapat mengekstrak CSV otomatis:
                  </p>
                  <ol className="list-decimal pl-5 text-[11px] text-slate-300 space-y-0.5">
                    <li>Buka spreadsheet Anda via tombol di atas.</li>
                    <li>Klik tombol <strong>Bagikan (Share)</strong> di pojok kanan atas.</li>
                    <li>Ubah <em>Akses Umum</em> menjadi <strong className="text-emerald-300">"Siapa saja yang memiliki link"</strong> (Viewer).</li>
                  </ol>
                </div>

                {/* Button Tarik Langsung dari Sheet */}
                <div className="pt-1">
                  <button
                    onClick={() => handlePullDirectSheet()}
                    disabled={isPullingSheet}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                  >
                    <DownloadCloud className={`h-4 w-4 ${isPullingSheet ? 'animate-bounce' : ''}`} />
                    <span>{isPullingSheet ? 'Sedang Menghubungi Google Sheet...' : 'Tarik Data Langsung dari Google Sheet (Sync Live)'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Link to User's Google Script */}
              <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/30 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Project Google Apps Script Anda
                    </h3>
                    <p className="mt-1 font-mono text-xs text-slate-300 break-all">
                      ID: {USER_PROJECT_ID}
                    </p>
                  </div>
                  <a
                    href={scriptDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shrink-0"
                  >
                    <span>Buka Script Editor</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Web App URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Web App URL Google Apps Script (/exec)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveSettings}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dapatkan URL ini dengan klik menu <strong>Deploy &gt; Manage deployments / New deployment &gt; Web app</strong> di Google Apps Script Anda.
                </p>
              </div>

              {/* Action Buttons for Apps Script Sync */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                <button
                  onClick={handlePullData}
                  disabled={isPulling || isPushing}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
                >
                  <DownloadCloud className={`h-4 w-4 ${isPulling ? 'animate-bounce' : ''}`} />
                  <span>{isPulling ? 'Menarik...' : 'Tarik via Script API (GET)'}</span>
                </button>

                <button
                  onClick={handlePushData}
                  disabled={isPulling || isPushing}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-700 bg-teal-950/50 p-3 text-xs font-bold text-teal-300 hover:bg-teal-900/60 transition disabled:opacity-50"
                >
                  <UploadCloud className={`h-4 w-4 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Mengirim...' : 'Kirim Data ke Script (POST)'}</span>
                </button>
              </div>

              {/* Reset to default preset */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-300 block">
                    Reset Database ke Preset Saham Core IHSG
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Muat ulang 13 saham core unggulan dengan harga pasar live
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin me-reset data ke default saham core IHSG?')) {
                      onResetDefaultData();
                      setStatusMessage({ type: 'success', text: 'Data saham direset ke default core!' });
                    }
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Reset Default
                </button>
              </div>
            </>
          )}

          {/* TAB 3: CODE SCRIPT */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Kode ini sudah dilengkapi fitur <strong>Multi-Tab Otomatis</strong> &amp; <strong>Pencarian Header Cerdas</strong>:
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Semua Kode</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[50vh]">
                <pre>{SAMPLE_GOOGLE_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: HELP & DIAGNOSTICS */}
          {activeTab === 'help' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-400" />
                  Mengapa Sebagian Emiten Tidak Terbaca?
                </h4>

                <div className="space-y-3 pt-1">
                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 block">
                      1. Emiten Berada di Tab Berbeda (Sheet 1 vs Sheet 2)
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Google Spreadsheet Anda memiliki beberapa sheet/tab. Tab yang saat ini dibuka memiliki <code>gid=2051754762</code>. Jika emiten lain ada di tab pertama (biasanya <code>gid=0</code>), gunakan tombol <strong>"Gabungkan Kedua Tab"</strong> di tab Link Sheet atau gunakan fitur <strong>"Paste Langsung"</strong>.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 block">
                      2. Penamaan Kolom / Header di Spreadsheet
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Sistem kami sudah mengenali berbagai alias header Indonesia: <code>Kode / Ticker / Saham / Emiten</code>, <code>Harga / Price / Close</code>, <code>Harga Wajar / Fair Value / Target</code>, <code>MoS / Diskon</code>. Pastikan baris kolom tidak tertimpa merge cell kosong.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 block">
                      3. Format Kode Saham
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      Penulisan seperti <code>BBCA.JK</code>, <code>IDX:BBCA</code>, atau <code>1. BBCA</code> kini otomatis dibersihkan menjadi <code>BBCA</code> dan harga live-nya ditarik otomatis dari bursa secara real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`rounded-xl border p-3.5 text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                  : 'border-rose-800 bg-rose-950/40 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4">
          <span className="text-[11px] text-slate-500">
            Database ID: <code className="text-slate-400">{sheetId}</code>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

