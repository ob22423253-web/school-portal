// Generic labelled input that knows about per-field error messages so forms
// can render validation feedback consistently.

export default function FormInput({
  label,
  id,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  placeholder = '',
  children,
  as = 'input',
  ...rest
}) {
  const inputId = id || name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}
      {as === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={`input ${error ? 'border-rose-500 focus:ring-rose-500' : ''}`}
          required={required}
          {...rest}
        >
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input min-h-[88px] ${error ? 'border-rose-500 focus:ring-rose-500' : ''}`}
          required={required}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'border-rose-500 focus:ring-rose-500' : ''}`}
          required={required}
          {...rest}
        />
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
