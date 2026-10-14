import React, { useState } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Download, 
  RotateCcw, 
  ChevronDown,
  SlidersHorizontal
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusTabs: { key: ReviewStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pendingCount },
    { key: 'approved', label: 'Approved', count: stats.approvedCount },
    { key: 'rejected', label: 'Rejected', count: stats.rejectedCount },
    { key: 'archived', label: 'Archived', count: stats.archivedCount },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xs font-sans">
      
      {/* ── Top Row: Status Pills & View Toggle / Export ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.key }))}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold shadow-2xs border border-purple-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-semibold shadow-2xs'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.key === 'pending' && tab.count > 0
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Export Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          {/* View Mode */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowExportMenu(false)} 
                />
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1 overflow-hidden animate-slide-up">
                  <button
                    type="button"
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={onResetSeedData}
            title="Reset sample data"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Search & Fast Filter Row ── */}
      <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Full-width Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, customer name, role..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-2xs placeholder:text-slate-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
            title="Toggle fast filter pills"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Row: Rating, Tags, Source, Sort Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Rating Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.rating}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setFilters((prev) => ({ ...prev, rating: val }));
              }}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer shadow-2xs"
            >
              <option value="all">Rating: All Ratings</option>
              <option value="5">Rating: 5★ only</option>
              <option value="4">Rating: 4★ & up</option>
              <option value="3">Rating: 3★ only</option>
              <option value="2">Rating: 2★ only</option>
              <option value="1">Rating: 1★ only</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tags Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.tag}
              onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer shadow-2xs"
            >
              <option value="all">Tags: All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.source || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer shadow-2xs"
            >
              <option value="all">Source: All Sources</option>
              <option value="form">Source: Direct Form</option>
              <option value="manual">Source: Manual Entry</option>
              <option value="import">Source: Imported</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer shadow-2xs"
            >
              <option value="createdAt-desc">Sort: Newest first</option>
              <option value="createdAt-asc">Sort: Oldest first</option>
              <option value="rating-desc">Sort: Highest rated</option>
              <option value="rating-asc">Sort: Lowest rated</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReviewFilters;
