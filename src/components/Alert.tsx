"use client";

export default function Alert({ children }: { children?: React.ReactNode }) {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">{children || 'Alert placeholder'}</div>
  );
}
