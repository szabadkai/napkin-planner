"use client";

import { useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SliderFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatter?: (value: number) => string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  allowCustom?: boolean;
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}

export function SliderField({ label, value, onChange, min, max, step = 1, unit = '', formatter }: SliderFieldProps) {
  const numValue = parseFloat(value) || min;
  const displayValue = formatter ? formatter(numValue) : `${numValue}${unit}`;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="text-sm font-semibold text-purple-700">{displayValue}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-gradient-to-r from-purple-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatter ? formatter(min) : `${min}${unit}`}</span>
        <span>{formatter ? formatter(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, allowCustom = false }: SelectFieldProps) {
  const [isCustom, setIsCustom] = useState(!options.some(opt => opt.value === value) && value !== '');
  
  const handleSelectChange = (newValue: string) => {
    if (newValue === '__custom__') {
      setIsCustom(true);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {!isCustom ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="input pr-10 appearance-none cursor-pointer"
          >
            <option value="">Select an option...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {allowCustom && <option value="__custom__">Custom...</option>}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-700">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input flex-1"
            placeholder="Enter custom value..."
          />
          <button
            onClick={() => {
              setIsCustom(false);
              onChange('');
            }}
            className="btn-secondary px-3"
            type="button"
          >
            ↩️
          </button>
        </div>
      )}
    </div>
  );
}

export function NumberField({ label, value, onChange, placeholder, prefix = '', suffix = '' }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-purple-700 font-medium">{prefix}</span>
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
          placeholder={placeholder}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-purple-700 font-medium">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}