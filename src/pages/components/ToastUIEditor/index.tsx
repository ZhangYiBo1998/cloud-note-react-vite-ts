/*
* doc: https://nhn.github.io/tui.editor/latest/
* */

import React, {useEffect, useRef, memo} from "react";
// @ts-expect-error 隐藏ts错误
import Editor from '@toast-ui/editor';
import '@toast-ui/chart/dist/toastui-chart.css';
import chart from '@toast-ui/editor-plugin-chart';
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
// @ts-expect-error 隐藏ts错误
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
                    onChange?.(editorInsRef.current.getMarkdown())
                }
            },
        });

        // 获取markdown内容：editorInsRef.current.getMarkdown();
        // 获取html内容：editorInsRef.current.getHtml();
        // 设置markdown内容：editorInsRef.current.setMarkdown('new markdown text');
        // 设置html内容：editorInsRef.current.setHtml('new html text');

        return () => {
            editorInsRef.current.destroy();
        }
    }, []);


    return (
        <div ref={editorDomRef} style={style} />
    );
};

export default memo(ToastUIEditor);