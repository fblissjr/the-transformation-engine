import React, { useState, ReactNode } from 'react';

/**
 * FormPrimitives.tsx
 *
 * Reusable UI components for Image Studio following veo31_director aesthetic:
 * - Amber + Zinc color palette
 * - Badge-style compact UI
 * - Progressive disclosure patterns
 * - Clean, hierarchical forms
 */

// ============================================================================
// Badge Button - Compact toggle/action button
// ============================================================================

interface BadgeButtonProps {
  icon?: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  badge?: string; // e.g. "PHASE 3" for non-functional features
  tooltip?: string; // Hover explanation
}

/**
 * BadgeButton component
 *
 * A compact button with an optional icon, label, count, and badge.
 * Used for toggle actions or displaying status.
 *
 * @param icon - Optional icon element.
 * @param label - Button text label.
 * @param count - Optional count to display next to the label.
 * @param active - Boolean indicating active state (highlighted).
 * @param onClick - Click handler.
 * @param disabled - Boolean indicating disabled state.
 * @param className - Optional additional CSS classes.
 * @param badge - Optional badge text (e.g., "PHASE 3").
 * @param tooltip - Optional tooltip text on hover.
 * @returns The rendered BadgeButton component.
 */
export const BadgeButton: React.FC<BadgeButtonProps> = ({
  icon,
  label,
  count,
  active = false,
  onClick,
  disabled = false,
  className = '',
  badge,
  tooltip,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        text-xs rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors
        ${
          active
            ? 'bg-amber-600 text-white hover:bg-amber-500'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }
        ${
          badge
            ? 'border border-dashed border-zinc-600'
            : 'border border-zinc-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {label}
      {count !== undefined && <span className="opacity-70">({count})</span>}
      {badge && (
        <span className="ml-1 px-1.5 py-0.5 bg-amber-900/40 text-amber-400 rounded text-[10px] font-medium">
          {badge}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// Compact Input - Label:Value inline input (veo31_director style)
// ============================================================================

interface CompactInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  className?: string;
}

/**
 * CompactInput component
 *
 * An inline input field with a label, styled compactly.
 *
 * @param label - Label text displayed before the input.
 * @param value - Current value of the input.
 * @param onChange - Change handler.
 * @param placeholder - Optional placeholder text.
 * @param type - HTML input type (default: 'text').
 * @param disabled - Boolean indicating disabled state.
 * @param className - Optional additional CSS classes.
 * @returns The rendered CompactInput component.
 */
export const CompactInput: React.FC<CompactInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-medium text-zinc-400 whitespace-nowrap">
        {label}:
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

// ============================================================================
// Compact Select - Label:Value inline dropdown
// ============================================================================

interface CompactSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}

/**
 * CompactSelect component
 *
 * An inline select dropdown with a label, styled compactly.
 *
 * @param label - Label text displayed before the select.
 * @param value - Current selected value.
 * @param onChange - Change handler.
 * @param options - Array of options with value and label.
 * @param disabled - Boolean indicating disabled state.
 * @param className - Optional additional CSS classes.
 * @returns The rendered CompactSelect component.
 */
export const CompactSelect: React.FC<CompactSelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-medium text-zinc-400 whitespace-nowrap">
        {label}:
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================================================
// Collapsible Section - Progressive disclosure container
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
  className?: string;
}

/**
 * CollapsibleSection component
 *
 * A container that can expand or collapse its content.
 * Used for progressive disclosure of complex forms or options.
 *
 * @param title - Section title.
 * @param defaultOpen - Whether the section is open by default.
 * @param children - Content to display when expanded.
 * @param badge - Optional badge element displayed in the header.
 * @param className - Optional additional CSS classes.
 * @returns The rendered CollapsibleSection component.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  children,
  badge,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
          {badge && <span className="text-xs text-zinc-500">{badge}</span>}
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-zinc-800 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Pill Selector - Multi-select badge buttons for taxonomy options
// ============================================================================

interface PillOption {
  id: string;
  label: string;
}

interface PillSelectorProps {
  category: string;
  options: PillOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelection?: number;
  className?: string;
}

/**
 * PillSelector component
 *
 * A multi-select component using pill-shaped buttons.
 * Suitable for selecting tags or categories.
 *
 * @param category - Label for the group of options.
 * @param options - Array of available options.
 * @param selected - Array of currently selected option IDs.
 * @param onChange - Callback when selection changes.
 * @param maxSelection - Optional maximum number of selectable items.
 * @param className - Optional additional CSS classes.
 * @returns The rendered PillSelector component.
 */
export const PillSelector: React.FC<PillSelectorProps> = ({
  category,
  options,
  selected,
  onChange,
  maxSelection,
  className = '',
}) => {
  const handleToggle = (optionId: string) => {
    const isSelected = selected.includes(optionId);
    let newSelected: string[];

    if (isSelected) {
      newSelected = selected.filter((id) => id !== optionId);
    } else {
      if (maxSelection && selected.length >= maxSelection) {
        // If max reached, replace last item
        newSelected = [...selected.slice(0, maxSelection - 1), optionId];
      } else {
        newSelected = [...selected, optionId];
      }
    }

    onChange(newSelected);
  };

  return (
    <div className={className}>
      <h5 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
        {category}
      </h5>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleToggle(opt.id)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                isSelected
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Range Slider - Value slider with label and display (for advanced settings)
// ============================================================================

interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  className?: string;
}

/**
 * RangeSlider component
 *
 * A slider input for numerical values within a range.
 * Includes labels and value display.
 *
 * @param label - The slider label.
 * @param value - Current value.
 * @param onChange - Callback when value changes.
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @param step - Step increment.
 * @param leftLabel - Optional label for the minimum end.
 * @param rightLabel - Optional label for the maximum end.
 * @param showValue - Whether to display the current numerical value.
 * @param className - Optional additional CSS classes.
 * @returns The rendered RangeSlider component.
 */
export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  showValue = true,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        {showValue && (
          <span className="text-xs font-semibold text-amber-400 bg-zinc-800 px-2 py-0.5 rounded">
            {value}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 md:h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500
                   [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                   [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                   md:[&::-webkit-slider-thumb]:w-4 md:[&::-webkit-slider-thumb]:h-4
                   md:[&::-moz-range-thumb]:w-4 md:[&::-moz-range-thumb]:h-4"
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Primary Button - Main action button (Generate, Save, etc.)
// ============================================================================

interface PrimaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * PrimaryButton component
 *
 * The main call-to-action button style.
 * Supports loading state and icons.
 *
 * @param children - Button content.
 * @param onClick - Click handler.
 * @param disabled - Boolean indicating disabled state.
 * @param icon - Optional icon element.
 * @param loading - Boolean indicating loading state.
 * @param className - Optional additional CSS classes.
 * @returns The rendered PrimaryButton component.
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  icon,
  loading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500
        disabled:opacity-50 disabled:cursor-not-allowed
        text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon && <span className="w-5 h-5">{icon}</span>
      )}
      {children}
    </button>
  );
};

// ============================================================================
// Secondary Button - Cancel, Close, etc.
// ============================================================================

interface SecondaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * SecondaryButton component
 *
 * A secondary action button style.
 *
 * @param children - Button content.
 * @param onClick - Click handler.
 * @param disabled - Boolean indicating disabled state.
 * @param className - Optional additional CSS classes.
 * @returns The rendered SecondaryButton component.
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-zinc-700 hover:bg-zinc-600 text-zinc-200 py-2 px-4 rounded transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// ============================================================================
// Text Area - Large text input for prompts
// ============================================================================

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  icon?: ReactNode;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * TextArea component
 *
 * A large multi-line text input field.
 * Includes label, icon, and helper text support.
 *
 * @param label - Input label.
 * @param value - Current value.
 * @param onChange - Change handler.
 * @param placeholder - Optional placeholder text.
 * @param rows - Number of rows (height).
 * @param icon - Optional icon displayed next to label.
 * @param helperText - Optional help text displayed below the input.
 * @param disabled - Boolean indicating disabled state.
 * @param className - Optional additional CSS classes.
 * @returns The rendered TextArea component.
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 6,
  icon,
  helperText,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 ${className}`}>
      <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-100 placeholder:text-zinc-500 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {helperText && <p className="text-xs text-zinc-500 mt-2">{helperText}</p>}
    </div>
  );
};

// ============================================================================
// Icon Components (Simple SVG icons)
// ============================================================================

/**
 * SparklesIcon component
 *
 * Renders a sparkles icon.
 *
 * @param className - Optional CSS classes.
 * @returns The SVG icon.
 */
export const SparklesIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
  </svg>
);

/**
 * ImageIcon component
 *
 * Renders an image/photo icon.
 *
 * @param className - Optional CSS classes.
 * @returns The SVG icon.
 */
export const ImageIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

/**
 * UserIcon component
 *
 * Renders a user/person icon.
 *
 * @param className - Optional CSS classes.
 * @returns The SVG icon.
 */
export const UserIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

/**
 * SettingsIcon component
 *
 * Renders a settings/gear icon.
 *
 * @param className - Optional CSS classes.
 * @returns The SVG icon.
 */
export const SettingsIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

/**
 * WandIcon component
 *
 * Renders a magic wand icon.
 *
 * @param className - Optional CSS classes.
 * @returns The SVG icon.
 */
export const WandIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);
