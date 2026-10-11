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
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3.5 shadow-sm font-sans">
      
      {/* ── Top Row: Segmented Capsule Navigation & View Toggle / Export ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Luminous Segmented Capsule Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.key }))}
                className={`apple-touch shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.key === 'pending' && tab.count > 0
                    ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
              className={`apple-touch p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
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
              className={`apple-touch p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
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
              className="apple-touch flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
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
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1 overflow-hidden animate-slide-up">
                  <button
                    type="button"
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
            className="apple-touch p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Search & Fast Filter Row ── */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Full-width Search Bar with Tune Button */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, customer name, role..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs placeholder:text-slate-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Toggle fast filter pills"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Pills Sub-bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Rating Pill Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.rating}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setFilters((prev) => ({ ...prev, rating: val }));
              }}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 focus:outline-none cursor-pointer"
            >
              <option value="all">Rating: All Ratings</option>
              <option value="5">Rating: 5★ only</option>
              <option value="4">Rating: 4★ & up</option>
              <option value="3">Rating: 3★ only</option>
              <option value="2">Rating: 2★ only</option>
              <option value="1">Rating: 1★ only</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tags Pill Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.tag}
              onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 focus:outline-none cursor-pointer"
            >
              <option value="all">Tags: All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Pill Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.source || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 focus:outline-none cursor-pointer"
            >
              <option value="all">Source: All Sources</option>
              <option value="form">Source: Direct Form</option>
              <option value="manual">Source: Manual Entry</option>
              <option value="import">Source: Imported</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Pill Dropdown */}
          <div className="relative shrink-0">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 focus:outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Sort: Newest first</option>
              <option value="createdAt-asc">Sort: Oldest first</option>
              <option value="rating-desc">Sort: Highest rated</option>
              <option value="rating-asc">Sort: Lowest rated</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReviewFilters;
