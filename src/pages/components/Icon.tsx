import React from "react";

const Icon: React.FC<{ src: string }> = (props) => {
    const {src} = props;
    return (
        <div>
            <img style={{width: 18, height: 18}} src={src} alt=""/>
        </div>
    )
}

export default Icon;