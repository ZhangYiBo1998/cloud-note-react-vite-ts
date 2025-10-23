
import {
    createBrowserRouter,
} from "react-router";
import Home from "../pages/home";
import Setting from "../pages/setting";

const router = createBrowserRouter([
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