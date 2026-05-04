/*
* doc: https://nhn.github.io/tui.editor/latest/
* */

import React, {useEffect, useRef, memo} from "react";
// @ts-expect-error 该包无 TypeScript 类型定义
import Editor from '@toast-ui/editor';
import '@toast-ui/chart/dist/toastui-chart.css';
import chart from '@toast-ui/editor-plugin-chart';
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
// @ts-expect-error 该包无 TypeScript 类型定义
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js';
import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import '@toast-ui/editor-plugin-table-merged-cell/dist/toastui-editor-plugin-table-merged-cell.css';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import uml from '@toast-ui/editor-plugin-uml';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/zh-cn';

interface IEditorProps {
    getMarkdown: () => string;
    getHtml: () => string;
    setMarkdown: (markdown: string) => void;
    setHtml: (html: string) => void;
    destroy: () => void;
}

interface IToastUIEditorProps {
    style?: React.CSSProperties;
    value: string;
    onChange?: (markdown: string) => void;
}

const ToastUIEditor: React.FC<IToastUIEditorProps> = (props) => {
    const {
        style,
        value,
        onChange,
    } = props;
    const editorDomRef = useRef<HTMLDivElement | null>(null);
    const editorInsRef = useRef<IEditorProps>({} as IEditorProps);
    // 标记 value 变化是否来自编辑器自身（用户输入），避免重复 setMarkdown 导致光标跳转
    const isInternalChangeRef = useRef(false);

    useEffect(() => {
        editorInsRef.current = new Editor({
            el: editorDomRef.current,
            height: style?.height || '400px',
            // Initial editor type (markdown, wysiwyg)
            initialEditType: 'wysiwyg',
            initialValue: value,
            previewStyle: 'vertical',
            usageStatistics: 'https://github.com/ZhangYiBo1998/cloud-note-react-vite-ts',
            language: 'zh-CN',
            plugins: [
                codeSyntaxHighlight,
                chart,
                colorSyntax,
                tableMergedCell,
                uml,
            ],
            events: {
                change: () => {
                    isInternalChangeRef.current = true;
                    onChange?.(editorInsRef.current.getMarkdown())
                }
            },
        });

        return () => {
            editorInsRef.current.destroy();
        }
    }, []);

    // 仅外部 value 变化时（切换笔记）同步编辑器内容，跳过编辑器自身触发的变更
    useEffect(() => {
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            return;
        }
        if (editorInsRef.current?.setMarkdown) {
            editorInsRef.current.setMarkdown(value);
        }
    }, [value]);


    return (
        <div ref={editorDomRef} style={style} />
    );
};

export default memo(ToastUIEditor);