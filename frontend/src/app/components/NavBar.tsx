import { useState } from 'react';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from './NotificationBell';

type Props = {
  onClick?: any;
};

const NavBar = (props: Props) => {
  const { logout } = useAuth();
  const router = useRouter();

    const handleSettings = () => {
        router.push("/settings");
    }
    const handleDashboard = () => {
        router.push("/dashboard");
    }
    const handleTransaction = () => {
        router.push("/transaction");
    }
    const handleGoals = () => {
        router.push("/goals");
    }
    const handleAnalytics = () => {
        router.push("/analytics");
    }
    const handleLogout = () => {
        logout();
    }
    return (
        <div className="bg-white h-full w-1/6 p-6 flex flex-col shadow-right shadow-sm border border-gray-200 fixed">
            <h1 className="text-xl mb-5">Our App Name</h1>
            <div>
                <h2
                    className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={handleDashboard}
                >
                    <GridViewOutlinedIcon />
                    Dashboard
                </h2>

                <h2
                    className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={handleTransaction}
                >
                    <SwapHorizOutlinedIcon />
                    Transactions
                </h2>

                <h2
                    className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={handleGoals}
                >
                    <EmojiEventsOutlinedIcon />
                    Goals
                </h2>
                <h2
                    className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={handleAnalytics}
                >
                    <InsightsOutlinedIcon />
                    Analytics
                </h2>
            </div>
            <div className="mt-auto">
                <div className="border-t border-gray-200"></div>

                <h2
                    className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={handleSettings}
                >
                    <SettingsOutlinedIcon />
                    Settings
                </h2>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                        <Avatar />
                        <h2 className="ml-3">Profile</h2>
                    </div>
                    <NotificationBell />
                    <LogoutOutlinedIcon
                        sx={{
                            color: red[600],
                            '&:hover': { color: red[900] },
                        }}
                        className="cursor-pointer"
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </div>
    )
};

export default NavBar;
