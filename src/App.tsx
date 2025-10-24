import React from 'react';
import {
    RouterProvider,
} from "react-router";
import router from "./router";
import SystemHeader from "./components/SystemHeader";
import './App.css'

const App: React.FC = () => {
    return (
        <SystemHeader>
            <RouterProvider router={router}/>
        </SystemHeader>
    )
}
export default App
