import React, {useState, useMemo, memo} from "react";
import {Flex} from "antd";
import {Outlet} from "react-router";
import NoteSearch from "./components/NoteSearch";
import NoteGroups from "./components/NoteGroups";
import SyncStatusBar from "../../components/SyncStatusBar";
import {useSyncStatus} from "../../hooks/useSyncStatus";
import "./index.scss"
import useNoteInfo from "../hooks/useNoteInfo";

const Home: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('fileName');
    const { groups } = useNoteInfo();
    const sync = useSyncStatus();

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groups;
        return groups.map(group => {
            const matchedChildren = (group.children || []).filter(child => {
                if (searchType === 'fileName') {
                    return child.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (searchType === 'tags') {
                    return (child.tags || []).some(tag =>
                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                return true;
            });
            return { ...group, children: matchedChildren };
        }).filter(group => group.children.length > 0 || group.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [groups, searchTerm, searchType]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    return (
        <Flex style={{ height: 'calc(100vh - 36px)', flex: 1 }}>
            <Flex
                className="sidebar"
                vertical
                style={{
                    width: 240,
                    minWidth: 240,
                    borderRight: '1px solid var(--border-color, #e8e8ed)',
                    background: 'var(--sidebar-bg, #fafafa)',
                }}
            >
                <Flex style={{ padding: '12px 12px 4px' }} vertical gap={8}>
                    <NoteSearch
                        searchType={searchType}
                        onSearchTypeChange={setSearchType}
                        onSearch={handleSearch}
                    />
                </Flex>
                <NoteGroups filteredGroups={filteredGroups} />
                <SyncStatusBar
                    status={sync.status}
                    message={sync.message}
                    onSyncNow={sync.pushNow}
                />
            </Flex>
            <Flex
                className="content scrollable"
                vertical
                style={{
                    flex: 1,
                    background: 'var(--content-bg, #ffffff)',
                }}
            >
                <Outlet/>
            </Flex>
        </Flex>
    );
};

export default memo(Home);