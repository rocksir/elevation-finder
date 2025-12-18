import React from 'react';
export default function ScrollArea({ children }: { children?: React.ReactNode }) { return <div style={{ overflow: 'auto' }}>{children}</div>; }
