import React, {useEffect, memo, useState} from "react";
import {useNavigate} from "react-router";
import {Card, Switch, Form} from 'antd';
import EventEmitter from "../../utils/eventBus";

const Setting: React.FC = () => {
    const navigate = useNavigate();
    const [autoLaunchValue, setAutoLaunchValue] = useState(false);

    useEffect(() => {
        const eventBus = new EventEmitter();
        const unsubscribe = eventBus.on('toHome', () => {
            navigate('/');
        });

        return () => {
            unsubscribe();
        }
    }, []);

    useEffect(() => {
        window.electronAPI.getAutoLaunch().then(enabled => {
            console.log("getAutoLaunch enabled", enabled);
            setAutoLaunchValue(enabled)
        })
    }, []);

    const setAutoLaunchHandler = (checked: boolean) => {
        console.log('setAutoLaunchHandler', checked);
        setAutoLaunchValue(checked);
        window.electronAPI?.setAutoLaunch(checked)
    }

    return (
        <Card title="设置" variant="borderless">
            <h1>hello Setting</h1>
            <h1 onClick={() => {
                navigate(-1)
            }}>back to home</h1>
            <Form>
                <Form.Item label="开机自启">
                    <Switch value={autoLaunchValue} onChange={setAutoLaunchHandler}/>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default memo(Setting);