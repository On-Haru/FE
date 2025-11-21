import { useState, useEffect } from 'react';

const DateTimeDisplay = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  const isAfternoon = hours >= 12;
  const displayHours = isAfternoon ? hours - 12 : hours;
  const displayHours12 = displayHours === 0 ? 12 : displayHours;
  const timePeriod = isAfternoon ? '오후' : '오전';

  const formattedDate = `${year}년 ${month}월 ${date}일`;
  const formattedTime = `${timePeriod} ${displayHours12}시 ${String(minutes).padStart(2, '0')}분`;
  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-base text-gray-700">
        {formattedDate} {formattedTime}
      </p>
    </div>
  );
};

export default DateTimeDisplay;
