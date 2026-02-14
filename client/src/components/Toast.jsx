import { useEffect } from "react";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-emerald-600"
      : "bg-slate-800";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[999]">
      <div className={`${bg} text-white px-5 py-3 rounded-full shadow-soft`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
