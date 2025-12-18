import React from 'react';
export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`p-2 border rounded ${props.className ?? ''}`} />; }
