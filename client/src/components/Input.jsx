function Input({
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    name,
    required = false,
}) {
    return (
        <div className="form-group">
            <label htmlFor={name}>
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}

export default Input;