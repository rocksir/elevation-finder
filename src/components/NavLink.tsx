import React from 'react';
import { Link } from 'react-router-dom';

export default function NavLink({ to, children, className = '' }: { to: string; children?: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={`px-2 py-1 rounded hover:underline ${className}`}>
      {children}
    </Link>
  );
}
