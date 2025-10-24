
import {
    createHashRouter,
} from "react-router";
import APP from "../App";
import Home from "../pages/home";
import Setting from "../pages/setting";

const router = createHashRouter([
    {
        path: "/",
        element: <APP />,
        children: [
            {
                index: true, // 添加 index 路由
                element: <Home />,
            },
            {
                path: "setting",
                element: <Setting />,
            },
        ],
    },
]);

export default router;