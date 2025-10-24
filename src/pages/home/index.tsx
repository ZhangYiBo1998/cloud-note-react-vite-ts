import React, {useEffect, memo} from "react";
import {useNavigate, Outlet} from "react-router";
import {Flex} from "antd";
import EventEmitter from "../../utils/eventBus";
import "./index.scss"

const Home: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const eventBus = new EventEmitter();
        const unsubscribe = eventBus.on('toSetting', () => {
            navigate('/setting');
        });

        return () => {
            unsubscribe();
        }
    }, []);

    return (
        <Flex id="cloudNoteHome" vertical>
            <Flex className="header">
                <Flex className="left">
                    <Flex className="logo" onClick={() => navigate("/")}>logo</Flex>
                    <Flex className="title">Cloud Note</Flex>
                </Flex>
                <Flex className="right">
                    <Flex className="search">搜索</Flex>
                </Flex>
            </Flex>
            <Flex className="container height-100">
                <Flex className="sidebar">侧边栏</Flex>
                <Flex className="content">
                    编辑区域
                    <Outlet/>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default memo(Home);