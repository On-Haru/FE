import { Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import DetailPage from './pages/Detail/DetailPage';
import ElderPage from './pages/Elder/ElderPage';
import HomePage from './pages/Home/HomePage';
import PreviousMedicinePage from './pages/PreviousMedicine/PreviousMedicinePage'
import MedicineDetailPage from './pages/MedicineDetail/MedicineDetailPage'
import MedicineRegisterPage from './pages/MedicineRegister/MedicineRegisterPage';
import MyPagePage from './pages/MyPage/MyPagePage';
import ReportPage from './pages/Report/ReportPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/elder" element={<ElderPage />} />
        <Route path="/medicine/previous" element={<PreviousMedicinePage />} />
        <Route path="/medicine/detail" element={<MedicineDetailPage />} />
        <Route path="/medicine/register" element={<MedicineRegisterPage />} />
        <Route path="/mypage" element={<MyPagePage />} />
        <Route path="/report" element={<ReportPage />} />
      </Route>
    </Routes>
  );
}

export default App;