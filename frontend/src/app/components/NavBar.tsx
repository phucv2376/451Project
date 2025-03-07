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
  };
  const handleDashboard = () => {
    router.push("/dashboard");
  };
  const handleTransaction = () => {
    router.push("/transaction");
  };
  const handleGoals = () => {
    router.push("/goals");
  };
  const handleAnalytics = () => {
    router.push("/ai-analytics");
  };
  const handleLogout = () => {
    logout();
  };

  // State for toggling mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm border-b border-gray-200 fixed w-full z-50">
        <button onClick={toggleMobileMenu} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl">Money Management</h1>
        {/* NotificationBell is added here for mobile */}
        <NotificationBell />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white shadow-md border-t border-gray-200 z-50">
          <div className="p-4 space-y-2">
            <div
              onClick={() => {
                handleDashboard();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <GridViewOutlinedIcon />
              Dashboard
            </div>
            <div
              onClick={() => {
                handleTransaction();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <SwapHorizOutlinedIcon />
              Transactions
            </div>
            <div
              onClick={() => {
                handleGoals();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <EmojiEventsOutlinedIcon />
              Goals
            </div>
            <div
              onClick={() => {
                handleAnalytics();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <InsightsOutlinedIcon />
              Analytics
            </div>
            <div
              onClick={() => {
                handleSettings();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <SettingsOutlinedIcon />
              Settings
            </div>
            <div
              onClick={() => {
                handleLogout();
                toggleMobileMenu();
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogoutOutlinedIcon
                sx={{ color: red[600], '&:hover': { color: red[900] } }}
              />
              Logout
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex bg-white h-full md:w-1/6 p-6 flex-col shadow-right shadow-sm border border-gray-200 fixed">
        <h1 className="text-xl mb-5">Money Management</h1>
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
            <NotificationBell /> {/* NotificationBell for desktop sidebar */}
            <LogoutOutlinedIcon
              sx={{ color: red[600], '&:hover': { color: red[900] } }}
              className="cursor-pointer"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
