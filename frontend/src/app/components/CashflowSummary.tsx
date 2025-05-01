interface props {
    monthlyIncome: number;
    monthlyExpenses: number;
    isLoading: boolean;
}

const CashflowSummary = (props: props) => (
    
    <div className="w-full lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className='flex justify-between flex-row h-[100%]'>
            <div className="pr-7 flex w-1/2 max-h-[100%] flex-col justify-center items-center border-r border-gray-300">
                <h2 className="text-gray-600 text-2xl md:text-xl pb-2">Net Cashflow </h2>
                <span className=
                    {`text-5xl md:text-4xl ${props.monthlyIncome + props.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                    {`${props.monthlyIncome + props.monthlyExpenses >= 0 ? '+' : '-'}`}
                    ${Math.abs(Math.round(props.monthlyIncome + props.monthlyExpenses))} </span>
            </div>
            <div className="flex pl-7 w-1/2 justify-center flex-col">
                <SummaryItem label="Cash In:" value={props.monthlyIncome} isLoading={props.isLoading} positive />
                <SummaryItem label="Cash Out:" value={Math.abs(props.monthlyExpenses)} isLoading={props.isLoading} />
            </div>
        </div>
    </div>
);

export default CashflowSummary;

const SummaryItem = ({ label, value, isLoading, positive = false }: { label: string; value: number; isLoading: boolean; positive?: boolean }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`font-semibold ${positive ? "text-green-500" : "text-red-500"}`}>
            {isLoading ? "Loading..." : `${positive ? "+" : "-"}$${value.toFixed(2)}`}
        </span>
    </div>
);