'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import {
  EmojiEventsOutlined as GoalsIcon,
  InsightsOutlined as AnalyticsIcon,
  SwapHorizOutlined as TransactionsIcon,
  GridViewOutlined as DashboardIcon,
  SettingsOutlined as SettingsIcon,
  LogoutOutlined as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Link from 'next/link';
import {  ChatWidget } from './AiAnalysis/ChatWidget';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const NavBar: FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = useMemo(() => [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Transactions', path: '/transaction', icon: <TransactionsIcon /> },
    { label: 'Budget', path: '/budget', icon: <GoalsIcon /> },
    { label: 'Analytics', path: '/ai-analysis', icon: <AnalyticsIcon /> },
  ], []);

  const handleLogout = useCallback(() => {
    setIsMobileMenuOpen(false);
    logout();
  }, [logout]);

  if (!isMounted) return null;

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

        <NavLinks navItems={navItems} pathname={pathname} />
        <UserSection onLogout={handleLogout} />
      </nav>

      {/* Main Content Wrapper */}
      <div className="lg:ml-64 min-h-screen transition-all duration-300">
        {/* Your main content goes here */}
      </div>
    </>
  );
};

/**
 * Navigation Links Component
 */
const NavLinks: FC<{ navItems: NavItem[], pathname: string }> = ({ navItems, pathname }) => (
  <div className="flex-1">
    {navItems.map((item) => (
      <Link href={item.path} key={item.path} passHref>
        <button
          className={`w-full cursor-pointer my-2 flex items-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 
            ${pathname === item.path
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 active:bg-gray-200'}`} // Added visual feedback
        >
          <span className="text-inherit">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      </Link>
    ))}
  </div>
);

/**
 * Chat Widget Component
 */



/**
 * User Section Component
 */
const UserSection: FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const username = typeof window !== 'undefined' ? localStorage.getItem('user') || 'User' : 'User';

  return (
    <>
      <div className="mt-auto space-y-4">
        <div className="border-t border-gray-200 pt-4">
          <Link href="/profile" passHref>
            <button
              className="w-full cursor-pointer flex items-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 active:bg-gray-200"
            >
              <SettingsIcon />
              <span className="font-medium">Settings</span>
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar
              className="border-2 border-gray-100"
              alt="User Avatar"
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{username}</span>
              <span className="text-xs text-gray-500">View Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LogoutIcon
              sx={{
                color: red[600],
                '&:hover': { color: red[900] },
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={onLogout}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;