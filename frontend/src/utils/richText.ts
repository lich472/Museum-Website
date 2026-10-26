export const richTextClass =
  '[&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 ' +
  '[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 ' +
  '[&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-700 [&_a]:underline';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toHtml(text: string | null | undefined): string {
  const value = text ?? '';
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value; // already HTML
  return value
    .split(/\n{2,}/)
    .filter((part) => part.trim())
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function stripHtml(html: string | null | undefined): string {
  const doc = new DOMParser().parseFromString(toHtml(html), 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}