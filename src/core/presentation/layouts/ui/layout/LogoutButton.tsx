import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth state, redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        flex items-center gap-2 text-danger hover:bg-danger/10 rounded-md transition-all
        ${collapsed ? 'justify-center py-2 px-0' : 'px-3 py-2 justify-start'}
      `}
    >
      <LogOut size={18} />
      {!collapsed && <span className="text-sm font-semibold">خروج</span>}
    </button>
  );
}