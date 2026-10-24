import { Wifi } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-emerald-900/95 px-3 py-2 text-white backdrop-blur sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 p-1 sm:h-10 sm:w-10 sm:p-1.5">
            <Logo />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Guru Tafsir</h1>
            <p className="text-[10px] leading-none text-emerald-200">Pelajari tafsir Al Quran</p>
          </div>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-emerald-800 px-2 py-1 text-[10px] font-medium text-amber-300 sm:flex">
          <Wifi className="h-3 w-3" />
          <span className="hidden sm:inline">Live from Quran.com API</span>
        </div>
      </div>
    </header>
  );
}
