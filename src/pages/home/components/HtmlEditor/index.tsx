/**
 * TipTap 富文本 HTML 编辑器
 *
 * 基于 ProseMirror 的 WYSIWYG 编辑器，支持格式化工具栏。
 * 通过 editor.getHTML() 获取内容，onChange 回调实时通知父组件。
 * 自动适配亮色/暗色主题。
 */
import React, { memo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import { Button, Space } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

interface HtmlEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  style?: React.CSSProperties;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ value, onChange, style }) => {
  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 200px; padding: 16px;',
      },
    },
  });

  // 外部 value 变化时同步编辑器内容（切换笔记）
  React.useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const toggleStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);
  const toggleH2 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleH3 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 3 }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);

  return (
    <div style={style}>
      {/* 格式化工具栏 */}
      <div className="html-editor-toolbar" style={{
        border: '1px solid var(--border-color, #d2d2d7)',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        padding: '6px 8px',
        background: 'var(--sidebar-bg, #fafafa)',
        display: 'flex',
        flexWrap: 'wrap',
      }}>
        <Space size={2} wrap>
          <Button
            type={editor?.isActive('bold') ? 'primary' : 'text'}
            size="small"
            icon={<BoldOutlined />}
            onClick={toggleBold}
          />
          <Button
            type={editor?.isActive('italic') ? 'primary' : 'text'}
            size="small"
            icon={<ItalicOutlined />}
            onClick={toggleItalic}
          />
          <Button
            type={editor?.isActive('underline') ? 'primary' : 'text'}
            size="small"
            icon={<UnderlineOutlined />}
            onClick={toggleUnderline}
          />
          <Button
            type={editor?.isActive('strike') ? 'primary' : 'text'}
            size="small"
            icon={<StrikethroughOutlined />}
            onClick={toggleStrike}
          />
          <span style={{ width: 1, height: 20, background: 'var(--border-color, #d2d2d7)', margin: '0 4px', alignSelf: 'center' }} />
          <Button
            type={editor?.isActive('heading', { level: 2 }) ? 'primary' : 'text'}
            size="small"
            onClick={toggleH2}
            style={{ fontWeight: 600, fontSize: 13 }}
          >
            H2
          </Button>
          <Button
            type={editor?.isActive('heading', { level: 3 }) ? 'primary' : 'text'}
            size="small"
            onClick={toggleH3}
            style={{ fontWeight: 600, fontSize: 12 }}
          >
            H3
          </Button>
          <span style={{ width: 1, height: 20, background: 'var(--border-color, #d2d2d7)', margin: '0 4px', alignSelf: 'center' }} />
          <Button
            type={editor?.isActive('bulletList') ? 'primary' : 'text'}
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={toggleBulletList}
          />
          <Button
            type={editor?.isActive('orderedList') ? 'primary' : 'text'}
            size="small"
            icon={<OrderedListOutlined />}
            onClick={toggleOrderedList}
          />
          <Button
            type={editor?.isActive('blockquote') ? 'primary' : 'text'}
            size="small"
            onClick={toggleBlockquote}
          >
            "
          </Button>
        </Space>
      </div>
      {/* 编辑器内容区 */}
      <div style={{
        border: '1px solid var(--border-color, #d2d2d7)',
        borderRadius: '0 0 8px 8px',
        overflow: 'auto',
        height: style?.height ? `calc(${typeof style.height === 'number' ? style.height + 'px' : style.height} - 50px)` : 'auto',
        background: 'var(--content-bg, #ffffff)',
        color: 'var(--text-primary, #1d1d1f)',
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default memo(HtmlEditor);
