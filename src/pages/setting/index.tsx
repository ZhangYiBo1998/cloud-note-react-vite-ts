/**
 * 设置页组件
 *
 * 提供：外观主题、开机自启、关闭行为、存档目录、Git 仓库地址、备份配置。
 * Git 地址通过 git remote get-url origin 动态获取，不依赖 config.json 缓存。
 */
import React, {useEffect, memo, useState, useContext, useCallback} from "react";
import {Card, Switch, Form, Input, Button, Modal, Flex, Typography, message, Space, Select} from 'antd';
import {
    EllipsisOutlined,
    EditOutlined,
    SaveOutlined,
    CloudUploadOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {
    SettingsContext,
    ConfigContext,
} from "../../utils/context";
import useNoteInfo from "../hooks/useNoteInfo";
import type {BackupState} from "../../types/global";

const {Title} = Typography;

const Setting: React.FC = () => {
    const {settings, setSettings} = useContext(SettingsContext);
    const {config, setConfig} = useContext(ConfigContext);
    const {
        saveDirectory,
    } = useNoteInfo();

    /** 重新从主进程加载配置，同步 React state 与磁盘 */
    const refreshConfig = async () => {
        const result = await window.electronAPI?.getConfigJsonAsync();
        if (result?.success && result.data) setConfig(result.data);
    };

    const [form] = Form.useForm()
    /** 开机自启状态 */
    const [autoLaunchValue, setAutoLaunchValue] = useState(false);
    /** Git URL 输入框编辑模式开关 */
    const [editDisable, setEditDisable] = useState(true);
    /** Git URL 保存 loading 状态 */
    const [saving, setSaving] = useState(false);
    /** 从 git remote 获取的真实 URL（优先于 config 缓存） */
    const [gitRemoteUrl, setGitRemoteUrl] = useState('');
    /** 备份状态 */
    const [backupState, setBackupState] = useState<BackupState>({
        lastBackupTime: null,
        nextBackupTime: null,
        backupInProgress: false,
        backupCount: 0,
    });
    /** 手动备份 loading */
    const [backingUp, setBackingUp] = useState(false);

    const gitUrl = gitRemoteUrl;

    // 挂载时获取当前开机自启状态
    useEffect(() => {
        window.electronAPI?.getAutoLaunch()?.then((result) => {
            if (result?.success) setAutoLaunchValue(result.data ?? false);
        })
    }, []);

    // 挂载时从 git remote 获取真实仓库地址
    useEffect(() => {
        window.electronAPI?.getGitRemoteUrlAsync().then((result) => {
            if (result?.success) setGitRemoteUrl(result.data || '');
        });
    }, []);

    // 挂载时获取备份状态
    useEffect(() => {
        window.electronAPI?.getBackupStatusAsync().then((result) => {
            if (result?.success) setBackupState(result.data!);
        });
    }, []);

    // 同步 gitUrl 到表单
    useEffect(() => {
        form.setFieldValue('gitUrl', gitUrl);
    }, [gitUrl, form]);

    const setAutoLaunchHandler = (checked: boolean) => {
        setAutoLaunchValue(checked);
        window.electronAPI?.setAutoLaunch(checked)
    }

    /** 打开系统目录选择器，选中的路径持久化到 config.json */
    const selectSaveDirectory = async () => {
        const result = await window.electronAPI?.selectSaveDirectory(saveDirectory);
        if (result?.success && result.data) {
            await window.electronAPI?.updateConfigJsonAsync({ saveDirectory: result.data });
            await refreshConfig();
        }
    }

    /**
     * 保存 Git 仓库地址
     * 调用 initGitHubAsync 初始化/切换远程 origin，成功后更新本地状态
     */
    const saveGitUrl = async () => {
        const newGitUrl = form.getFieldValue('gitUrl')?.trim();
        if (!newGitUrl) return;

        Modal.confirm({
            title: '提示',
            content: '修改仓库地址后，笔记将同步到新的 Git 仓库。确认修改？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                setSaving(true);
                try {
                    const result = await window.electronAPI?.initGitHubAsync(newGitUrl);
                    if (result?.success) {
                        setGitRemoteUrl(newGitUrl);
                        message.success('Git 仓库地址已更新');
                        setEditDisable(true);
                    } else {
                        throw new Error(result?.error || '初始化仓库失败');
                    }
                } catch (err) {
                    console.error('修改 Git 仓库地址失败:', err);
                    message.error('修改失败，请检查地址是否正确');
                    form.setFieldValue('gitUrl', gitUrl);
                } finally {
                    setSaving(false);
                }
            },
            onCancel: () => {
                setEditDisable(true);
                form.setFieldValue('gitUrl', gitUrl);
            }
        })
    }

    /** 打开备份目录选择器，保存后刷新 React 配置状态 */
    const selectBackupDirectory = async () => {
        const result = await window.electronAPI?.selectSaveDirectory(config.backupDirectory);
        if (result?.success && result.data) {
            await window.electronAPI?.updateConfigJsonAsync({ backupDirectory: result.data });
            await refreshConfig();
        }
    }

    /** 手动触发一次完整备份 */
    const backupNow = async () => {
        setBackingUp(true);
        try {
            const result = await window.electronAPI?.performBackupAsync();
            if (result?.success) {
                message.success('备份完成');
                // 刷新备份状态
                const statusResult = await window.electronAPI?.getBackupStatusAsync();
                if (statusResult?.success) setBackupState(statusResult.data!);
            } else {
                message.error(result?.error || '备份失败');
            }
        } catch {
            message.error('备份失败');
        } finally {
            setBackingUp(false);
        }
    }

    return (
        <div className="scrollable" style={{ height: '100%', background: 'var(--content-bg, #ffffff)', padding: 24 }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Title level={4} style={{ marginBottom: 24 }}>设置</Title>
                <Card variant="borderless" style={{ borderRadius: 10 }}>
                    <Form form={form} layout="vertical">
                        {/* 外观主题切换 */}
                        <Form.Item label="外观主题" style={{ marginBottom: 16 }}>
                            <Flex align="center" gap={12}>
                                <Switch
                                    checked={settings.theme === 'dark'}
                                    onChange={(checked) => setSettings({...settings, theme: checked ? 'dark' : 'light'})}
                                />
                                <Typography.Text type="secondary">
                                    {settings.theme === 'dark' ? '深色模式' : '浅色模式'}
                                </Typography.Text>
                            </Flex>
                        </Form.Item>
                        {/* 开机自启 */}
                        <Form.Item label="开机自启" style={{ marginBottom: 16 }}>
                            <Switch value={autoLaunchValue} onChange={setAutoLaunchHandler}/>
                        </Form.Item>
                        {/* 关闭时最小化到托盘 */}
                        <Form.Item label="关闭应用时最小化到系统托盘" style={{ marginBottom: 16 }}>
                            <Switch value={settings.closeType === 'hide'}
                                    onChange={(checked) => setSettings({...settings, closeType: checked ? 'hide' : 'quit'})}/>
                        </Form.Item>
                        {/* 存档目录选择 */}
                        <Form.Item label="指定存档文件夹" style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={saveDirectory} readOnly style={{ height: 32 }} />
                                <Button icon={<EllipsisOutlined />} onClick={selectSaveDirectory} />
                            </Space.Compact>
                        </Form.Item>
                        {/* Git 仓库地址 */}
                        <Form.Item label="Git 仓库地址" style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Form.Item name="gitUrl" noStyle>
                                    <Input disabled={editDisable} placeholder="请输入 Git 仓库地址" style={{ height: 32 }} />
                                </Form.Item>
                                {editDisable
                                    ? <Button icon={<EditOutlined />} onClick={() => setEditDisable(false)} />
                                    : <Button icon={<SaveOutlined />} onClick={saveGitUrl} loading={saving} />
                                }
                            </Space.Compact>
                        </Form.Item>
                        {/* 本地备份目录 */}
                        <Form.Item label="本地备份目录" style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={config.backupDirectory || ''} readOnly placeholder="选择备份存放目录" style={{ height: 32 }} />
                                <Button icon={<EllipsisOutlined />} onClick={selectBackupDirectory} />
                                <Button icon={<CloseOutlined />} onClick={async () => {
                                    await window.electronAPI?.updateConfigJsonAsync({ backupDirectory: '', backupIntervalMinutes: 0 });
                                    await refreshConfig();
                                }} disabled={!config.backupDirectory} />
                            </Space.Compact>
                        </Form.Item>
                        {/* 备份间隔 */}
                        <Form.Item label="自动备份间隔" style={{ marginBottom: 16 }}>
                            <Flex align="center" gap={12}>
                                <Select
                                    style={{ width: 160 }}
                                    value={config.backupDirectory ? (config.backupIntervalMinutes || 0) : 0}
                                    disabled={!config.backupDirectory}
                                    onChange={async (value) => {
                                        await window.electronAPI?.updateConfigJsonAsync({ backupIntervalMinutes: value });
                                        await refreshConfig();
                                    }}
                                    options={[
                                        { label: '禁用', value: 0 },
                                        { label: '15 分钟', value: 15 },
                                        { label: '30 分钟', value: 30 },
                                        { label: '1 小时', value: 60 },
                                        { label: '6 小时', value: 360 },
                                        { label: '12 小时', value: 720 },
                                        { label: '24 小时', value: 1440 },
                                    ]}
                                />
                                <Button
                                    icon={<CloudUploadOutlined />}
                                    onClick={backupNow}
                                    loading={backingUp}
                                    disabled={!config.backupDirectory}
                                >
                                    立即备份
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default memo(Setting);
