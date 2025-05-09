'use client';

import { useEffect } from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { usePlaidContext } from '../../contexts/PlaidContext';

interface PlaidLinkProps {
  onSuccess?: (publicToken: string) => void;
  onExit?: () => void;
}

export const PlaidLinkWrapper = ({ onSuccess, onExit }: PlaidLinkProps) => {
  const { isPlaidInitialized } = usePlaidContext();
  const { open, ready, generateLinkToken, linkToken } = usePlaid({ onSuccess, onExit });

  // Generate link token when component mounts if we don't have one
  useEffect(() => {
    if (isPlaidInitialized && !linkToken) {
      generateLinkToken();
    }
  }, [isPlaidInitialized, linkToken, generateLinkToken]);

  return (
    <div>
      <button
        onClick={() => open()}
        disabled={!ready || !isPlaidInitialized}
        className="
          w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white 
          bg-gradient-to-r from-blue-500 to-indigo-600 
          hover:from-blue-600 hover:to-indigo-700 
          transition duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-blue-400 
          shadow-lg flex items-center justify-center space-x-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <BanknotesIcon className="w-6 h-6" />
        <span>Connect Bank Accounts</span>
      </button>
    </div>
  );
};

export default PlaidLinkWrapper;