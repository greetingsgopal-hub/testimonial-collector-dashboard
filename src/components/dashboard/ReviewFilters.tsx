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
    <div className="space-y-4">
      {/* Top row: Status Tabs & View Mode & Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.key }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                  isActive ? 'bg-brand-500/20 text-brand-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action buttons: Grid/Table toggle & Export & Reset */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-zinc-500" />
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowExportMenu(false)} 
                />
                <div className="absolute right-0 mt-1 w-36 glass-panel rounded-xl border border-zinc-700 shadow-xl z-30 py-1 overflow-hidden animate-slide-up">
                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
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
            title="Reset to initial sample testimonials"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Second row: Search bar & Rating filter & Tag & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, company, or content..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <select
            value={filters.rating}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setFilters((prev) => ({ ...prev, rating: val }));
            }}
            className="glass-input w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm appearance-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">All Ratings</option>
            <option value="5" className="bg-zinc-900">5 Stars only</option>
            <option value="4" className="bg-zinc-900">4 Stars only</option>
            <option value="3" className="bg-zinc-900">3 Stars only</option>
            <option value="2" className="bg-zinc-900">2 Stars only</option>
            <option value="1" className="bg-zinc-900">1 Star only</option>
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <select
            value={filters.tag}
            onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
            className="glass-input w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm appearance-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag} className="bg-zinc-900">
                #{tag}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Sort selector */}
        <div className="relative">
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            className="glass-input w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm appearance-none cursor-pointer"
          >
            <option value="createdAt-desc" className="bg-zinc-900">Newest first</option>
            <option value="createdAt-asc" className="bg-zinc-900">Oldest first</option>
            <option value="rating-desc" className="bg-zinc-900">Highest rated</option>
            <option value="rating-asc" className="bg-zinc-900">Lowest rated</option>
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
