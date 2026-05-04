/**
 * Milkdown Crepe 编辑器封装
 *
 * Crepe 是 Milkdown 官方预置编辑器，内置工具栏、斜杠命令、悬浮菜单等。
 * 基于 ProseMirror 内核（与 TipTap 同源），WYSIWYG 实时预览。
 */
import React, { useEffect, useRef, memo } from "react";
import { MilkdownProvider, Milkdown, useEditor } from "@milkdown/react";
import { Crepe, CrepeFeature } from "@milkdown/crepe";
import { replaceAll } from "@milkdown/kit/utils";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface IMilkdownEditorProps {
    style?: React.CSSProperties;
    value: string;
    onChange?: (markdown: string) => void;
}

const MilkdownEditorInner: React.FC<IMilkdownEditorProps> = ({ value, onChange, style }) => {
    const isInternalChangeRef = useRef(false);

    const { loading, get: getEditor } = useEditor((root) => {
        const crepe = new Crepe({
            root,
            defaultValue: value,
            featureConfigs: {
                [CrepeFeature.BlockEdit]: {
                    handleDragIcon: '',
                },
            },
        });

        // 监听内容变更
        crepe.on((api) => {
            api.markdownUpdated((_ctx, markdown) => {
                isInternalChangeRef.current = true;
                onChange?.(markdown);
            });
        });

        return crepe;
    }, []);

    // 外部 value 变化时同步到编辑器
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (loading) return;
        const editor = getEditor();
        if (!editor) return;

        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            prevValueRef.current = value;
            return;
        }

        if (value !== prevValueRef.current) {
            prevValueRef.current = value;
            editor.action(replaceAll(value) as any);
        }
    }, [value, loading]);

    // 组件卸载时销毁编辑器
    useEffect(() => {
        return () => {
            const editor = getEditor();
            editor?.destroy();
        };
    }, []);

    return (
        <div style={{ ...style, overflow: 'auto' }} className="milkdown-editor">
            <style>{`.milkdown-block-handle > .operation-item:last-child { display: none !important; }`}</style>
            <Milkdown />
        </div>
    );
};

const MilkdownEditor: React.FC<IMilkdownEditorProps> = (props) => {
    return (
        <MilkdownProvider>
            <MilkdownEditorInner {...props} />
        </MilkdownProvider>
    );
};

export default memo(MilkdownEditor);
