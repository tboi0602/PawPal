const InputForm = ({
  Icon,
  placeholder,
  value,
  name,
  type,
  onChange,
  disablel,
}) => {
  return (
    <div className="flex w-full items-center rounded-lg border bg-white border-zinc-200">
      <div className="pl-4">{Icon && <Icon className="w-5 "></Icon>}</div>
      <input
        className="ml-4 px-4 py-3 w-full rounded-r-lg outline-none bg-white hover:bg-gray-100  focus:bg-gray-100 text-zinc-800 placeholder:text-zinc-500 "
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disablel}
      />
    </div>
  );
};

export default InputForm;
