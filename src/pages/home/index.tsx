import React, {useEffect, memo} from "react";
import {useNavigate} from "react-router";

const Home: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {

    }, []);

    return (
        <>
            <h1>hello Home</h1>
            <h1 onClick={() => navigate("/setting")}>goto Setting</h1>
        </>
    );
};

export default memo(Home);