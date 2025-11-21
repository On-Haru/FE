import Profile from "@/pages/MyPage/components/Profile";

const MyPagePage = () => {
  const userName = "김노인"; // TODO: API로 가져올 예정

  const handleLogout = () => {
    // TODO: 로그아웃 API + 토큰 삭제 + 이동 처리
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <Profile name={userName} onLogout={handleLogout} />
      <div className="flex-1" />
    </div>
  );
};

export default MyPagePage;