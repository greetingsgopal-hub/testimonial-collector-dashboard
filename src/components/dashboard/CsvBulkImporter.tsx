import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  RefreshCw,
  Trash2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  parseCsvString,
  autoDetectColumnMapping,
  normalizeAndValidateRows,
  generateCsvTemplate,
  CsvMappingConfig,
} from '../../lib/csvParser';
import { storage } from '../../lib/storage';

interface CsvBulkImporterProps {
  projectId: string;
  ownerId?: string;
  onSuccess?: (count: number) => void;
}

export const CsvBulkImporter: React.FC<CsvBulkImporterProps> = ({
  projectId,
  ownerId,
  onSuccess,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvMappingConfig>({});
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'complete'>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pandapraise_testimonials_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a valid .csv spreadsheet file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const parsed = parseCsvString(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        alert('The uploaded CSV file is empty or missing a header row.');
        return;
      }
      setParsedHeaders(parsed.headers);
      setParsedRows(parsed.rows);
      const detected = autoDetectColumnMapping(parsed.headers);
      setMapping(detected);
      setStep('map');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const validationResult = useMemo(() => {
    if (parsedHeaders.length === 0 || parsedRows.length === 0) {
      return { validReviews: [], invalidRows: [] };
    }
    return normalizeAndValidateRows({
      headers: parsedHeaders,
      rows: parsedRows,
      mapping,
      projectId,
      ownerId,
    });
  }, [parsedHeaders, parsedRows, mapping, projectId, ownerId]);

  const handleExecuteImport = async () => {
    if (validationResult.validReviews.length === 0) return;
    setIsImporting(true);
    setImportError(null);

    try {
      if (storage.bulkCreateReviews) {
        await storage.bulkCreateReviews(validationResult.validReviews, projectId);
      } else {
        for (const rev of validationResult.validReviews) {
          await storage.createReview(rev, projectId);
        }
      }

      setImportCount(validationResult.validReviews.length);
      setStep('complete');
      if (onSuccess) {
        onSuccess(validationResult.validReviews.length);
      }
    } catch (err: any) {
      console.error('[CsvBulkImporter] Import failed:', err);
      setImportError(err.message || 'Failed to import testimonials.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFileName('');
    setParsedHeaders([]);
    setParsedRows([]);
    setMapping({});
    setStep('upload');
    setImportError(null);
    setImportCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Upload CSV Testimonials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Import bulk reviews from spreadsheets, previous platforms, or client exports in seconds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 transition shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Progress steps pill */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span
          className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            step === 'upload'
              ? 'bg-purple-600 text-white font-bold shadow-2xs'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
          }`}
        >
          1. Upload
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
        <span
          className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            step === 'map'
              ? 'bg-purple-600 text-white font-bold shadow-2xs'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          2. Map Fields
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
        <span
          className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            step === 'preview' || step === 'complete'
              ? 'bg-purple-600 text-white font-bold shadow-2xs'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          3. Validate & Commit
        </span>
      </div>

      {/* Step 1: Upload Dropzone */}
      {step === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            isDragging
              ? 'border-purple-500 bg-purple-100/50 dark:bg-purple-950/40 scale-[1.005]'
              : 'border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/10 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-purple-50/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3 shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            Drag and drop your .CSV spreadsheet here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Supports standard CSV files with headers for author name, review content, rating, company, and photos.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
          >
            Browse Computer
          </button>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'map' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{fileName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {parsedRows.length} total rows detected • {parsedHeaders.length} columns found
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Re-upload
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Map CSV Columns to PandaPraise Fields
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              We auto-matched the columns below based on standard headers. Adjust any mappings if needed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'name', label: 'Author Name', required: true },
                { field: 'content', label: 'Review Content / Feedback', required: true },
                { field: 'rating', label: 'Star Rating (1-5)', required: false },
                { field: 'role', label: 'Handle / Job Title', required: false },
                { field: 'company', label: 'Company / Organization', required: false },
                { field: 'avatarUrl', label: 'Avatar Photo URL', required: false },
                { field: 'source', label: 'Source Channel', required: false },
              ].map(({ field, label, required }) => (
                <div
                  key={field}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                >
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>
                      {label} {required && <span className="text-rose-500">*</span>}
                    </span>
                    {mapping[field as keyof CsvMappingConfig] ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        Matched
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Optional</span>
                    )}
                  </label>
                  <select
                    value={mapping[field as keyof CsvMappingConfig] || ''}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field]: e.target.value || undefined })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">-- Ignore / Not in CSV --</option>
                    {parsedHeaders.map((header) => (
                      <option key={header} value={header}>
                        CSV Column: "{header}"
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep('preview')}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition cursor-pointer"
            >
              <span>Continue to Preview & Validate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Live Preview & Validation */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Summary status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Rows in File</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{parsedRows.length}</p>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Valid Ready to Import</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {validationResult.validReviews.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Flagged Rows</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {validationResult.invalidRows.length}
              </p>
            </div>
          </div>

          {importError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Validation preview table */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Author</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Content Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validationResult.validReviews.slice(0, 15).map((rev, idx) => (
                    <tr key={`valid-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {rev.name}
                        {rev.role && <span className="block text-[10px] font-normal text-slate-400">{rev.role}</span>}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-amber-500">★ {rev.rating}</span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {rev.content}
                      </td>
                    </tr>
                  ))}

                  {validationResult.invalidRows.map((inv, idx) => (
                    <tr key={`inv-${idx}`} className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Fix Needed
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">Row #{inv.rowNumber}</td>
                      <td className="py-2.5 px-3 text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-medium">
                        {inv.reasons.join(' • ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep('map')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Back to Mapping
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isImporting || validationResult.validReviews.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing Testimonials...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Commit & Import {validationResult.validReviews.length} Testimonials</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success State */}
      {step === 'complete' && (
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Successfully Imported {importCount} Testimonials!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All reviews have been securely validated and added to your project with approved status.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition cursor-pointer"
            >
              Import Another CSV File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
