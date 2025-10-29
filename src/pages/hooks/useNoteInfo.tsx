import {useContext} from "react";
import {ConfigContext, GroupsContext} from "../../utils/context";

const useNoteInfo = () => {
    const config = useContext(ConfigContext);
    const {groupsConfig, setGroupsConfig, groupsMap} = useContext(GroupsContext);


    return {
        saveDirectory: config.saveDirectory || "",
        groups: groupsConfig.groups || [],
        setGroupsConfig,
        groupsMap,
    };
};

export default useNoteInfo;