'use client';

import React, { useMemo, useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[!-\/:-@[-`{-~]/, text: 'At least 1 special characters' },
] as const;

type StrengthScore = 0 | 1 | 2 | 3 | 4 | 5;

const STRENGTH_CONFIG = {
  colors: {
    0: 'bg-border',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-amber-500',
    4: 'bg-amber-700',
    5: 'bg-emerald-500',
  } satisfies Record<StrengthScore, string>,
  texts: {
    0: 'Enter a password',
    1: 'Weak password',
    2: 'Medium password!',
    3: 'Strong password!!',
    4: 'Very Strong password!!!',
  } satisfies Record<Exclude<StrengthScore, 5>, string>,
} as const;

type Requirement = {
  met: boolean;
  text: string;
};

type PasswordStrength = {
  score: StrengthScore;
  requirements: Requirement[];
};

type PasswordInputProps = {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  mustContainLabel?: string;
  strengthTexts?: Partial<Record<Exclude<StrengthScore, 5>, string>>;
  requirementTexts?: string[];
  compact?: boolean;
  showStrength?: boolean;
};

const PasswordInput = ({
  id = "password",
  value,
  onChange,
  autoComplete,
  error,
  label = "Password",
  placeholder = "Password",
  mustContainLabel = "Must contain:",
  strengthTexts,
  requirementTexts,
  compact = false,
  showStrength = true,
}: PasswordInputProps) => {
  const [internalPassword, setInternalPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const password = value ?? internalPassword;

  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }

    setInternalPassword(nextValue);
  };

  const calculateStrength = useMemo((): PasswordStrength => {
    const requirements = PASSWORD_REQUIREMENTS.map((req, index) => ({
      met: req.regex.test(password),
      text: requirementTexts?.[index] ?? req.text,
    }));

    return {
      score: requirements.filter((req) => req.met).length as StrengthScore,
      requirements,
    };
  }, [password, requirementTexts]);

  return (
    <div className="w-full">
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-[color:var(--headline)]">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => handleChange(e.target.value)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={calculateStrength.score < 4}
            aria-describedby="password-strength"
            className={`h-12 w-full rounded-xl border-2 bg-white px-4 pr-11 outline-none transition focus-within:border-[color:var(--accent)] ${
              error ? "border-red-300" : "border-[#ebe1d5]"
            }`}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground/80"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}

      {showStrength ? (
        <>
          <div
            className="mb-3 mt-2 h-1 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuenow={calculateStrength.score}
            aria-valuemin={0}
            aria-valuemax={4}
          >
            <div
              className={`h-full ${STRENGTH_CONFIG.colors[calculateStrength.score]} transition-all duration-500`}
              style={{ width: `${(calculateStrength.score / 5) * 100}%` }}
            />
          </div>

          <p
            id="password-strength"
            className={`mb-2 flex justify-between font-medium text-[color:var(--headline)] ${
              compact ? "text-[13px]" : "text-sm"
            }`}
          >
            <span>{mustContainLabel}</span>
            <span>
              {
                (strengthTexts?.[
                  Math.min(
                    calculateStrength.score,
                    4,
                  ) as keyof typeof STRENGTH_CONFIG.texts
                ] ??
                STRENGTH_CONFIG.texts[
                  Math.min(
                    calculateStrength.score,
                    4,
                  ) as keyof typeof STRENGTH_CONFIG.texts
                ])
              }
            </span>
          </p>

          <ul
            className={`${compact ? "grid gap-x-4 gap-y-1 sm:grid-cols-2" : "space-y-1"}`}
            aria-label="Password requirements"
          >
            {calculateStrength.requirements.map((req, index) => (
              <li key={index} className="flex items-center space-x-2">
                {req.met ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <X size={16} className="text-muted-foreground/80" />
                )}
                <span
                  className={`${compact ? "text-[11px]" : "text-xs"} ${
                    req.met ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}
                >
                  {req.text}
                  <span className="sr-only">
                    {req.met ? ' - Requirement met' : ' - Requirement not met'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
};

export default PasswordInput;
