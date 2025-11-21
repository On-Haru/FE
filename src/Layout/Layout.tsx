import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

const Layout = () => {
  return (
    <div className="mobile-container">
      <Header />
      <div className="mobile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
