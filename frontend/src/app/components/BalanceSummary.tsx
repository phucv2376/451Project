import React from 'react'
import BankIntegration from './PlaidIntegration/BankIntegration'

interface BalanceSummaryProps {
    onDisconnect: () => void;
    isConnected: boolean;
    onPlaidSuccess: (publicToken: string) => Promise<void>;
}
const BalanceSummary = (props: BalanceSummaryProps) => {
    const [totalBalance, setTotalBalance] = React.useState<number>(0);
    return (
        <div className='flex flex-col w-full p-2'>
            <div className='flex justify-between flex-row'>
                <div className="pr-7 flex w-1/2 max-h-[100%] justify-between items-center border-r border-gray-300">
                    <h2 className="text-gray-600 text-2xl">Total Balance: </h2>
                    <span className="text-5xl text-blue-600">${totalBalance}</span>
                </div>
                <div className=" pl-7 w-1/2">
                    <BankIntegration onDisconnect={props.onDisconnect} isConnected={props.isConnected} onPlaidSuccess={props.onPlaidSuccess} setTotalBalance={setTotalBalance} />
                </div>
            </div>
        </div>
    )
}

export default BalanceSummary