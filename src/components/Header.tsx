import { Wifi } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-teal-100 bg-teal-700 px-3 py-3 text-white backdrop-blur sm:px-4 sm:py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg sm:h-11 sm:w-11">
            <Logo />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight sm:text-xl">Guru Tafsir</h1>
            <p className="text-xs leading-none text-teal-100 sm:text-sm">Pelajari tafsir Al Quran</p>
          </div>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-teal-800 px-2.5 py-1.5 text-[11px] font-medium text-amber-300 sm:flex">
          <Wifi className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>
    </header>
  );
}
