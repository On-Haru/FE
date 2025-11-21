import { useNavigate, useLocation } from 'react-router-dom';
import { House, Pill, Calendar, User } from 'lucide-react';
import { FOOTER_ROUTES, ROUTES } from '@/constants/routes';

const FOOTER_ITEMS = [
  { label: '홈', path: FOOTER_ROUTES[0], icon: House },
  { label: '달력', path: FOOTER_ROUTES[1], icon: Calendar },
  {
    label: '처방전',
    path: FOOTER_ROUTES[2],
    icon: Pill,
    activePrefix: '/medicine',
  },
  { label: '마이페이지', path: FOOTER_ROUTES[3], icon: User },
] as const;

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <footer className="sticky h-15 bottom-0 bg-white border-t border-gray-200 z-10">
      <nav className="flex justify-around items-center pb-3">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          // 처방전 등록 페이지일 때도 활성화
          const isActive =
            location.pathname === item.path ||
            ('activePrefix' in item &&
              location.pathname.startsWith(item.activePrefix));

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
