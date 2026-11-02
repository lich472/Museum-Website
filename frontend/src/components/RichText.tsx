import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { richTextClass, toHtml } from '../utils/richText';

export default function RichText({ html, className = '' }: { html?: string; className?: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(toHtml(html)), [html]);
  return <div className={`${richTextClass} ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}