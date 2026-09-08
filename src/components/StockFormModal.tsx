import React, { useState, useEffect } from 'react';
import { CoreStock, SectorType, ValuationStatus, ConvictionTier, RecommendationType } from '../types';
import { SECTORS } from '../data/defaultStocks';
import { X, Calculator, Sparkles, Check, AlertCircle } from 'lucide-react';

interface StockFormModalProps {
  isOpen: boolean;
  stockToEdit?: CoreStock | null;
  onClose: () => void;
  onSave: (stock: CoreStock) => void;
}

export const StockFormModal: React.FC<StockFormModalProps> = ({
  isOpen,
  stockToEdit,
  onClose,
  onSave,
}) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState<SectorType>('Financials (Perbankan)');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [fairValue, setFairValue] = useState<number>(0);
  const [marginOfSafety, setMarginOfSafety] = useState<number>(0);
  const [valuationStatus, setValuationStatus] = useState<ValuationStatus>('Undervalued');
  const [buyAreaLow, setBuyAreaLow] = useState<number>(0);
  const [buyAreaHigh, setBuyAreaHigh] = useState<number>(0);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [peRatio, setPeRatio] = useState<number>(12);
  const [pbvRatio, setPbvRatio] = useState<number>(1.5);
  const [roe, setRoe] = useState<number>(15);
  const [dividendYield, setDividendYield] = useState<number>(4);
  const [marketCapTrillion, setMarketCapTrillion] = useState<number>(100);
  const [conviction, setConviction] = useState<ConvictionTier>('Tier 1 (Core Utama)');
  const [recommendation, setRecommendation] = useState<RecommendationType>('Strong Buy');
  const [catalysts, setCatalysts] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (stockToEdit) {
      setTicker(stockToEdit.ticker);
      setName(stockToEdit.name);
      setSector(stockToEdit.sector);
      setCurrentPrice(stockToEdit.currentPrice);
      setFairValue(stockToEdit.fairValue);
      setMarginOfSafety(stockToEdit.marginOfSafety);
      setValuationStatus(stockToEdit.valuationStatus);
      setBuyAreaLow(stockToEdit.buyAreaLow);
      setBuyAreaHigh(stockToEdit.buyAreaHigh);
      setTargetPrice(stockToEdit.targetPrice);
      setStopLoss(stockToEdit.stopLoss || 0);
      setPeRatio(stockToEdit.peRatio);
      setPbvRatio(stockToEdit.pbvRatio);
      setRoe(stockToEdit.roe);
      setDividendYield(stockToEdit.dividendYield);
      setMarketCapTrillion(stockToEdit.marketCapTrillion);
      setConviction(stockToEdit.conviction);
      setRecommendation(stockToEdit.recommendation);
      setCatalysts(stockToEdit.catalysts || '');
      setNotes(stockToEdit.notes || '');
    } else {
      // Reset form
      setTicker('');
      setName('');
      setSector('Financials (Perbankan)');
      setCurrentPrice(1000);
      setFairValue(1250);
      setMarginOfSafety(20);
      setValuationStatus('Undervalued');
      setBuyAreaLow(950);
      setBuyAreaHigh(1000);
      setTargetPrice(1300);
      setStopLoss(880);
      setPeRatio(10);
      setPbvRatio(1.2);
      setRoe(16);
      setDividendYield(5);
      setMarketCapTrillion(50);
      setConviction('Tier 1 (Core Utama)');
      setRecommendation('Strong Buy');
      setCatalysts('');
      setNotes('');
    }
  }, [stockToEdit, isOpen]);

  // Recalculate MOS when price or fair value changes
  const handlePriceChange = (price: number) => {
    setCurrentPrice(price);
    if (fairValue > 0) {
      const calculatedMos = Number((((fairValue - price) / fairValue) * 100).toFixed(1));
      setMarginOfSafety(calculatedMos);
      updateValuationStatus(calculatedMos);
    }
  };

  const handleFairValueChange = (fv: number) => {
    setFairValue(fv);
    if (fv > 0) {
      const calculatedMos = Number((((fv - currentPrice) / fv) * 100).toFixed(1));
      setMarginOfSafety(calculatedMos);
      updateValuationStatus(calculatedMos);
      if (!targetPrice || targetPrice === 0) {
        setTargetPrice(fv);
      }
    }
  };

  const updateValuationStatus = (mos: number) => {
    if (mos >= 15) {
      setValuationStatus('Undervalued');
      setRecommendation('Strong Buy');
    } else if (mos <= -10) {
      setValuationStatus('Overvalued');
      setRecommendation('Take Profit / Overpriced');
    } else {
      setValuationStatus('Fair Value');
      setRecommendation('Buy on Weakness');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    const newStock: CoreStock = {
      id: stockToEdit ? stockToEdit.id : ticker.toLowerCase().trim(),
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || ticker.toUpperCase().trim(),
      sector,
      currentPrice: Number(currentPrice) || 0,
      fairValue: Number(fairValue) || 0,
      marginOfSafety: Number(marginOfSafety) || 0,
      valuationStatus,
      buyAreaLow: Number(buyAreaLow) || Math.round(currentPrice * 0.95),
      buyAreaHigh: Number(buyAreaHigh) || currentPrice,
      targetPrice: Number(targetPrice) || fairValue,
      stopLoss: Number(stopLoss) || undefined,
      peRatio: Number(peRatio) || 0,
      pbvRatio: Number(pbvRatio) || 0,
      roe: Number(roe) || 0,
      dividendYield: Number(dividendYield) || 0,
      marketCapTrillion: Number(marketCapTrillion) || 0,
      conviction,
      recommendation,
      catalysts: catalysts.trim(),
      notes: notes.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onSave(newStock);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            {stockToEdit ? `Edit Saham Core (${stockToEdit.ticker})` : 'Tambah Saham Core Baru'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Ticker & Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Kode Saham (Ticker) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="cth: BBCA"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm uppercase text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Bank Central Asia Tbk"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sector & Conviction */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Sektor Industri
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {SECTORS.filter((s) => s !== 'Semua Sektor').map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Kategori Conviction
              </label>
              <select
                value={conviction}
                onChange={(e) => setConviction(e.target.value as ConvictionTier)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Tier 1 (Core Utama)">Tier 1 (Core Utama - Pondasi Portofolio)</option>
                <option value="Tier 2 (Core Pendukung)">Tier 2 (Core Pendukung / Satelit)</option>
                <option value="Watchlist">Watchlist (Pantauan Khusus)</option>
              </select>
            </div>
          </div>

          {/* Price, Fair Value & MOS Calculation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Valuasi & Margin of Safety
              </span>
              <span className="font-mono text-xs font-bold text-slate-300">
                MOS Terhitung: <span className="text-emerald-400">{marginOfSafety}%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Harga Saat Ini (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={currentPrice || ''}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="9500"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-teal-400 block mb-1">Harga Wajar / Fair Value (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={fairValue || ''}
                  onChange={(e) => handleFairValueChange(parseFloat(e.target.value) || 0)}
                  placeholder="11000"
                  className="w-full rounded-xl border border-teal-800/80 bg-slate-900 px-3 py-2 font-mono text-sm text-teal-300 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Status Valuasi</label>
                <select
                  value={valuationStatus}
                  onChange={(e) => setValuationStatus(e.target.value as ValuationStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Undervalued">Undervalued (Diskon)</option>
                  <option value="Fair Value">Fair Value (Wajar)</option>
                  <option value="Overvalued">Overvalued (Premium)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buy Area & Target */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Area Beli Bawah (Rp)</label>
              <input
                type="number"
                value={buyAreaLow || ''}
                onChange={(e) => setBuyAreaLow(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Area Beli Atas (Rp)</label>
              <input
                type="number"
                value={buyAreaHigh || ''}
                onChange={(e) => setBuyAreaHigh(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target TP (Rp)</label>
              <input
                type="number"
                value={targetPrice || ''}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Stop Loss (Rp)</label>
              <input
                type="number"
                value={stopLoss || ''}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ratios: PER, PBV, ROE, Div Yield */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">PER (P/E Ratio)</label>
              <input
                type="number"
                step="0.1"
                value={peRatio || ''}
                onChange={(e) => setPeRatio(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">PBV Ratio</label>
              <input
                type="number"
                step="0.1"
                value={pbvRatio || ''}
                onChange={(e) => setPbvRatio(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">ROE (%)</label>
              <input
                type="number"
                step="0.1"
                value={roe || ''}
                onChange={(e) => setRoe(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Dividend Yield (%)</label>
              <input
                type="number"
                step="0.1"
                value={dividendYield || ''}
                onChange={(e) => setDividendYield(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Market Cap & Recommendation */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Market Cap (Rp Triliun)</label>
              <input
                type="number"
                step="1"
                value={marketCapTrillion || ''}
                onChange={(e) => setMarketCapTrillion(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Rekomendasi Aksi</label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as RecommendationType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Strong Buy">Strong Buy (Diskon Lebar)</option>
                <option value="Buy on Weakness">Buy on Weakness (Beli saat koreksi)</option>
                <option value="Hold / Monitor">Hold / Monitor (Tahan / Pantau)</option>
                <option value="Take Profit / Overpriced">Take Profit / Overpriced</option>
              </select>
            </div>
          </div>

          {/* Catalysts & Notes */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Katalis Positif & Alasan Investasi (Thesis)
            </label>
            <textarea
              rows={2}
              value={catalysts}
              onChange={(e) => setCatalysts(e.target.value)}
              placeholder="cth: Pertumbuhan kredit korporasi tinggi, dividen payout ratio konsisten >70%..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Catatan Strategis / Batas Risiko
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth: Akumulasi di area support 9.300-9.500, hindari mengejar harga saat reli..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Simpan Saham</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
