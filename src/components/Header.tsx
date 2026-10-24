import { Wifi } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-emerald-900/95 px-4 py-3 text-white backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 p-1.5">
            <Logo />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight md:text-base">Guru Tafsir</h1>
            <p className="text-[10px] text-emerald-200">Pelajari tafsir Al Quran</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-800 px-2.5 py-1 text-[10px] font-medium text-amber-300">
          <Wifi className="h-3 w-3" />
          Live from Quran.com API
        </div>
      </div>
    </header>
  );
}
