type Props = {
    text: string,
    money: string,
}

const MoneyBox = (props: Props) => {
    return (
        <div className="flex-1 bg-white rounded-lg flex flex-col items-start justify-start p-5 border border-gray-200">
            <p className="text-md font-bold">{props.text}</p>
            <div className="flex items-center gap-2 mt-4">
                <h2 className="text-4xl font-bold">{props.money}</h2>
                
            </div>
        </div>
    )
}

export default MoneyBox