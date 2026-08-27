import type { ReactNode } from "react";
import { translations } from "../../i18n";
import type { Language } from "../plainspeak/types/language";
import {
  Gift,
  Infinity,
  ShieldCheck,
} from "lucide-react";

type TrustItemProps = {
  icon: ReactNode;
  children: ReactNode;
};

function TrustItem({ icon, children }: TrustItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-sm">
      <span
        className="flex shrink-0 items-center justify-center text-[#4F7C6B]"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="whitespace-nowrap text-sm font-medium text-slate-700">
        {children}
      </span>
    </div>
  );
}
type TrustBarProps = {
  language: Language;
};
export function TrustBar({ language }: TrustBarProps) {
  const t = translations[language];
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3"
      aria-label={t.trustBarLabel}
    >
      <TrustItem icon={<Gift size={18} strokeWidth={2} />}>
        {t.trustFreeKey}
      </TrustItem>

      <TrustItem icon={<Infinity size={19} strokeWidth={2} />}>
        {t.trustNeverExpire}
      </TrustItem>

      <TrustItem icon={<ShieldCheck size={18} strokeWidth={2} />}>
        {t.trustDeleted}
      </TrustItem>
    </div>
  );
}

export default TrustBar;