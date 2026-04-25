import {useContext, useMemo} from "react";
import {ConfigContext, GroupsContext} from "../../utils/context";

const useNoteInfo = () => {
    const { config } = useContext(ConfigContext);
    const {groupsConfig, setGroupsConfig, groupsMap} = useContext(GroupsContext);

    return useMemo(() => ({
        saveDirectory: config.saveDirectory || "",
        groups: groupsConfig.groups || [],
        setGroupsConfig,
        groupsMap,
    }), [config.saveDirectory, groupsConfig.groups, setGroupsConfig, groupsMap]);
};

export default useNoteInfo;