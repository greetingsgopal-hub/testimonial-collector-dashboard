import React from 'react';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Download, 
  RotateCcw, 
  ChevronDown
} from 'lucide-react';
import { ReviewFilters as FilterType, ReviewStatus, ReviewStats } from '../../types';

interface ReviewFiltersProps {
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  stats: ReviewStats;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onResetSeedData: () => void;
  availableTags: string[];
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  setFilters,
  stats,
  viewMode,
  setViewMode,
  onExportJSON,
  onExportCSV,
  onResetSeedData,
  availableTags,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const statusTabs: { key: ReviewStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All Reviews', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pendingCount },
    { key: 'approved', label: 'Approved', count: stats.approvedCount },
    { key: 'rejected', label: 'Rejected', count: stats.rejectedCount },
    { key: 'archived', label: 'Archived', count: stats.archivedCount },
  ];

  return (
    <div className="apple-glass-card p-3.5 sm:p-4 space-y-3 font-sans">
      {/* Top row: Status Segmented Control & View Mode & Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Apple Segmented Status Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.key }))}
                className={`apple-touch flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action controls: View toggle & Export & Reset */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('grid')}
              className={`apple-touch p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`apple-touch p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="apple-touch apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowExportMenu(false)} 
                />
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl border border-slate-200 shadow-xl z-30 py-1 overflow-hidden animate-slide-up">
                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Reset sample data */}
          <button
            onClick={onResetSeedData}
            title="Reset sample data"
            className="apple-touch apple-btn-secondary p-1.5 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Second row: Search & Inline Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, company, or text..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-900 placeholder-slate-400 shadow-2xs transition-all"
          />
        </div>

        {/* Sort selector */}
        <div className="relative md:col-span-2">
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="rating-desc">Highest rated</option>
            <option value="rating-asc">Lowest rated</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Rating Filter */}
        <div className="relative md:col-span-2">
          <select
            value={filters.rating}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setFilters((prev) => ({ ...prev, rating: val }));
            }}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Tag Filter */}
        <div className="relative md:col-span-1.5 sm:col-span-2">
          <select
            value={filters.tag}
            onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Source Filter */}
        <div className="relative md:col-span-1.5 sm:col-span-1">
          <select
            value={filters.source || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-white border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="form">Direct Form</option>
            <option value="manual">Manual Entry</option>
            <option value="import">Imported</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
export default ReviewFilters;
