import React from 'react';
export default function Progress({ value = 0 }: { value?: number }) { return <div className="w-full bg-gray-200 h-2 rounded"><div style={{ width: `${value}%` }} className="bg-sky-600 h-2 rounded" /></div>; }
