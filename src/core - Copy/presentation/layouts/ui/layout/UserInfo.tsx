interface User {
    full_name: string;
    position?: string;
    role: string;
  }
  
  interface UserInfoProps {
    user: User;
    collapsed: boolean;
  }
  
  export function UserInfo({ user, collapsed }: UserInfoProps) {
    const initial = user.full_name?.[0] === 'م' 
      ? user.full_name?.[2] || user.full_name[0]
      : user.full_name?.[0] || '';
  
    return (
      <div className={`flex items-center gap-2 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md">
          {initial}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">{user.full_name}</div>
            <div className="text-[11px] text-white/50 truncate">{user.position || 'موظف'}</div>
          </div>
        )}
      </div>
    );
  }