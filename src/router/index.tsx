
import {
    createHashRouter,
    Navigate,
} from "react-router";
import APP from "../App";
import Home from "../pages/home";
import Setting from "../pages/setting";
import NoteEdit from "../pages/home/NoteEdit";

const router = createHashRouter([
    {
        path: "/",
        element: <APP />,
        children: [
            {
                index: true, // 添加 index 路由
                element: <Navigate to="/home" replace />, // 重定向到 /home
            },
            {
                path: "home",
                element: <Home />,
                children: [
                    {
                        index: true, // 添加 index 路由
                        element: <NoteEdit />,
                    },
                    {
                        path: "note/:id",
                        element: <NoteEdit />,
                    },
                ]
            },
            {
                path: "setting",
                element: <Setting />,
            },
        ],
    },
]);

export default router;