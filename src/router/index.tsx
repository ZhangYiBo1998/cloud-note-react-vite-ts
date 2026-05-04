
import {
    createHashRouter,
    Navigate,
} from "react-router";
import APP from "../App";
import Home from "../pages/home";
import Setting from "../pages/setting";
import NoteEdit from "../pages/home/NoteEdit";
import MemoList from "../pages/home/components/MemoList";

const router = createHashRouter([
    {
        path: "/",
        element: <APP />,
        children: [
            {
                index: true,
                element: <Navigate to="/home" replace />,
            },
            {
                path: "home",
                element: <Home />,
                children: [
                    {
                        index: true,
                        element: <MemoList />,
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