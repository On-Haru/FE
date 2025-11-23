import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import DetailPageHeader from './components/DetailPageHeader';
import DetailCalendar from './components/DetailCalendar';
import Checklist from './components/Checklist';
import EmptyDateActions from './components/EmptyDateActions';
import { getCalendar } from './services/takingLog';
import type { CalendarDay, CalendarSlot } from './types/takingLog';
import type { DateChecklist, ChecklistItem } from '@/types/checklist';

interface Elder {
  id: string;
  name: string;
}

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentElder, setCurrentElder] = useState<Elder | null>(null);
  const [elders, setElders] = useState<Elder[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
  const [checklistData, setChecklistData] = useState<
    Record<string, DateChecklist>
  >({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // API에서 캘린더 데이터 가져오기
  const fetchCalendarData = useCallback(
    async (year: number, month: number) => {
      if (!currentElder) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userId = Number(currentElder.id); // userId는 숫자여야 함
        const calendarData = await getCalendar(year, month, userId);

        // API 응답이 유효한지 확인
        if (!calendarData) {
          setChecklistData({});
          setIsLoading(false);
          return;
        }

        if (!calendarData.days || !Array.isArray(calendarData.days)) {
          setChecklistData({});
          setIsLoading(false);
          return;
        }

        // API 응답을 checklist 형식으로 변환
        const convertedData: Record<string, DateChecklist> = {};

        calendarData.days.forEach((day: CalendarDay) => {
          // slots가 있고 길이가 0보다 큰 경우에만 체크리스트 생성
          if (day.slots && day.slots.length > 0) {
            const items: ChecklistItem[] = day.slots.map(
              (slot: CalendarSlot) => {
                // scheduleType을 한글로 변환
                const typeMap: Record<string, string> = {
                  MORNING: '아침약',
                  LUNCH: '점심약',
                  EVENING: '저녁약',
                  BEDTIME: '취침전약',
                };

                return {
                  id: slot.slotId.toString(),
                  label: `${typeMap[slot.scheduleType] || slot.scheduleType} : ${slot.medicineName}`,
                  checked: slot.taken,
                  // API 데이터를 저장하기 위한 추가 필드
                  scheduleId: slot.scheduleId,
                  scheduledDateTime: slot.scheduledDateTime,
                  takenDateTime: slot.takenDateTime,
                  delayMinutes: slot.delayMinutes,
                } as ChecklistItem & {
                  scheduleId: number;
                  scheduledDateTime: string;
                  takenDateTime: string | null;
                  delayMinutes: number | null;
                };
              }
            );

            convertedData[day.date] = {
              date: day.date,
              items,
            };
          }
          // slots가 없거나 빈 배열인 경우는 convertedData에 추가하지 않음
          // 이렇게 하면 getSelectedDateChecklist()가 null을 반환하여 EmptyDateActions가 표시됨
        });

        setChecklistData(convertedData);
      } catch (error: any) {
        // 에러는 takingLog.ts에서 이미 로깅됨
        setChecklistData({});
      } finally {
        setIsLoading(false);
      }
    },
    [currentElder]
  );

  // 어르신 목록 조회 (TODO: 실제 API로 교체)
  useEffect(() => {
    const mockElders: Elder[] = [
      { id: '1001', name: '김노인' },
      { id: '2', name: '이노인' },
      { id: '3', name: '박노인' },
    ];
    setElders(mockElders);

    if (!id || mockElders.length === 0) {
      if (mockElders.length > 0) {
        const firstElderId = mockElders[0].id;
        navigate(`/detail/${firstElderId}`, { replace: true });
        return;
      }
    }

    const elder = mockElders.find((e) => e.id === id);
    if (elder) {
      setCurrentElder(elder);
    } else if (mockElders.length > 0) {
      const firstElderId = mockElders[0].id;
      navigate(`/detail/${firstElderId}`, { replace: true });
    }
  }, [id, navigate]);

  // 어르신이 변경되거나 월이 변경되면 캘린더 데이터 로드
  useEffect(() => {
    if (currentElder) {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // getMonth()는 0부터 시작
      fetchCalendarData(year, month);
    }
  }, [currentElder, currentMonth, fetchCalendarData]);

  const handleElderChange = (elderId: string) => {
    const elder = elders.find((e) => e.id === elderId);
    if (elder) {
      setCurrentElder(elder);
    }
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setIsDateClicked(true);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const getSelectedDateChecklist = (): DateChecklist | null => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return checklistData[dateKey] || null;
  };

  if (!currentElder) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-full relative">
      <DetailPageHeader
        currentElder={currentElder}
        elders={elders}
        onElderChange={handleElderChange}
      />
      <div className="flex-1 overflow-y-auto py-3">
        <DetailCalendar
          checklistData={checklistData}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          isLoading={isLoading}
        />
        {isDateClicked ? (
          <>
            {getSelectedDateChecklist() &&
            getSelectedDateChecklist()!.items.length > 0 ? (
              <div className="mt-4 px-4">
                <Checklist
                  date={getSelectedDateChecklist()!.date}
                  items={getSelectedDateChecklist()!.items}
                  elderName={currentElder.name}
                  userId={Number(currentElder.id)}
                />
              </div>
            ) : (
              <EmptyDateActions
                date={selectedDate}
                elderName={currentElder.name}
                isDateClicked={isDateClicked}
              />
            )}
          </>
        ) : (
          <EmptyDateActions
            date={selectedDate}
            elderName={currentElder.name}
            isDateClicked={isDateClicked}
          />
        )}
      </div>
    </div>
  );
};

export default DetailPage;
