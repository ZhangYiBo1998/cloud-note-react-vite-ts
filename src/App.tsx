import React from 'react';
import {Outlet} from "react-router";
import SystemHeader from "./components/SystemHeader";
import './App.css'

const App: React.FC = () => {
    return (
        <SystemHeader>
            <Outlet/>
        </SystemHeader>
    )
}
export default App
