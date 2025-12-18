import React from 'react';
export default function Toggle({ checked, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) { return <input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />; }
