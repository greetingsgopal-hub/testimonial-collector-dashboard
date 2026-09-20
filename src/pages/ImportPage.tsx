import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Globe,
  Star,
  ArrowRight,
  Check,
  AlertCircle,
  X,
  Download,
  ChevronRight,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { ImportPlatform, ReviewInput, CsvColumnMapping } from '../types';
import { storage } from '../lib/storage';

interface PlatformInfo {
  id: ImportPlatform;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  available: boolean;
}

const PLATFORMS: PlatformInfo[] = [
  { id: 'csv', name: 'CSV / Excel', icon: <FileSpreadsheet size={20} />, description: 'Upload a CSV or Excel file', color: 'emerald', available: true },
  { id: 'google_reviews', name: 'Google Reviews', icon: <span className="text-lg">🔍</span>, description: 'Import from Google Business', color: 'blue', available: true },
  { id: 'twitter', name: 'Twitter / X', icon: <span className="text-lg">𝕏</span>, description: 'Import tweets and threads', color: 'sky', available: true },
  { id: 'linkedin', name: 'LinkedIn', icon: <span className="text-lg">in</span>, description: 'Import recommendations', color: 'blue', available: true },
  { id: 'g2', name: 'G2', icon: <span className="text-lg">🏆</span>, description: 'Import G2 reviews', color: 'orange', available: true },
  { id: 'trustpilot', name: 'Trustpilot', icon: <Star size={20} />, description: 'Import Trustpilot reviews', color: 'green', available: true },
  { id: 'producthunt', name: 'Product Hunt', icon: <span className="text-lg">🚀</span>, description: 'Import Product Hunt reviews', color: 'orange', available: true },
  { id: 'capterra', name: 'Capterra', icon: <span className="text-lg">📊</span>, description: 'Import Capterra reviews', color: 'blue', available: true },
  { id: 'yelp', name: 'Yelp', icon: <span className="text-lg">🍽️</span>, description: 'Import Yelp reviews', color: 'red', available: true },
  { id: 'shopify', name: 'Shopify', icon: <span className="text-lg">🛍️</span>, description: 'Import Shopify reviews', color: 'green', available: true },
  { id: 'appstore', name: 'App Store', icon: <span className="text-lg">🍎</span>, description: 'Import iOS app reviews', color: 'blue', available: true },
  { id: 'playstore', name: 'Google Play', icon: <span className="text-lg">▶️</span>, description: 'Import Android app reviews', color: 'green', available: true },
  { id: 'facebook', name: 'Facebook', icon: <span className="text-lg">📘</span>, description: 'Import Facebook reviews', color: 'blue', available: true },
  { id: 'reddit', name: 'Reddit', icon: <span className="text-lg">🤖</span>, description: 'Import Reddit mentions', color: 'orange', available: true },
  { id: 'manual', name: 'Manual Entry', icon: <span className="text-lg">✍️</span>, description: 'Add testimonials manually', color: 'violet', available: true },
];

const CSV_SAMPLE = `name,email,rating,content,company,role
"Jane Smith","jane@example.com",5,"Amazing product! Totally transformed our workflow.","Acme Inc","CTO"
"John Doe","john@example.com",4,"Great tool, highly recommend it.","StartupXYZ","Founder"`;

