import BudgetCircle from "./BudgetCircle";

const BudgetOverview = () => (
    <div className="w-full lg:w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-md mb-5">Budget Overview</h2>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 w-full h-full p-7">
                <BudgetCircle
                    progressValue={75} // Example value
                    color="magenta" // Green color for the progress bar
                    label="Travel"
                    />
                <BudgetCircle
                    progressValue={35} // Example value
                    color="yellow" // Green color for the progress bar
                    label="Payment"
                    />
                <BudgetCircle
                    progressValue={95} // Example value
                    color="" // Green color for the progress bar
                    label="Food and Drink"
                    />
                <BudgetCircle
                    progressValue={43} // Example value
                    color="Orange" // Green color for the progress bar
                    label="Community"
                    />
            </div>
        </div>
    </div>
);

export default BudgetOverview;