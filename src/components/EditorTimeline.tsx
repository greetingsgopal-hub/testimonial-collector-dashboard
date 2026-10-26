// Timeline with skeleton, optimistic, interruptible
export const EditorTimeline = ({ duration = 19, trim, setTrim }: any) => {
  return (
    <div 
      className="space-y-2 cursor-pointer"
      onClick={(e) => {
        if (!setTrim) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickRatio = (e.clientX - rect.left) / rect.width;
        const clickTime = Math.round(clickRatio * duration);
        setTrim([Math.min(trim[0], clickTime), Math.max(trim[1], clickTime)]);
      }}
    >
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-150" 
          style={{ 
            width: `${((trim[1] - trim[0]) / duration) * 100}%`, 
            marginLeft: `${(trim[0] / duration) * 100}%` 
          }} 
        />
      </div>
    </div>
  );
};

export default EditorTimeline;
