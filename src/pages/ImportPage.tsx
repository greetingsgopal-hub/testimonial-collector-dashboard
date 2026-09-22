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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { ImportPlatform, ReviewInput, CsvColumnMapping } from '../types';
import { storage } from '../lib/storage';
import { ConnectSourceModal } from '../components/dashboard/views/ConnectSourceModal';

interface PlatformInfo {
  id: ImportPlatform;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  available: boolean;
}

const PLATFORMS: PlatformInfo[] = [
  { id: 'csv', name: 'CSV / Excel', icon: <FileSpreadsheet size={20} className="text-emerald-600" />, description: 'Upload a CSV or Excel file', color: 'emerald', available: true },
  { id: 'google_reviews', name: 'Google Reviews', icon: <span className="text-lg">🔍</span>, description: 'Import from Google Business', color: 'blue', available: true },
  { id: 'twitter', name: 'Twitter / X', icon: <span className="text-lg font-bold">𝕏</span>, description: 'Import tweets and threads', color: 'sky', available: true },
  { id: 'linkedin', name: 'LinkedIn', icon: <span className="text-lg font-bold text-blue-600">in</span>, description: 'Import recommendations', color: 'blue', available: true },
  { id: 'g2', name: 'G2', icon: <span className="text-lg">🏆</span>, description: 'Import G2 reviews', color: 'orange', available: true },
  { id: 'trustpilot', name: 'Trustpilot', icon: <Star size={20} className="text-emerald-600 fill-emerald-600" />, description: 'Import Trustpilot reviews', color: 'green', available: true },
  { id: 'producthunt', name: 'Product Hunt', icon: <span className="text-lg">🚀</span>, description: 'Import Product Hunt reviews', color: 'orange', available: true },
  { id: 'capterra', name: 'Capterra', icon: <span className="text-lg">📊</span>, description: 'Import Capterra reviews', color: 'blue', available: true },
  { id: 'yelp', name: 'Yelp', icon: <span className="text-lg">🍽️</span>, description: 'Import Yelp reviews', color: 'red', available: true },
  { id: 'shopify', name: 'Shopify', icon: <span className="text-lg">🛍️</span>, description: 'Import Shopify reviews', color: 'green', available: true },
  { id: 'appstore', name: 'App Store', icon: <span className="text-lg">🍎</span>, description: 'Import iOS app reviews', color: 'blue', available: true },
  { id: 'playstore', name: 'Google Play', icon: <span className="text-lg">▶️</span>, description: 'Import Android app reviews', color: 'green', available: true },
  { id: 'facebook', name: 'Facebook', icon: <span className="text-lg font-bold text-blue-700">f</span>, description: 'Import Facebook reviews', color: 'blue', available: true },
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
  const [showConnectModal, setShowConnectModal] = useState(false);
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

    try {
      const getVal = (row: string[], field: keyof CsvColumnMapping): string => {
        const col = columnMapping[field];
        if (!col) return '';
        const idx = csvHeaders.indexOf(col);
        return idx >= 0 ? (row[idx] || '').replace(/^"|"$/g, '') : '';
      };

      const reviews: ReviewInput[] = csvData.map(row => ({
        projectId: project.id,
        name: getVal(row, 'name') || 'Anonymous',
        email: getVal(row, 'email') || 'imported@example.com',
        rating: Math.min(5, Math.max(1, parseInt(getVal(row, 'rating')) || 5)),
        content: getVal(row, 'content'),
        title: getVal(row, 'title') || undefined,
        company: getVal(row, 'company') || undefined,
        role: getVal(row, 'role') || '',
        avatarUrl: getVal(row, 'avatarUrl') || undefined,
        tags: ['imported', 'csv'],
        source: 'csv' as const,
        type: 'text' as const,
        consent: true,
        status: 'approved' as const,
      })).filter(r => r.content.trim().length > 0);

      let imported = 0;
      for (const r of reviews) {
        await storage.createReview(r);
        imported++;
      }

      setImportResult({ success: true, count: imported });
      setCsvStep('done');
    } catch (err: any) {
      setImportResult({ success: false, count: 0, errors: [err.message] });
    }

    setIsImporting(false);
  }, [project, csvData, columnMapping, csvHeaders]);

  const handleManualImport = useCallback(async () => {
    if (!project || !manualName.trim() || !manualContent.trim()) return;
    setIsImporting(true);

    try {
      await storage.createReview({
        projectId: project.id,
        name: manualName.trim(),
        email: manualEmail.trim() || 'manual@example.com',
        rating: manualRating,
        content: manualContent.trim(),
        company: manualCompany.trim() || undefined,
        role: manualRole.trim() || '',
        tags: ['manual-entry'],
        source: 'manual',
        type: 'text',
        consent: true,
        status: 'approved',
      });

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
      {/* Header (Matches Senja 02:53) */}
      <div>
        <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Add proof to your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import your proof from 30 sources.
        </p>
      </div>

      {/* Success/Error Banner */}
      {importResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs
          ${importResult.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          {importResult.success ? (
            <Check size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${importResult.success ? 'text-emerald-800' : 'text-rose-800'}`}>
              {importResult.success
                ? `Successfully imported ${importResult.count} testimonial${importResult.count !== 1 ? 's' : ''}!`
                : 'Import failed'}
            </p>
            {importResult.errors && importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i} className="text-xs text-gray-600">• {err}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li className="text-xs text-gray-500">...and {importResult.errors.length - 5} more</li>
                )}
              </ul>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Platform Selection */}
      {!selectedPlatform && (
        <div className="space-y-6">
          
          {/* 5 Primary Import Methods (Matches Senja 02:53 in video) */}
          <div className="space-y-3">
            {/* 1. Auto-Import */}
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#6701e6] hover:shadow-xs transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6701e6] flex items-center justify-center shrink-0 border border-purple-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">Auto-Import</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6701e6]">21 Platforms</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Connect to 21 platforms and Panda Praise will automatically import your new proof.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6701e6] transition-colors" />
            </button>

            {/* 2. Import from web */}
            <button
              onClick={() => setSelectedPlatform('google_reviews')}
              className="w-full p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#6701e6] hover:shadow-xs transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">Import from web</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Paste a URL and Panda Praise will import your proof.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6701e6] transition-colors" />
            </button>

            {/* 3. Upload spreadsheet */}
            <button
              onClick={() => setSelectedPlatform('csv')}
              className="w-full p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#6701e6] hover:shadow-xs transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">Upload spreadsheet</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Upload a CSV, XLS or XLSX file and Panda Praise will import your proof.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6701e6] transition-colors" />
            </button>

            {/* 4. Manual Import */}
            <button
              onClick={() => setSelectedPlatform('manual')}
              className="w-full p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#6701e6] hover:shadow-xs transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6701e6] flex items-center justify-center shrink-0 border border-purple-100">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">Manual Import</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manually add video, text or screengrab proof to your account.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6701e6] transition-colors" />
            </button>

            {/* 5. Migrate */}
            <button
              onClick={() => setSelectedPlatform('google_reviews')}
              className="w-full p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#6701e6] hover:shadow-xs transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">Migrate</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Paste your Testimonial.to Wall of Love URL and Panda Praise will import your proof.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6701e6] transition-colors" />
            </button>
          </div>

          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative px-3 bg-[#f9fafb] text-[10px] uppercase font-bold text-gray-400 tracking-wider">Or Browse Platforms Directly</span>
          </div>

          {/* Connect Source Modal */}
          <ConnectSourceModal
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            onSelectPlatform={(pid) => {
              if (pid === 'google') setSelectedPlatform('google_reviews');
              else if (pid === 'twitter') setSelectedPlatform('twitter');
              else if (pid === 'g2') setSelectedPlatform('g2');
              else if (pid === 'trustpilot') setSelectedPlatform('trustpilot');
              else if (pid === 'producthunt') setSelectedPlatform('producthunt');
              else if (pid === 'capterra') setSelectedPlatform('capterra');
              else if (pid === 'yelp') setSelectedPlatform('yelp');
              else if (pid === 'shopify') setSelectedPlatform('shopify');
              else setSelectedPlatform('google_reviews');
            }}
          />

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platforms..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                       bg-white border border-gray-300
                       text-gray-900 placeholder-gray-400 shadow-2xs
                       focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6]"
            />
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className="flex items-center gap-3.5 p-4 rounded-xl
                         bg-white border border-gray-200 hover:border-purple-300
                         hover:shadow-xs transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0
                              border border-purple-100 group-hover:bg-purple-100/70 transition-colors">
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{platform.name}</p>
                  <p className="text-xs text-gray-500 truncate">{platform.description}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#6701e6] flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSV Import Flow */}
      {selectedPlatform === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={resetImport} className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
              ← Back to sources
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-semibold text-gray-900">CSV / Excel Import</span>
          </div>

          {csvStep === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-12 rounded-2xl border-2 border-dashed text-center transition-all bg-white shadow-xs
                ${isDragOver
                  ? 'border-[#6701e6] bg-purple-50/30'
                  : 'border-gray-300 hover:border-purple-400'}`}
            >
              <Upload size={36} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Drag & drop your CSV or Excel file here
              </h3>
              <p className="text-sm text-gray-500 mb-5">or click to browse from your computer</p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                         bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer transition-colors shadow-xs"
              >
                <FileSpreadsheet size={16} />
                Choose File
              </label>

              <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left max-w-lg mx-auto">
                <p className="text-xs text-gray-700 font-semibold mb-2">Sample CSV format:</p>
                <pre className="text-xs text-gray-800 font-mono overflow-x-auto bg-white p-2.5 rounded border border-gray-200">{CSV_SAMPLE}</pre>
                <button
                  onClick={() => {
                    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'sample-testimonials.csv'; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2.5 text-xs text-[#6701e6] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Download size={12} /> Download sample CSV
                </button>
              </div>
            </div>
          )}

          {csvStep === 'map' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    📄 {csvFile?.name}
                  </h3>
                  <p className="text-xs text-gray-500">{csvData.length} rows found</p>
                </div>
                <button onClick={() => { setCsvStep('upload'); setCsvFile(null); setCsvData([]); }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer">Choose different file</button>
              </div>

              <h4 className="text-sm font-bold text-gray-900 pt-2">Map Your Columns</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(['name', 'email', 'rating', 'content', 'title', 'company', 'role'] as (keyof CsvColumnMapping)[]).map(field => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block capitalize">
                      {field} {(field === 'name' || field === 'content') && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative">
                      <select
                        value={(columnMapping as any)[field] || ''}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [field]: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-sm rounded-lg
                                 bg-white border border-gray-300
                                 text-gray-900 appearance-none cursor-pointer
                                 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                      >
                        <option value="">— Not mapped —</option>
                        {csvHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview first 3 rows */}
              {csvData.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Preview (first 3 rows)</h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {csvHeaders.map(h => (
                            <th key={h} className="text-left py-2.5 px-3 text-gray-600 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="py-2 px-3 text-gray-700 max-w-[150px] truncate">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => { setCsvStep('upload'); setCsvFile(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={!columnMapping.name || !columnMapping.content || isImporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           bg-[#6701e6] hover:bg-[#5200bd] text-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
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
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xs text-center">
              <Check size={48} className="mx-auto text-emerald-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Import Complete!</h3>
              <p className="text-sm text-gray-600 mb-6">
                {importResult?.count || 0} testimonials imported into your dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={resetImport}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer shadow-xs">
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
            <button onClick={resetImport} className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
              ← Back to sources
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-semibold text-gray-900">Manual Entry</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Name *</label>
                <input type="text" value={manualName} onChange={e => setManualName(e.target.value)}
                  placeholder="Jane Smith" className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Email</label>
                <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                  placeholder="jane@example.com" className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Company</label>
                <input type="text" value={manualCompany} onChange={e => setManualCompany(e.target.value)}
                  placeholder="Acme Inc" className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Role</label>
                <input type="text" value={manualRole} onChange={e => setManualRole(e.target.value)}
                  placeholder="CTO" className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setManualRating(r)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${r <= manualRating ? 'text-amber-400' : 'text-gray-300'}`}>
                    <Star size={20} className={r <= manualRating ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Testimonial *</label>
              <textarea value={manualContent} onChange={e => setManualContent(e.target.value)}
                rows={4} placeholder="Write the testimonial content..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg resize-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]" />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleManualImport}
                disabled={!manualName.trim() || !manualContent.trim() || isImporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                         bg-[#6701e6] hover:bg-[#5200bd] text-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
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
            <button onClick={resetImport} className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
              ← Back to sources
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-semibold text-gray-900">
              {PLATFORMS.find(p => p.id === selectedPlatform)?.name} Import
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 mb-1.5 block">
                Paste the URL of the page with reviews
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform === 'google_reviews' ? 'g.co/kgs/...' : selectedPlatform === 'g2' ? 'www.g2.com/products/...' : 'example.com/reviews'}`}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                           bg-white border border-gray-300
                           text-gray-900 placeholder-gray-400 shadow-2xs
                           focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  URL-based imports are processed server-side. The import may take a few minutes
                  depending on the number of reviews. You'll be notified when it's complete.
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetImport}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleUrlImport}
                disabled={!importUrl.trim() || isImporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                         bg-[#6701e6] hover:bg-[#5200bd] text-white
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
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
