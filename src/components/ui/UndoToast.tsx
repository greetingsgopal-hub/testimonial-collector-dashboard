
import { useState } from "react";
// Idempotency + Undo pattern
export const UndoToast = ({ onUndo }: { onUndo: () => void }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white text-black px-4 py-2 text-[13px] font-medium flex gap-3 items-center shadow-xl">
      <span>Action done</span>
      <button onClick={() => { onUndo(); setVisible(false); }} className="px-3 py-1 rounded-full bg-black text-white text-[12px]">Undo</button>
    </div>
  );
};
