import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from "../../../context/SidebarContext";

export function CollapseButton() {
  const { collapsed, toggleCollapsed } = useSidebar();
  return (
    <button
      onClick={toggleCollapsed}
      className="w-full mt-2 py-1 flex justify-center text-white/30 hover:text-white/60 transition-colors"
    >
      {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}