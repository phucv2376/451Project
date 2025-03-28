const BudgetOverview = () => (
    <div className="w-full lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-md mb-5">Budget Overview</h2>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4">{/* Budget data */}</div>
        </div>
    </div>
);

export default BudgetOverview;