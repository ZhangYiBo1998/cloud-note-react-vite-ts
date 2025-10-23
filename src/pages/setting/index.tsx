import React, {useEffect, memo} from "react";
import {useNavigate} from "react-router";

const Setting: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {

    }, []);

    return (
        <>
            <h1>hello Setting</h1>
            <h1 onClick={() => {
                navigate(-1)
            }}>back to home</h1>
        </>
    );
};

export default memo(Setting);