import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

const Layout = () => {
  return (
    <div className="mobile-container">
      <div className="mobile-content">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
