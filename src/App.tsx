import { Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import DetailPage from './pages/Detail/DetailPage';
import ElderPage from './pages/Elder/ElderPage';
import HomePage from './pages/Home/HomePage';
import CaregiverConnectionPage from './pages/Home/CaregiverConnectionPage';
import LoginPage from './pages/Auth/LoginPage';
import RoleSelectPage from './pages/Auth/RoleSelectPage';
import SignupPage from './pages/Auth/SignupPage';
import PreviousMedicinePage from './pages/PreviousMedicine/PreviousMedicinePage';
import MedicineDetailPage from './pages/MedicineDetail/MedicineDetailPage';
import MedicineRegisterPage from './pages/MedicineRegister/MedicineRegisterPage';
import MyPagePage from './pages/MyPage/MyPagePage';
import ReportPage from './pages/Report/ReportPage';
import AppInstallPrompt from './components/AppInstallPrompt';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/connect" element={<CaregiverConnectionPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/elder" element={<ElderPage />} />
          <Route path="/medicine/previous" element={<PreviousMedicinePage />} />
          <Route path="/medicine/detail" element={<MedicineDetailPage />} />
          <Route path="/medicine/register" element={<MedicineRegisterPage />} />
          <Route path="/mypage" element={<MyPagePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/:role/signup/info" element={<SignupPage />} />
          <Route path="/:role/signup" element={<SignupPage />} />
          <Route path="/:role/login" element={<LoginPage />} />
        </Route>
      </Routes>
      <AppInstallPrompt />
    </>
  );
}

export default App;
