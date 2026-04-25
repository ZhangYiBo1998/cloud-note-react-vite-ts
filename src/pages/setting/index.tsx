import React, {useEffect, memo, useState, useContext} from "react";
import {Card, Switch, Form, Input, Button, Modal, Flex, Typography, message, Space} from 'antd';
import {
    EllipsisOutlined,
    EditOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import {
    SettingsContext,
} from "../../utils/context";
import useNoteInfo from "../hooks/useNoteInfo";

const {Title} = Typography;

const Setting: React.FC = () => {
    const {settings, setSettings} = useContext(SettingsContext);
    const {
        saveDirectory,
    } = useNoteInfo();

    const [form] = Form.useForm()
    const [autoLaunchValue, setAutoLaunchValue] = useState(false);
    const [editDisable, setEditDisable] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gitRemoteUrl, setGitRemoteUrl] = useState('');

    const gitUrl = gitRemoteUrl;

    useEffect(() => {
        window.electronAPI.getAutoLaunch().then(enabled => {
            setAutoLaunchValue(enabled)
        })
    }, []);

    useEffect(() => {
        window.electronAPI?.getGitRemoteUrlAsync().then((url) => {
            setGitRemoteUrl(url || '');
        });
    }, []);

    useEffect(() => {
        form.setFieldValue('gitUrl', gitUrl);
    }, [gitUrl, form]);

    const setAutoLaunchHandler = (checked: boolean) => {
        setAutoLaunchValue(checked);
        window.electronAPI?.setAutoLaunch(checked)
    }

    const selectSaveDirectory = async () => {
        const dir = await window.electronAPI?.selectSaveDirectory(saveDirectory);
        if (dir) {
            window.electronAPI?.updateConfigJsonAsync({
                saveDirectory: dir
            });
        }
    }

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
                    await window.electronAPI?.initGitHubAsync(newGitUrl);
                    setGitRemoteUrl(newGitUrl);
                    message.success('Git 仓库地址已更新');
                    setEditDisable(true);
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

    return (
        <div className="scrollable" style={{ height: '100%', background: 'var(--content-bg, #ffffff)', padding: 24 }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Title level={4} style={{ marginBottom: 24 }}>设置</Title>
                <Card variant="borderless" style={{ borderRadius: 10 }}>
                    <Form form={form} layout="vertical">
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
                        <Form.Item label="开机自启" style={{ marginBottom: 16 }}>
                            <Switch value={autoLaunchValue} onChange={setAutoLaunchHandler}/>
                        </Form.Item>
                        <Form.Item label="关闭应用时最小化到系统托盘" style={{ marginBottom: 16 }}>
                            <Switch value={settings.closeType === 'hide'}
                                    onChange={(checked) => setSettings({...settings, closeType: checked ? 'hide' : 'quit'})}/>
                        </Form.Item>
                        <Form.Item label="指定存档文件夹" style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input value={saveDirectory} readOnly />
                                <Button icon={<EllipsisOutlined />} onClick={selectSaveDirectory} />
                            </Space.Compact>
                        </Form.Item>
                        <Form.Item label="Git 仓库地址" name="gitUrl" style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input disabled={editDisable} placeholder="请输入 Git 仓库地址" />
                                {editDisable
                                    ? <Button icon={<EditOutlined />} onClick={() => setEditDisable(false)} />
                                    : <Button icon={<SaveOutlined />} onClick={saveGitUrl} loading={saving} />
                                }
                            </Space.Compact>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default memo(Setting);