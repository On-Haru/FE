import { Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import DetailPage from './pages/Detail/DetailPage';
import ElderPage from './pages/Elder/ElderPage';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import MedicineDetailPage from './pages/MedicineDetail/MedicineDetailPage';
import MedicineListPage from './pages/MedicineList/MedicineListPage';
import MedicineRegisterPage from './pages/MedicineRegister/MedicineRegisterPage';
import MyPagePage from './pages/MyPage/MyPagePage';
import ReportPage from './pages/Report/ReportPage';
import RoleSelectPage from './pages/Auth/RoleSelectPage';
import SignupPage from './pages/Auth/SignupPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/elder" element={<ElderPage />} />
        <Route path="/medicine" element={<MedicineListPage />} />
        <Route path="/medicine/:id" element={<MedicineDetailPage />} />
        <Route path="/medicine/register" element={<MedicineRegisterPage />} />
        <Route path="/mypage" element={<MyPagePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/:role/signup/info" element={<SignupPage />} />
        <Route path="/:role/signup" element={<SignupPage />} />
        <Route path="/:role/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
