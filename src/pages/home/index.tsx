import React, {memo} from "react";
import {Flex,} from "antd";
import Header from "./components/Header";
import NoteGroups from "./components/NoteGroups";
import "./index.scss"

const Home: React.FC = () => {
    return (
        <Flex id="cloudNoteHome" vertical>
            <Header />
            <Flex className="container height-100">
                <Flex className="sidebar">
                    <NoteGroups />
                </Flex>
                <Flex className="content">
                    编辑区域
                </Flex>
            </Flex>
        </Flex>
    );
};

export default memo(Home);