import React, {memo} from "react";
import {Flex,} from "antd";
import {useNavigate} from "react-router";
import NoteSearch from "./components/NoteSearch";
import NoteGroups from "./components/NoteGroups";
import "./index.scss"

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Flex id="cloudNoteHome" vertical>
            <Flex className="container height-100">
                <Flex className="sidebar" vertical>
                    <Flex className="header">
                        <Flex className="left flex-shrink-0" align="center">
                            <Flex className="logo" justify="center" align="center" onClick={() => navigate("/")}>
                                <img src="src/assets/icon.png" alt=""/>
                            </Flex>
                            <Flex className="title">Cloud Note</Flex>
                        </Flex>
                    </Flex>
                    <NoteGroups/>
                </Flex>
                <Flex className="content" vertical>
                    <NoteSearch/>
                    <div className="scrollable">
                        编辑区域
                    </div>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default memo(Home);