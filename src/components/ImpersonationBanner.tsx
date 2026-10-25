export const ImpersonationBanner = ({ store }: { store: string }) => {
  return (
    <div className="h-10 bg-[#FFE600] text-black text-sm font-semibold flex items-center justify-between px-4 z-50">
      <span>⚠️ Impersonating {store} — actions are logged</span>
      <button onClick={() => { const u = new URL(window.location.href); u.searchParams.delete('impersonate'); window.location.href = u.toString(); }} className="underline cursor-pointer">Exit Impersonation [X]</button>
    </div>
  );
};
