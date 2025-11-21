import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="mobile-container">
      <div className="mobile-content">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
