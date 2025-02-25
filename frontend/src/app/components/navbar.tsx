"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">BudgetApp</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/dashboard" className="hover:text-gray-400 hover:shadow-lg px-3 py-2 rounded-md transition-shadow duration-200">Dashboard</Link>
          <Link href="/transaction" className="hover:text-gray-400 hover:shadow-lg px-3 py-2 rounded-md transition-shadow duration-200">Transaction</Link>
          <Link href="/budget" className="hover:text-gray-400 hover:shadow-lg px-3 py-2 rounded-md transition-shadow duration-200">Budget</Link>
          <Link href="/ai-analysis" className="hover:text-gray-400 hover:shadow-lg px-3 py-2 rounded-md transition-shadow duration-200">AI Analysis</Link>

          {/* Single Profile Link */}
          <Link href="/profile" className="hover:text-gray-400 px-3 py-2 rounded-md focus:outline-none">
            Profile
          </Link>

          {/* Logout Button (Desktop) */}
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={toggleMenu} 
            className="text-white focus:outline-none"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden mt-2 bg-gray-800 text-white rounded-lg shadow-lg">
          <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-700 hover:shadow-sm">Dashboard</Link>
          <Link href="/transaction" className="block px-4 py-2 hover:bg-gray-700 hover:shadow-sm">Transaction</Link>
          <Link href="/budget" className="block px-4 py-2 hover:bg-gray-700 hover:shadow-sm">Budget</Link>
          <Link href="/ai-analysis" className="block px-4 py-2 hover:bg-gray-700 hover:shadow-sm">AI Analysis</Link>
          <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700 hover:shadow-sm">Profile</Link>
          <button 
            onClick={handleLogout} 
            className="block w-full px-4 py-2 text-left hover:bg-gray-700 hover:shadow-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
