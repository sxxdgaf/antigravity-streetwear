"use client";

import React from 'react';

interface SortSelectProps {
  slug: string;
  current?: string | null;
}

export default function SortSelect({ slug, current }: SortSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('sort', value);
    } else {
      url.searchParams.delete('sort');
    }
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  return (
    <select
      name="sort"
      defaultValue={current || 'newest'}
      onChange={handleChange}
      className="px-3 py-2 border border-brand-grey-200 rounded-lg text-sm bg-white"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
    </select>
  );
}
