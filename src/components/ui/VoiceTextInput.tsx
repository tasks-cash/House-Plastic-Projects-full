"use client";

import { Input } from "@/components/ui/Input";
import { VoiceControls } from "@/components/ui/VoiceControls";
import { VOICE_INPUT_ENABLED } from "@/lib/features";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";
import {
  InputHTMLAttributes,
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

interface VoiceTextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue" | "type"> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  page?: string;
  fieldName?: string;
  trackTextHistory?: boolean;
}

const VOICE_TYPES = new Set(["text", "search", "tel", "url", "email", undefined]);

const VoiceTextInputWithVoice = forwardRef<HTMLInputElement, VoiceTextInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      value,
      defaultValue = "",
      onChange,
      disabled,
      type = "text",
      page = "general",
      fieldName = "input",
      trackTextHistory = true,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-") || generatedId;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const textValue = isControlled ? value : internalValue;

    const setText = useCallback(
      (next: string) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const voice = useVoiceInput({
      page,
      fieldName,
      value: textValue,
      onChange: setText,
      trackTextHistory,
    });

    const textHistoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleTextHistory = () => {
      if (!trackTextHistory) return;
      if (textHistoryTimer.current) clearTimeout(textHistoryTimer.current);
      textHistoryTimer.current = setTimeout(() => {
        void voice.persistTextHistory();
      }, 1200);
    };

    const showVoice = VOICE_TYPES.has(type);

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={textValue}
          onChange={(e) => {
            setText(e.target.value);
            scheduleTextHistory();
          }}
          onBlur={() => void voice.persistTextHistory()}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5",
            "text-sm text-zinc-100 placeholder:text-zinc-500",
            "transition-colors duration-200",
            "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            voice.isVoiceActive && "border-emerald-500/40 ring-1 ring-emerald-500/20",
            error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}

        {showVoice && voice.supported === true && (
          <VoiceControls
            id={inputId}
            supported={voice.supported}
            lang={voice.lang}
            onLangChange={voice.setLang}
            isActive={voice.isVoiceActive}
            isSaving={voice.isSaving}
            level={voice.level}
            audioUrl={voice.audioUrl}
            onToggle={voice.toggleVoice}
            onClearAudio={voice.clearAudio}
            disabled={disabled}
            compact
          />
        )}
      </div>
    );
  }
);

VoiceTextInputWithVoice.displayName = "VoiceTextInputWithVoice";

export const VoiceTextInput = forwardRef<HTMLInputElement, VoiceTextInputProps>(
  ({ onChange, page, fieldName, trackTextHistory, ...props }, ref) => {
    if (!VOICE_INPUT_ENABLED) {
      const { value, defaultValue, type, className, label, error, hint, ...rest } = props;
      return (
        <Input
          ref={ref}
          label={label}
          error={error}
          hint={hint}
          value={value}
          defaultValue={defaultValue}
          type={type}
          className={className}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          {...rest}
        />
      );
    }

    return (
      <VoiceTextInputWithVoice
        ref={ref}
        onChange={onChange}
        page={page}
        fieldName={fieldName}
        trackTextHistory={trackTextHistory}
        {...props}
      />
    );
  }
);

VoiceTextInput.displayName = "VoiceTextInput";
