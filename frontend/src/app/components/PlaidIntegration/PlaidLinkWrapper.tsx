'use client';
import { useEffect } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface PlaidLinkProps {
  onSuccess?: (publicToken: string) => void;
  onExit?: () => void;
}

export const PlaidLinkWrapper = ({ onSuccess, onExit }: PlaidLinkProps) => {
  const { generateLinkToken, open, ready } = usePlaid({ onSuccess, onExit });

  useEffect(() => {
    generateLinkToken();
  }, [generateLinkToken]);

  return (

    <div>
        <button
         onClick={() => open()}
         disabled={!ready}
          className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg flex items-center justify-center space-x-2"
        >
          <BanknotesIcon className="w-6 h-6" /> {/* Add an icon */}
          <span>Connect Bank Accounts</span> {/* Button text */}
        </button>
      </div>
  );
};

export default PlaidLinkWrapper;
