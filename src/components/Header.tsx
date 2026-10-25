import { Wifi } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b-4 border-black bg-teal-700 px-3 py-2 text-white sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-none border-2 border-white bg-white sm:h-10 sm:w-10">
            <Logo />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight sm:text-xl">Guru Tafsir</h1>
            <p className="text-xs font-medium leading-none text-teal-100 sm:text-sm">Pelajari tafsir Al Quran</p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 rounded-none border-2 border-white bg-black px-2 py-1 text-[10px] font-bold text-white sm:flex">
          <Wifi className="h-3 w-3" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}
