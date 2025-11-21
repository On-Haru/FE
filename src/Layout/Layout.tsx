import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUserTypeFromPath, USER_TYPE } from '@/types/user';

const Layout = () => {
  const location = useLocation();
  const userType = getUserTypeFromPath(location.pathname);
  const isElder = userType === USER_TYPE.ELDER;

  return (
    <div className="mobile-container flex flex-col">
      <div className="mobile-content flex-1 flex flex-col overflow-y-auto relative">
        <Header />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
        {!isElder && <Footer />}
      </div>
    </div>
  );
};

export default Layout;