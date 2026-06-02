"use client";

import { Textarea } from "@/components/ui/Textarea";
import { VoiceControls } from "@/components/ui/VoiceControls";
import { VOICE_INPUT_ENABLED } from "@/lib/features";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";
import {
  TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

interface VoiceTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "defaultValue"> {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  page?: string;
  fieldName?: string;
}

const VoiceTextareaWithVoice = forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  (
    {
      className,
      label,
      id,
      value,
      defaultValue = "",
      onChange,
      disabled,
      page = "general",
      fieldName = "notes",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-") || generatedId;

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
    });

    const textHistoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleTextHistory = () => {
      if (textHistoryTimer.current) clearTimeout(textHistoryTimer.current);
      textHistoryTimer.current = setTimeout(() => {
        void voice.persistTextHistory();
      }, 1200);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          value={textValue}
          onChange={(e) => {
            setText(e.target.value);
            scheduleTextHistory();
          }}
          onBlur={() => void voice.persistTextHistory()}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5",
            "text-sm text-zinc-100 placeholder:text-zinc-500 min-h-[100px] resize-y",
            "transition-colors duration-200",
            "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            voice.isVoiceActive && "border-emerald-500/40 ring-1 ring-emerald-500/20",
            className
          )}
          {...props}
        />

        {voice.supported === true && (
          <VoiceControls
            id={textareaId}
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
          />
        )}
      </div>
    );
  }
);

VoiceTextareaWithVoice.displayName = "VoiceTextareaWithVoice";

export const VoiceTextarea = forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  ({ onChange, page, fieldName, ...props }, ref) => {
    if (!VOICE_INPUT_ENABLED) {
      const { value, defaultValue, className, label, ...rest } = props;
      return (
        <Textarea
          ref={ref}
          label={label}
          value={value}
          defaultValue={defaultValue}
          className={className}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          {...rest}
        />
      );
    }

    return (
      <VoiceTextareaWithVoice
        ref={ref}
        onChange={onChange}
        page={page}
        fieldName={fieldName}
        {...props}
      />
    );
  }
);

VoiceTextarea.displayName = "VoiceTextarea";
