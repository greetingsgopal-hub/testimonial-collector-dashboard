import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { FormsView, FormsViewProps } from './FormsView';
import { ImportPage } from '../../../pages/ImportPage';

export interface CollectImportViewProps extends FormsViewProps {
  initialSubTab?: 'collect' | 'import';
}

export const CollectImportView: React.FC<CollectImportViewProps> = ({
  initialSubTab = 'collect',
  onConfigureForm,
  onSendInvites,
  onViewProof,
  onUpdateForm,
  onNavigateToCampaigns,
  onNavigateToWidgets,
  reviews = [],
  stats,
}) => {
  const [subTab, setSubTab] = useState<'collect' | 'import'>(initialSubTab);

  return (
    <div className="max-w-6xl mx-auto space-y-4 font-sans">
      {/* Segmented Sub-Tab Switcher */}
      <div className="flex items-center justify-center pt-1 pb-1">
        <div 
          data-testid="collect-import-switcher"
          className="inline-flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60 shadow-2xs"
        >
          <button
            type="button"
            data-testid="switch-to-collect"
            onClick={() => setSubTab('collect')}
            className={`apple-touch flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'collect'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${subTab === 'collect' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
            <span>Collection Form</span>
          </button>

          <button
            type="button"
            data-testid="switch-to-import"
            onClick={() => setSubTab('import')}
            className={`apple-touch flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className={`w-3.5 h-3.5 ${subTab === 'import' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
            <span>Import Praise</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      {subTab === 'collect' ? (
        <FormsView
          onConfigureForm={onConfigureForm}
          onSendInvites={onSendInvites}
          onViewProof={onViewProof}
          onUpdateForm={onUpdateForm}
          onNavigateToCampaigns={onNavigateToCampaigns}
          onNavigateToWidgets={onNavigateToWidgets}
          reviews={reviews}
          stats={stats}
        />
      ) : (
        <div className="max-w-5xl mx-auto animate-fade-in">
          <ImportPage onViewProof={onViewProof} />
        </div>
      )}
    </div>
  );
};
