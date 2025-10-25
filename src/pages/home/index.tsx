import React, {memo} from "react";
import {Flex,} from "antd";
import {useNavigate, Outlet} from "react-router";
import NoteSearch from "./components/NoteSearch";
import NoteGroups from "./components/NoteGroups";
import Logo from "../../assets/logo.png";
import "./index.scss"

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Flex id="cloudNoteHome" vertical>
            <Flex className="header">
                <Flex className="left flex-shrink-0" align="center">
                    <Flex className="logo" justify="center" align="center" onClick={() => navigate("/")}>
                        <img src={Logo} alt=""/>
                    </Flex>
                    <Flex className="title">Cloud Note</Flex>
                </Flex>
                <NoteSearch/>
            </Flex>
            <Flex className="container">
                <Flex className="sidebar" vertical>
                    <NoteGroups/>
                </Flex>
                <Flex className="content" vertical>
                    <Outlet/>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default memo(Home);