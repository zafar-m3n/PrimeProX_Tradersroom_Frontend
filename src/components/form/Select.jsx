import React, { useContext } from "react";
import SelectLib from "react-select";
import { ThemeContext } from "@/context/ThemeContext";

const Select = ({ value, onChange, options = [], placeholder = "Select", error, label, ...rest }) => {
  const { theme } = useContext(ThemeContext);

  const isDark = theme === "dark";
  const accentColor = "var(--color-accent)";

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      backgroundColor: isDark ? "#101828" : "#ffffff",
      borderColor: error ? "#f87171" : state.isFocused ? accentColor : isDark ? "#4b5563" : "#d1d5db",
      boxShadow: state.isFocused ? `0 0 0 1px ${accentColor}` : "none",
      color: isDark ? "#f3f4f6" : "#111827",
      borderRadius: "0.375rem",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        borderColor: error ? "#f87171" : state.isFocused ? accentColor : isDark ? "#6b7280" : "#9ca3af",
      },
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "2px 10px",
    }),

    input: (base) => ({
      ...base,
      color: isDark ? "#f3f4f6" : "#111827",
    }),

    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f3f4f6" : "#111827",
    }),

    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),

    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#d1d5db",
    }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? accentColor : isDark ? "#d1d5db" : "#6b7280",
      "&:hover": {
        color: accentColor,
      },
    }),

    clearIndicator: (base) => ({
      ...base,
      color: isDark ? "#d1d5db" : "#6b7280",
      "&:hover": {
        color: "#f87171",
      },
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#101828" : "#ffffff",
      color: isDark ? "#f3f4f6" : "#111827",
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      borderRadius: "0.5rem",
      overflow: "hidden",
      zIndex: 50,
      boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.35)" : "0 10px 30px rgba(0,0,0,0.08)",
    }),

    menuList: (base) => ({
      ...base,
      padding: "0.25rem",
    }),

    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? accentColor
        : isFocused
          ? isDark
            ? "rgba(0, 184, 230, 0.14)"
            : "rgba(0, 184, 230, 0.10)"
          : "transparent",
      color: isSelected ? "#ffffff" : isDark ? "#f3f4f6" : "#111827",
      cursor: "pointer",
      borderRadius: "0.375rem",
      transition: "all 0.15s ease-in-out",
      "&:active": {
        backgroundColor: accentColor,
        color: "#ffffff",
      },
    }),

    noOptionsMessage: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <div className="w-full">
      {label && <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</label>}

      <SelectLib
        options={options}
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selected) => onChange(selected?.value || "")}
        placeholder={placeholder}
        styles={customStyles}
        classNamePrefix="react-select"
        theme={(selectTheme) => ({
          ...selectTheme,
          colors: {
            ...selectTheme.colors,
            primary: "#00b8e6",
            primary25: isDark ? "rgba(0, 184, 230, 0.14)" : "rgba(0, 184, 230, 0.10)",
            primary50: isDark ? "rgba(0, 184, 230, 0.22)" : "rgba(0, 184, 230, 0.18)",
          },
        })}
        {...rest}
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
