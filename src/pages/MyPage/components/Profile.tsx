import { UserRound, Download, ChevronRight, LogOut } from 'lucide-react';
import { useInstallPrompt } from '@/contexts/InstallPromptContext';

interface MyPageProfileProps {
  name: string;
  onLogout: () => void;
}

const Profile = ({ name, onLogout }: MyPageProfileProps) => {
  const { showInstallPrompt } = useInstallPrompt();

  const handleInstallClick = () => {
    console.log('앱 설치하기 클릭됨');
    // 사용자가 명시적으로 클릭한 경우이므로 force=true로 전달
    showInstallPrompt(true);
  };

  return (
    <div className="flex flex-col mt-16 gap-4">
      {/* 프로필 아이콘 */}
      <UserRound className="w-10 h-10 text-gray-500" />

      {/* 이름 */}
      <span className="text-2xl font-semibold">{name} 님</span>

      {/* 메뉴 리스트 */}
      <div className="mt-8 space-y-2">
        {/* 앱 설치하기 */}
        <div
          onClick={handleInstallClick}
          className="flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-primary" />
            <span className="text-base font-medium text-gray-900">앱 설치하기</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* 로그아웃 */}
        <div
          onClick={onLogout}
          className="flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-base font-medium text-red-500">로그아웃</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Profile;