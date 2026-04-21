import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Heading1, Heading2, 
  AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Code, Strikethrough
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = 'Tuliskan gagasan pergerakanmu di sini...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Masukkan URL Gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt('Masukkan URL Link:');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const MenuButton = ({ onClick, isActive, disabled, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-surface transition-colors",
        isActive ? "bg-primary text-white hover:bg-primary/90" : "text-muted",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-line rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-shadow">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-line bg-surface/30">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          title="Tebal"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          title="Miring"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive('underline')}
          title="Garis Bawah"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive('strike')}
          title="Coret"
        >
          <Strikethrough className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          isActive={editor.isActive('code')}
          title="Kode"
        >
          <Code className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-line mx-1"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          title="Judul 1"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          title="Judul 2"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-line mx-1"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive('bulletList')}
          title="Daftar Bulat"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive('orderedList')}
          title="Daftar Angka"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive('blockquote')}
          title="Kutipan"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-line mx-1"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()} 
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Rata Kiri"
        >
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Rata Tengah"
        >
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()} 
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Rata Kanan"
        >
          <AlignRight className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-line mx-1"></div>

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Tambah Link">
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Tambah Gambar">
          <ImageIcon className="h-4 w-4" />
        </MenuButton>

        <div className="flex-1"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto w-full prose prose-sm max-w-none prose-primary focus:outline-none scroll-smooth">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
