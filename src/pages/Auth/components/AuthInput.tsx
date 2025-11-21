interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  isElder?: boolean;
  maxLength?: number;
}

const AuthInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  isElder = false,
  maxLength,
}: AuthInputProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block font-medium mb-2 ${isElder ? 'text-lg' : 'text-sm'}`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${isElder ? 'py-4 text-lg' : 'py-3 text-base'}`}
        required={required}
        maxLength={maxLength}
      />
    </div>
  );
};

export default AuthInput;
