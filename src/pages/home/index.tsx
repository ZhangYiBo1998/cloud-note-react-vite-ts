import React, {useEffect, memo} from "react";
import {useNavigate, Outlet} from "react-router";
import {Flex} from "antd";
import "./index.scss"

const Home: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {

    }, []);

    return (
        <Flex id="cloudNoteHome">
            <Flex className="sidebar">侧边栏</Flex>
            <Flex className="content">
                编辑区域
                <Outlet />
            </Flex>
        </Flex>
    );
};

export default memo(Home);