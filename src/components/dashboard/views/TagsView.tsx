import React, { useState } from 'react';
import { Tag as TagIcon, Plus, X, Hash } from 'lucide-react';

interface TagsViewProps {
  tags?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  tags = ['Featured', 'Customer Support', 'Ease of Use', 'Integration', 'Speed'],
  onAddTag,
  onRemoveTag,
}) => {
  const [tagList, setTagList] = useState<string[]>(tags);
  const [showInput, setShowInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const clean = newTagName.trim().replace(/^#/, '');
    if (!tagList.includes(clean)) {
      const updated = [...tagList, clean];
      setTagList(updated);
      onAddTag?.(clean);
    }
    setNewTagName('');
    setShowInput(false);
  };

  const handleRemove = (tag: string) => {
    const updated = tagList.filter(t => t !== tag);
    setTagList(updated);
    onRemoveTag?.(tag);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Organize your proof</h1>
          <p className="text-xs text-gray-500 mt-1">
            Use tags to quickly find the right testimonial for a page, feature, customer type or campaign.
          </p>
        </div>

        <button
          onClick={() => setShowInput(true)}
          className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create tag</span>
        </button>
      </div>

      {/* Tag creation input dialog */}
      {showInput && (
        <form onSubmit={handleCreate} className="p-4 bg-white border border-purple-200 rounded-2xl shadow-xs flex items-center gap-3 animate-fade-in max-w-md">
          <Hash className="w-4 h-4 text-[#6701e6]" />
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name (e.g. VIP, Enterprise, High ROI)..."
            className="flex-1 bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-[#6701e6] text-white text-xs font-bold hover:bg-[#5200bd] cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Tags List or Empty State */}
      {tagList.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
            <TagIcon className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-800">No tags yet</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Tags help you organize your testimonials. Create your first tag to get started.
          </p>
          <button
            onClick={() => setShowInput(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create new tag</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Tags ({tagList.length})</h3>
          <div className="flex flex-wrap gap-2.5">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-[#6701e6] border border-purple-200/80 hover:bg-purple-100 transition-colors"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemove(tag)}
                  className="hover:text-rose-600 transition-colors cursor-pointer ml-1"
                  title="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
