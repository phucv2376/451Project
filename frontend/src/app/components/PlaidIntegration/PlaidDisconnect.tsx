import React from 'react'

const PlaidDisconnect = ({ onDisconnect }: { onDisconnect: () => void }) => {
    return (
        <div>
            <button
                onClick={onDisconnect}
                className="
          w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white 
          bg-gradient-to-r from-red-500 to-pink-600 
          hover:from-red-600 hover:to-pink-700 
          transition duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-blue-400 
          shadow-lg flex items-center justify-center space-x-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
            >
                <span>Disconnect Bank Accounts</span>
            </button>
        </div>
    )
}

export default PlaidDisconnect