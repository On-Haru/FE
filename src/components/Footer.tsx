import { useNavigate, useLocation } from 'react-router-dom';
import { House, Pill, Calendar, User } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: '홈', path: '/', icon: House },
    { label: '달력', path: '/calendar', icon: Calendar },
    { label: '처방전', path: '/medicine', icon: Pill },
    { label: '마이페이지', path: '/mypage', icon: User },
  ];

  return (
    <footer className="sticky h-15 bottom-0 bg-white border-t border-gray-200 z-10">
      <nav className="flex justify-around items-center py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5 mt-[10px]" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
