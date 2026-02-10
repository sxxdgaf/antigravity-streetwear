"use client";

export default function Card({ children }: { children?: React.ReactNode }) {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">{children || 'Card placeholder'}</div>
  );
}
