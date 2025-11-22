import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUserTypeFromPath, USER_TYPE } from '@/types/user';
import { isAuthPage } from '@/constants/routes';

const Layout = () => {
  const location = useLocation();
  const userType = getUserTypeFromPath(location.pathname);
  const isElder = userType === USER_TYPE.ELDER;
  const authPage = isAuthPage(location.pathname);

  return (
    <div className="mobile-container flex flex-col">
      {!authPage && <Header />}
      
      <main className="mobile-content flex-1 min-h-0 overflow-y-auto p-4">
        <Outlet />
      </main>

      {!isElder && !authPage && <Footer />}
    </div>
  );
};

export default Layout;
