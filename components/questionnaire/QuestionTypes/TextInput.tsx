"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  isLong?: boolean;
  placeholder?: string;
  colorTheme: string;
}

export default function TextInput({ value, onChange, isLong = false, placeholder = "Type your answer...", colorTheme }: Props) {
  const focusRing = () => {
    if (colorTheme === "Parent") return "focus:ring-yellow-500/50";
    if (colorTheme === "Partner") return "focus:ring-rose-500/50";
    if (colorTheme === "Friend") return "focus:ring-blue-500/50";
    return "focus:ring-amber-500/50";
  };

  const className = `w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 ${focusRing()} transition-all font-inter`;

  if (isLong) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={4}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
