import { ScrollContainer } from "@/components/feed/ScrollContainer";
import { SidebarUserNav } from "@/components/SidebarUserNav";
import { Home, Library, Search, Settings, User } from "lucide-react";
import Link from "next/link";

export default function HomeLayout() {
  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-white/10 bg-black/50 backdrop-blur-xl p-6 z-20">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Resonance
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Discover"
            active
          />
          <NavItem icon={<Search className="w-5 h-5" />} label="Search" />
          <NavItem icon={<Library className="w-5 h-5" />} label="Library" />
        </nav>
        <div className="pt-6 border-t border-white/10 space-y-2">
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
          <SidebarUserNav />
        </div>
      </aside>

      <main className="flex-1 relative h-full w-full">
        <ScrollContainer />

        <div className="md:hidden absolute top-0 left-0 w-full p-4 z-20 bg-linear-to-b from-black/80 to-transparent pointer-events-none">
          <h1 className="text-xl font-bold tracking-tighter text-white">
            Resonance
          </h1>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 flex items-center justify-around px-2">
        <MobileNavItem
          icon={<Home className="w-6 h-6" />}
          label="Home"
          active
        />
        <MobileNavItem icon={<Search className="w-6 h-6" />} label="Search" />
        <MobileNavItem icon={<Library className="w-6 h-6" />} label="Library" />
        <MobileNavItem icon={<User className="w-6 h-6" />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href="#"
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${active ? "bg-primary/20 text-primary font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href="#"
      className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? "text-primary" : "text-white/50"}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
