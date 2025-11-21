import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Layout = () => {
  const location = useLocation();

  const userType = location.pathname.startsWith('/elder')
    ? 'elder'
    : 'caregiver';

  return (
    <div className="mobile-container flex flex-col">
      <div className="mobile-content flex-1 flex flex-col overflow-y-auto">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer userType={userType} />
      </div>
    </div>
  );
};

export default Layout;
