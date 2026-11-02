import { useId } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { richTextClass, toHtml } from '../utils/richText';

interface Props {
  label: string;
  value: string;
  onChange: (html: string) => void;
}

const buttonClass = (active: boolean) =>
  `rounded border px-2.5 py-1 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700 ${
    active
      ? 'border-slate-800 bg-slate-800 text-white'
      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  }`;

export default function RichTextEditor({ label, value, onChange }: Props) {
  const uid = useId();

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: toHtml(value),
    shouldRerenderOnTransaction: true, // keeps the toolbar highlights up to date
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': `${uid}-label`,
        class: `min-h-40 px-3 py-2 focus:outline-none ${richTextClass}`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  if (!editor) return null;

  const tools = [
    { label: 'Bold', hint: 'Ctrl+B', active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run(), text: 'B' },
    { label: 'Italic', hint: 'Ctrl+I', active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run(), text: 'I' },
    { label: 'Heading', hint: 'Ctrl+Alt+2', active: editor.isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), text: 'H2' },
    { label: 'Bulleted list', hint: 'Ctrl+Shift+8', active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run(), text: '• List' },
    { label: 'Numbered list', hint: 'Ctrl+Shift+7', active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run(), text: '1. List' },
    { label: 'Quote', hint: 'Ctrl+Shift+B', active: editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run(), text: '❝' },
  ];

  return (
    <div>
      <span id={`${uid}-label`} className="mb-1 block text-sm font-medium">
        {label}
      </span>

      <div className="rounded-md border border-slate-300 bg-white focus-within:outline focus-within:outline-2 focus-within:outline-amber-700">
        <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-1 border-b border-slate-200 p-2">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button" // never submit the surrounding form
              onClick={t.run}
              aria-pressed={t.active}
              aria-label={t.label}
              title={`${t.label} (${t.hint})`}
              className={buttonClass(t.active)}
            >
              {t.text}
            </button>
          ))}
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} aria-label="Undo" title="Undo (Ctrl+Z)" className={`${buttonClass(false)} disabled:opacity-40`}>↶</button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" className={`${buttonClass(false)} disabled:opacity-40`}>↷</button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <p className="mt-1 text-xs text-slate-600">
        Enter starts a new paragraph; Shift+Enter starts a new line.
      </p>
    </div>
  );
}