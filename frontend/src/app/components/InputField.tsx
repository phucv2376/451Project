type Props = {
  label: string,
  type: string,
  id: string,
  name?: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  error?: string
}

const InputField = (props : Props) => {
  return (
    <div>
      <div className="flex justify-between items-center">
          <p className="text-left text-black font-sans font-semibold">{props.label}</p>
          {props.error && <p className="text-red-500 text-sm pt-1">{props.error}</p>}
      </div>
      <input 
          type={props.type} 
          id={props.id} 
          name={props.name}
          onChange={props.onChange}
          className={`mt-1 mb-4 block w-full h-11 rounded-sm py-1.5 px-2 ring-1 ring-inset ${
            props.error ? 'ring-red-500' : 'ring-gray-300'} focus:text-gray-600`}        
        />
    </div>
  )
}

export default InputField
