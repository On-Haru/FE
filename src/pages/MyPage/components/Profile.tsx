import { UserRound } from 'lucide-react';

interface MyPageProfileProps {
  name: string;
  onLogout: () => void;
}

const Profile = ({ name, onLogout }: MyPageProfileProps) => {
  return (
    <div className="flex flex-col mt-16 ml-4 gap-4">
      {/* 프로필 아이콘 */}
      <UserRound className="w-10 h-10 text-gray-500" />

      {/* 이름 */}
      <span className="text-2xl font-semibold">{name} 님</span>

      {/* 로그아웃 버튼 */}
      <button
        onClick={onLogout}
        className="w-fit mt-10 px-10 py-2 rounded-xl bg-red-100 text-red-500 font-medium"
      >
        로그아웃
      </button>
    </div>
  );
};

export default Profile;