export const ImportPage: React.FC = () => {
  usePageSeo({
    title: 'Import Testimonials — Panda Praise',
    description: 'Import testimonials from 30+ platforms or upload a CSV file.',
  });

  const { project } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; errors?: string[] } | null>(null);

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<CsvColumnMapping>({});
  const [csvStep, setCsvStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualRating, setManualRating] = useState(5);
  const [manualCompany, setManualCompany] = useState('');
  const [manualRole, setManualRole] = useState('');

  const filteredPlatforms = PLATFORMS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parseCsv = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;

    // Simple CSV parse (handles quoted fields)
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);

    setCsvHeaders(headers);
    setCsvData(rows);

    // Auto-map columns by name
    const autoMap: CsvColumnMapping = {};
    const mapField = (field: keyof CsvColumnMapping, ...aliases: string[]) => {
      const idx = headers.findIndex(h =>
        aliases.some(a => h.toLowerCase().replace(/[_\s-]/g, '') === a.toLowerCase().replace(/[_\s-]/g, ''))
      );
      if (idx >= 0) (autoMap as any)[field] = headers[idx];
    };

    mapField('name', 'name', 'fullname', 'full_name', 'author', 'reviewer');
    mapField('email', 'email', 'emailaddress', 'email_address');
    mapField('rating', 'rating', 'stars', 'score');
    mapField('content', 'content', 'review', 'text', 'testimonial', 'body', 'message', 'feedback');
    mapField('title', 'title', 'headline', 'subject');
    mapField('company', 'company', 'organization', 'org', 'business');
    mapField('role', 'role', 'jobtitle', 'job_title', 'position');
    mapField('avatarUrl', 'avatar', 'avatarurl', 'avatar_url', 'photo', 'image');
    mapField('date', 'date', 'createdat', 'created_at', 'timestamp');

    setColumnMapping(autoMap);
    setCsvStep('map');
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  }, [parseCsv]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleCsvImport = useCallback(async () => {
    if (!project || csvData.length === 0) return;
    setIsImporting(true);

    const storageAdapter = storage;
    const getColIdx = (field: keyof CsvColumnMapping) => {
      const header = columnMapping[field];
      return header ? csvHeaders.indexOf(header) : -1;
    };

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        const nameIdx = getColIdx('name');
        const contentIdx = getColIdx('content');
        if (nameIdx < 0 || contentIdx < 0 || !row[nameIdx] || !row[contentIdx]) {
          errors.push(`Row ${i + 2}: Missing name or content`);
          continue;
        }

        const emailIdx = getColIdx('email');
        const ratingIdx = getColIdx('rating');
        const companyIdx = getColIdx('company');
        const roleIdx = getColIdx('role');
        const titleIdx = getColIdx('title');

        const review: ReviewInput = {
          name: row[nameIdx] || 'Anonymous',
          email: emailIdx >= 0 ? row[emailIdx] || '' : '',
          content: row[contentIdx],
          rating: ratingIdx >= 0 ? Math.min(5, Math.max(1, parseInt(row[ratingIdx]) || 5)) : 5,
          company: companyIdx >= 0 ? row[companyIdx] : undefined,
          role: roleIdx >= 0 ? row[roleIdx] || '' : '',
          title: titleIdx >= 0 ? row[titleIdx] : undefined,
          type: 'text',
          tags: [],
          source: 'csv',
          consent: true,
          projectId: project.id,
          status: 'approved',
        };

        await storageAdapter.createReview(review, project.id);
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err.message || 'Import failed'}`);
      }
    }

    setImportResult({ success: imported > 0, count: imported, errors: errors.length > 0 ? errors : undefined });
    setCsvStep('done');
    setIsImporting(false);
  }, [project, csvData, csvHeaders, columnMapping]);

  const handleManualImport = useCallback(async () => {
    if (!project || !manualName.trim() || !manualContent.trim()) return;
    setIsImporting(true);

    try {
      const storageAdapter = storage;
      const review: ReviewInput = {
        name: manualName.trim(),
        email: manualEmail.trim(),
        content: manualContent.trim(),
        rating: manualRating,
        company: manualCompany.trim() || undefined,
        role: manualRole.trim(),
        type: 'text',
        tags: [],
        source: 'manual',
        consent: true,
        projectId: project.id,
        status: 'approved',
      };

      await storageAdapter.createReview(review, project.id);
      setImportResult({ success: true, count: 1 });
      setManualName('');
      setManualEmail('');
      setManualContent('');
      setManualRating(5);
      setManualCompany('');
      setManualRole('');
    } catch (err: any) {
      setImportResult({ success: false, count: 0, errors: [err.message] });
    }

    setIsImporting(false);
  }, [project, manualName, manualEmail, manualContent, manualRating, manualCompany, manualRole]);

  const handleUrlImport = useCallback(async () => {
    if (!project || !importUrl.trim() || !selectedPlatform) return;
    setIsImporting(true);

    // For URL-based imports, we'd call a serverless function
    // For now, show a placeholder result
    setTimeout(() => {
      setImportResult({
        success: true,
        count: 0,
        errors: ['URL-based import requires server-side processing. Configure your API endpoints in Settings > Integrations.'],
      });
      setIsImporting(false);
    }, 1500);
  }, [project, importUrl, selectedPlatform]);

  const resetImport = () => {
    setSelectedPlatform(null);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setCsvStep('upload');
    setImportResult(null);
    setImportUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Import Testimonials</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Import from 30+ platforms or upload a CSV file to bring in your existing reviews.
        </p>
      </div>

      {/* Success/Error Banner */}
      {importResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3
          ${importResult.success
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-red-500/5 border-red-500/20'}`}>
          {importResult.success ? (
            <Check size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${importResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
              {importResult.success
                ? `Successfully imported ${importResult.count} testimonial${importResult.count !== 1 ? 's' : ''}!`
                : 'Import failed'}
            </p>
            {importResult.errors && importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i} className="text-xs text-zinc-400">• {err}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li className="text-xs text-zinc-500">...and {importResult.errors.length - 5} more</li>
                )}
              </ul>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Platform Selection */}
      {!selectedPlatform && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platforms..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                       bg-white/5 border border-white/10
                       text-zinc-200 placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
            />
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className="flex items-center gap-3 p-4 rounded-xl
                         bg-white/[0.02] border border-white/10 hover:border-white/20
                         hover:bg-white/[0.04] transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0
                              group-hover:bg-white/10 transition-colors">
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{platform.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{platform.description}</p>
                </div>
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSV Import Flow */}
      {selectedPlatform === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={resetImport} className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to sources
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-sm font-medium text-zinc-300">CSV / Excel Import</span>
          </div>

          {csvStep === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-12 rounded-xl border-2 border-dashed text-center transition-all
                ${isDragOver
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.01]'}`}
            >
              <Upload size={36} className="mx-auto text-zinc-500 mb-4" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                Drag & drop your CSV or Excel file here
              </h3>
              <p className="text-sm text-zinc-500 mb-4">or click to browse</p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         bg-violet-600 hover:bg-violet-500 text-white cursor-pointer transition-colors"
              >
                <FileSpreadsheet size={16} />
                Choose File
              </label>

              <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                <p className="text-xs text-zinc-500 font-medium mb-2">Sample CSV format:</p>
                <pre className="text-xs text-emerald-300/70 font-mono overflow-x-auto">{CSV_SAMPLE}</pre>
                <button
                  onClick={() => {
                    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'sample-testimonials.csv'; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <Download size={12} /> Download sample CSV
                </button>
              </div>
            </div>
          )}

          {csvStep === 'map' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200">
                      📄 {csvFile?.name}
                    </h3>
                    <p className="text-xs text-zinc-500">{csvData.length} rows found</p>
                  </div>
                  <button onClick={() => { setCsvStep('upload'); setCsvFile(null); setCsvData([]); }}
                    className="text-xs text-zinc-500 hover:text-zinc-300">Choose different file</button>
                </div>

                <h4 className="text-sm font-medium text-zinc-300 mb-3">Map Your Columns</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['name', 'email', 'rating', 'content', 'title', 'company', 'role'] as (keyof CsvColumnMapping)[]).map(field => (
                    <div key={field}>
                      <label className="text-xs text-zinc-500 mb-1 block capitalize">
                        {field} {(field === 'name' || field === 'content') && <span className="text-red-400">*</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={(columnMapping as any)[field] || ''}
                          onChange={(e) => setColumnMapping(prev => ({ ...prev, [field]: e.target.value || undefined }))}
                          className="w-full px-3 py-2 text-sm rounded-lg
                                   bg-white/5 border border-white/10
                                   text-zinc-200 appearance-none cursor-pointer
                                   focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                        >
                          <option value="">— Not mapped —</option>
                          {csvHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview first 3 rows */}
              {csvData.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Preview (first 3 rows)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10">
                          {csvHeaders.map(h => (
                            <th key={h} className="text-left py-2 px-2 text-zinc-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b border-white/5">
                            {row.map((cell, j) => (
                              <td key={j} className="py-2 px-2 text-zinc-400 max-w-[150px] truncate">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button onClick={() => { setCsvStep('upload'); setCsvFile(null); }}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5">
                  Cancel
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={!columnMapping.name || !columnMapping.content || isImporting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                           bg-violet-600 hover:bg-violet-500 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload size={15} />
                  )}
                  Import {csvData.length} Testimonials
                </button>
              </div>
            </div>
          )}

          {csvStep === 'done' && (
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/10 text-center">
              <Check size={48} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">Import Complete!</h3>
              <p className="text-sm text-zinc-400 mb-6">
                {importResult?.count || 0} testimonials imported into your dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={resetImport}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5">
                  Import More
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Flow */}
      {selectedPlatform === 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={resetImport} className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to sources
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-sm font-medium text-zinc-300">Manual Entry</span>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Name *</label>
                <input type="text" value={manualName} onChange={e => setManualName(e.target.value)}
                  placeholder="Jane Smith" className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                  placeholder="jane@example.com" className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Company</label>
                <input type="text" value={manualCompany} onChange={e => setManualCompany(e.target.value)}
                  placeholder="Acme Inc" className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Role</label>
                <input type="text" value={manualRole} onChange={e => setManualRole(e.target.value)}
                  placeholder="CTO" className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setManualRating(r)}
                    className={`p-1.5 rounded transition-colors ${r <= manualRating ? 'text-amber-400' : 'text-zinc-600'}`}>
                    <Star size={20} className={r <= manualRating ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Testimonial *</label>
              <textarea value={manualContent} onChange={e => setManualContent(e.target.value)}
                rows={4} placeholder="Write the testimonial content..."
                className="w-full px-3 py-2 text-sm rounded-lg resize-none bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleManualImport}
                disabled={!manualName.trim() || !manualContent.trim() || isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                         bg-violet-600 hover:bg-violet-500 text-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Add Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL-based import (for all other platforms) */}
      {selectedPlatform && selectedPlatform !== 'csv' && selectedPlatform !== 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={resetImport} className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to sources
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-sm font-medium text-zinc-300">
              {PLATFORMS.find(p => p.id === selectedPlatform)?.name} Import
            </span>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Paste the URL of the page with reviews
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform === 'google_reviews' ? 'g.co/kgs/...' : selectedPlatform === 'g2' ? 'www.g2.com/products/...' : 'example.com/reviews'}`}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                           bg-white/5 border border-white/10
                           text-zinc-200 placeholder-zinc-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs text-amber-300/80 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  URL-based imports are processed server-side. The import may take a few minutes
                  depending on the number of reviews. You'll be notified when it's complete.
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={resetImport}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={handleUrlImport}
                disabled={!importUrl.trim() || isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                         bg-violet-600 hover:bg-violet-500 text-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={15} />
                )}
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
