import { Routes, Route } from 'react-router-dom'
import CalendarPage from './pages/Calendar/CalendarPage'
import ElderPage from './pages/Elder/ElderPage'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Login/LoginPage'
import MedicineDetailPage from './pages/MedicineDetail/MedicineDetailPage'
import MedicineListPage from './pages/MedicineList/MedicineListPage'
import MedicineRegisterPage from './pages/MedicineRegister/MedicineRegisterPage'
import MyPagePage from './pages/MyPage/MyPagePage'
import ReportPage from './pages/Report/ReportPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/elder" element={<ElderPage />} />
      <Route path="/medicine" element={<MedicineListPage />} />
      <Route path="/medicine/:id" element={<MedicineDetailPage />} />
      <Route path="/medicine/register" element={<MedicineRegisterPage />} />
      <Route path="/mypage" element={<MyPagePage />} />
      <Route path="/report" element={<ReportPage />} />
    </Routes>
  )
}

export default App