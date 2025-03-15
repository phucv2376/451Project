'use client';

import React, { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from './NotificationBell';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface Props {
  onClick?: () => void;
}

const NavBar: FC<Props> = ({ onClick }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <GridViewOutlinedIcon /> },
    { label: 'Transactions', path: '/transaction', icon: <SwapHorizOutlinedIcon /> },
    { label: 'Goals', path: '/goals', icon: <EmojiEventsOutlinedIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <InsightsOutlinedIcon /> },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  if (!mounted) return null;

  const NavLinks: FC = () => (
    <>
      <div className="flex-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`w-full cursor-pointer my-2 flex items-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 
              ${pathname === item.path 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
          >
            <span className="text-inherit">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => handleNavigation('/settings')}
            className={`w-full cursor-pointer flex items-center gap-2 px-3 py-4 rounded-lg transition-all duration-200
              ${pathname === '/settings' 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
          >
            <SettingsOutlinedIcon />
            <span className="font-medium">Settings</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar 
              className="border-2 border-gray-100"
              alt={typeof window !== 'undefined' ? localStorage.getItem('user') || 'User' : 'User'}
              src="/avatar-placeholder.png"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {typeof window !== 'undefined' ? localStorage.getItem('user') || 'User' : 'User'}
              </span>
              <span className="text-xs text-gray-500">View Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <LogoutOutlinedIcon
              sx={{
                color: red[600],
                '&:hover': { color: red[900] },
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
      >
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`
        fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200
        flex flex-col p-6 transition-all duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64 lg:z-30
        w-[280px]
      `}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FinanceFlow
          </h1>
        </div>

        <NavLinks />
      </nav>

      {/* Main Content Wrapper */}
      <div className="lg:ml-64 min-h-screen transition-all duration-300">
        {/* Your main content goes here */}
      </div>
    </>
  );
};

export default NavBar;