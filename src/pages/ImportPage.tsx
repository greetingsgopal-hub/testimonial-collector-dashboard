import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Globe,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  X,
  Download,
  Search,
  ChevronDown,
  PenTool,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { ImportPlatform, ReviewInput, CsvColumnMapping, PLAN_LIMITS } from '../types';
import { storage } from '../lib/storage';
import { ConnectSourceModal } from '../components/dashboard/views/ConnectSourceModal';

interface ImportSourceOption {
  id: string;
  name: string;
  keywords: string[];
  icon: React.ReactNode;
  action: 'connect' | 'view';
  connectPlatform?: string;
  viewPlatform?: ImportPlatform;
}

const IMPORT_SOURCES: ImportSourceOption[] = [
  {
    id: 'google_reviews',
    name: 'Google Reviews',
    keywords: ['google', 'reviews', 'business', 'maps', 'places', 'gmb'],
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
    action: 'connect',
    connectPlatform: 'google',
  },
  {
    id: 'facebook',
    name: 'Facebook Reviews',
    keywords: ['facebook', 'reviews', 'fb', 'meta', 'page', 'recommendations'],
    icon: (
      <svg className="w-5 h-5 text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    action: 'connect',
    connectPlatform: 'facebook',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    keywords: ['linkedin', 'in', 'recommendations', 'posts', 'profile'],
    icon: (
      <svg className="w-5 h-5 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    ),
    action: 'connect',
    connectPlatform: 'linkedin',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    keywords: ['instagram', 'insta', 'ig', 'reels', 'posts', 'comments'],
    icon: (
      <svg className="w-5 h-5 text-[#E4405F] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
    action: 'connect',
    connectPlatform: 'instagram',
  },
  {
    id: 'csv',
    name: 'CSV / Excel',
    keywords: ['csv', 'excel', 'spreadsheet', 'xls', 'xlsx', 'upload', 'file'],
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    action: 'view',
    viewPlatform: 'csv',
  },
  {
    id: 'web',
    name: 'Web page',
    keywords: ['web', 'page', 'url', 'website', 'link', 'scrape', 'online'],
    icon: <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
    action: 'view',
    viewPlatform: 'google_reviews', // uses standard review URL input view
  },
  {
    id: 'manual',
    name: 'Manual testimonial',
    keywords: ['manual', 'testimonial', 'write', 'entry', 'type', 'custom'],
    icon: <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />,
    action: 'view',
    viewPlatform: 'manual',
  },
];

const CSV_SAMPLE = `name,email,rating,content,company,role
"Jane Smith","jane@example.com",5,"Amazing product! Totally transformed our workflow.","Acme Inc","CTO"
"John Doe","john@example.com",4,"Great tool, highly recommend it.","StartupXYZ","Founder"`;

export const ImportPage: React.FC = () => {
  usePageSeo({
    title: 'Import Testimonials — Panda Praise',
    description: 'Import testimonials from Google, Facebook, LinkedIn, Instagram, CSV or enter them manually.',
  });

  const { project, workspace } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<string>('google');
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

  const filteredSources = IMPORT_SOURCES.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      s.keywords.some((k) => k.toLowerCase().includes(query))
    );
  });

  const parseCsv = useCallback((text: string) => {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return;

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

    const autoMap: CsvColumnMapping = {};
    const mapField = (field: keyof CsvColumnMapping, ...aliases: string[]) => {
      const idx = headers.findIndex((h) =>
        aliases.some((a) => h.toLowerCase().replace(/[_\s-]/g, '') === a.toLowerCase().replace(/[_\s-]/g, ''))
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

  const handleFileUpload = useCallback(
    (file: File) => {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCsv(text);
      };
      reader.readAsText(file);
    },
    [parseCsv]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

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

      const reviews: ReviewInput[] = csvData
        .map((row) => ({
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
        }))
        .filter((r) => r.content.trim().length > 0);

      // Free-plan limit: "Up to 15 testimonials" (pricing page + PLAN_LIMITS).
      // Owner-initiated imports are capped; anonymous form submissions are not.
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        const remaining = maxTestimonials - existing.length;
        if (remaining <= 0) {
          setImportResult({
            success: false,
            count: 0,
            errors: [`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to import more.`],
          });
          setCsvStep('done');
          return;
        }
        if (reviews.length > remaining) {
          setImportResult({
            success: false,
            count: 0,
            errors: [
              `This CSV contains ${reviews.length} testimonials but your Free plan only has ${remaining} slots left (limit ${maxTestimonials}). Upgrade to import more.`,
            ],
          });
          setCsvStep('done');
          return;
        }
      }

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
  }, [project, workspace, csvData, columnMapping, csvHeaders]);

  const handleManualImport = useCallback(async () => {
    if (!project || !manualName.trim() || !manualContent.trim()) return;
    setIsImporting(true);

    try {
      // Free-plan limit: "Up to 15 testimonials" (pricing page + PLAN_LIMITS).
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        if (existing.length >= maxTestimonials) {
          setImportResult({
            success: false,
            count: 0,
            errors: [`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to add more.`],
          });
          return;
        }
      }
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
  }, [project, workspace, manualName, manualEmail, manualContent, manualRating, manualCompany, manualRole]);

  const handleUrlImport = useCallback(async () => {
    if (!project || !importUrl.trim()) return;
    setImportResult({
      success: false,
      count: 0,
      errors: [
        'URL-based import is not available yet. To import reviews today: upload a CSV file, or connect Google, Facebook, LinkedIn or Instagram under Integrations.',
      ],
    });
  }, [project, importUrl]);

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

  const handleSelectSource = (source: ImportSourceOption) => {
    if (source.action === 'connect' && source.connectPlatform) {
      setConnectPlatform(source.connectPlatform);
      setShowConnectModal(true);
    } else if (source.viewPlatform) {
      setSelectedPlatform(source.viewPlatform);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4">
      {/* Success/Error Banner */}
      {importResult && (
        <div
          className={`max-w-xl mx-auto mb-6 p-4 rounded-2xl border flex items-start gap-3 shadow-xs
          ${
            importResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {importResult.success ? (
            <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
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
                  <li key={i} className="text-xs text-gray-600">
                    • {err}
                  </li>
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

      {/* Main Selection View (Matches ASCII wireframe) */}
      {!selectedPlatform ? (
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
              Import Testimonials
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal">
              Bring your existing customer proof into Panda Praise
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 sm:p-7 backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a source"
                className="w-full pl-11 pr-10 py-3 text-sm rounded-xl
                         bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80
                         text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 7 Sources List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSelectSource(source)}
                  className="w-full flex items-center justify-between px-3.5 py-3.5 rounded-xl
                           hover:bg-gray-50 dark:hover:bg-gray-800/70
                           transition-all duration-150 group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700/50">
                      {source.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#6701e6] dark:group-hover:text-purple-400 transition-colors">
                      {source.name}
                    </span>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-400 dark:text-gray-500 group-hover:text-[#6701e6] dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              ))}

              {filteredSources.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No sources found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 mt-6 tracking-wide">
            All your proof. One place.
          </p>

          {/* Connect Source Modal */}
          <ConnectSourceModal
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            initialPlatform={connectPlatform}
            projectId={project?.id}
            onSelectPlatform={(pid) => {
              if (pid === 'google') setSelectedPlatform('google_reviews');
              else if (pid === 'facebook') setSelectedPlatform('facebook');
              else if (pid === 'linkedin') setSelectedPlatform('linkedin');
              else if (pid === 'instagram') setSelectedPlatform('instagram');
              else setSelectedPlatform('google_reviews');
            }}
          />
        </div>
      ) : null}

      {/* CSV Import Flow */}
      {selectedPlatform === 'csv' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to sources
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">CSV / Excel Import</span>
          </div>

          {csvStep === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-12 rounded-3xl border-2 border-dashed text-center transition-all bg-white dark:bg-gray-900 shadow-sm
                ${
                  isDragOver
                    ? 'border-[#6701e6] bg-purple-50/30'
                    : 'border-gray-200 dark:border-gray-800 hover:border-purple-400'
                }`}
            >
              <Upload size={36} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Drag & drop your CSV or Excel file here
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">or click to browse from your computer</p>
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

              <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 text-left max-w-lg mx-auto">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mb-2">Sample CSV format:</p>
                <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono overflow-x-auto bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-800">
                  {CSV_SAMPLE}
                </pre>
                <button
                  onClick={() => {
                    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sample-testimonials.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2.5 text-xs text-[#6701e6] dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Download size={12} /> Download sample CSV
                </button>
              </div>
            </div>
          )}

          {csvStep === 'map' && (
            <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">📄 {csvFile?.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{csvData.length} rows found</p>
                </div>
                <button
                  onClick={() => {
                    setCsvStep('upload');
                    setCsvFile(null);
                    setCsvData([]);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Choose different file
                </button>
              </div>

              <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-2">Map Your Columns</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(['name', 'email', 'rating', 'content', 'title', 'company', 'role'] as (keyof CsvColumnMapping)[]).map(
                  (field) => (
                    <div key={field}>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {field} {(field === 'name' || field === 'content') && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={(columnMapping as any)[field] || ''}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({ ...prev, [field]: e.target.value || undefined }))
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg
                                   bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                                   text-gray-900 dark:text-white appearance-none cursor-pointer
                                   focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                        >
                          <option value="">— Not mapped —</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Preview first 3 rows */}
              {csvData.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Preview (first 3 rows)</h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          {csvHeaders.map((h) => (
                            <th
                              key={h}
                              className="text-left py-2.5 px-3 text-gray-600 dark:text-gray-300 font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="py-2 px-3 text-gray-700 dark:text-gray-300 max-w-[150px] truncate"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setCsvStep('upload');
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
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
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <Check size={48} className="mx-auto text-emerald-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Import Complete!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {importResult?.count || 0} testimonials imported into your dashboard.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetImport}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer shadow-xs"
                >
                  Import More
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Flow */}
      {selectedPlatform === 'manual' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to sources
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Manual Testimonial</span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Email</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Company</label>
                <input
                  type="text"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  placeholder="Acme Inc"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Role</label>
                <input
                  type="text"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  placeholder="CTO"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setManualRating(r)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      r <= manualRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star size={20} className={r <= manualRating ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Testimonial *</label>
              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={4}
                placeholder="Write the testimonial content..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
              />
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

      {/* URL / Web Page Import */}
      {selectedPlatform && selectedPlatform !== 'csv' && selectedPlatform !== 'manual' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to sources
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Web Page Import</span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 block">
                Paste the URL of the page with reviews
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/reviews or https://g.co/kgs/..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                           bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           text-gray-900 dark:text-white placeholder-gray-400 shadow-2xs
                           focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  URL-based web page scraping is being rolled out. Today you can import via CSV upload, or connect
                  Google, Facebook, LinkedIn or Instagram to pull reviews directly.
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetImport}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
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
