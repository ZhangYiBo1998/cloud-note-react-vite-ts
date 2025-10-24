
import {
    createHashRouter,
} from "react-router";
import Home from "../pages/home";
import Setting from "../pages/setting";

const router = createHashRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/setting",
        element: <Setting />,
    },
]);

export default router;