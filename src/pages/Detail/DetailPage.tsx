import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import DetailPageHeader from './components/DetailPageHeader';
import DetailCalendar from './components/DetailCalendar';
import Checklist from './components/Checklist';
import EmptyDateActions from './components/EmptyDateActions';
import { getCalendar } from './services/takingLog';
import { getCaregiverLinks } from '@/pages/Home/services/caregiverLink';
import { getUser } from '@/pages/Auth/services/user';
import type { CalendarDay, CalendarSlot } from './types/takingLog';
import type { DateChecklist, ChecklistItem } from '@/types/checklist';

interface Elder {
    id: string;
    name: string;
    linkId?: number; // CaregiverLink의 id (정렬 순서 유지용)
}

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentElder, setCurrentElder] = useState<Elder | null>(null);
    const [elders, setElders] = useState<Elder[]>([]);
    const [isEldersLoading, setIsEldersLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
    const [checklistData, setChecklistData] = useState<Record<string, DateChecklist>>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    // API에서 캘린더 데이터 가져오기
    const fetchCalendarData = useCallback(async (year: number, month: number) => {
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

            console.log('[DetailPage] API 응답 데이터:', calendarData);
            console.log('[DetailPage] days 배열:', calendarData.days);

            calendarData.days.forEach((day: CalendarDay) => {
                // slots가 있고 길이가 0보다 큰 경우에만 체크리스트 생성
                if (day.slots && day.slots.length > 0) {
                    const items: ChecklistItem[] = day.slots.map((slot: CalendarSlot, index: number) => {
                        // scheduleType을 한글로 변환
                        const typeMap: Record<string, string> = {
                            'MORNING': '아침약',
                            'LUNCH': '점심약',
                            'EVENING': '저녁약',
                            'BEDTIME': '취침전약',
                        };

                        // slotId가 null인 경우 scheduleId와 scheduledDateTime을 조합하여 고유 ID 생성
                        const itemId = slot.slotId !== null
                            ? slot.slotId.toString()
                            : `${slot.scheduleId}-${slot.scheduledDateTime}-${index}`;

                        return {
                            id: itemId,
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
                    });

                    convertedData[day.date] = {
                        date: day.date,
                        items,
                        status: day.status,
                        takenRatio: day.takenRatio,
                        requiredCount: day.requiredCount,
                        takenCount: day.takenCount,
                    };
                } else {
                    // slots가 없거나 빈 배열인 경우에도 status 정보는 저장
                    // NONE 상태인 경우를 위해
                    convertedData[day.date] = {
                        date: day.date,
                        items: [],
                        status: day.status,
                        takenRatio: day.takenRatio,
                        requiredCount: day.requiredCount,
                        takenCount: day.takenCount,
                    };
                }
            });

            setChecklistData(convertedData);
        } catch (error: any) {
            // 에러는 takingLog.ts에서 이미 로깅됨
            setChecklistData({});
        } finally {
            setIsLoading(false);
        }
    }, [currentElder]);

    // 어르신 목록 조회 (등록된 피보호자 목록)
    useEffect(() => {
        const fetchElders = async () => {
            setIsEldersLoading(true);
            try {
                const links = await getCaregiverLinks();

                // CaregiverLink의 id 기준으로 정렬 (가장 먼저 연결된 것이 첫 번째)
                const sortedLinks = [...links].sort((a, b) => a.id - b.id);

                // 각 피보호자의 사용자 정보를 병렬로 가져오기
                const elderPromises = sortedLinks.map(async (link) => {
                    try {
                        const userInfo = await getUser(link.seniorId);
                        return {
                            id: link.seniorId.toString(),
                            name: userInfo.name,
                            linkId: link.id, // 정렬 순서 유지를 위해 linkId 저장
                        };
                    } catch (error) {
                        console.error(`피보호자 ${link.seniorId} 정보 조회 실패:`, error);
                        // 에러 발생 시 기본값 사용
                        return {
                            id: link.seniorId.toString(),
                            name: `피보호자 ${link.seniorId}`,
                            linkId: link.id,
                        };
                    }
                });

                const fetchedElders = await Promise.all(elderPromises);
                setElders(fetchedElders);

                if (fetchedElders.length === 0) {
                    // 피보호자가 없으면 currentElder를 null로 설정하여 에러 메시지 표시
                    setCurrentElder(null);
                    return;
                }

                // URL의 id와 일치하는 피보호자를 찾고, 없으면 첫 번째 피보호자를 기본값으로 사용
                const targetElder = fetchedElders.find((e) => e.id === id) || fetchedElders[0];

                setCurrentElder(targetElder);
                // URL이 현재 선택된 피보호자와 다른 경우에만 URL을 업데이트
                if (id !== targetElder.id) {
                    navigate(`/detail/${targetElder.id}`, { replace: true });
                }
            } catch (error) {
                console.error('피보호자 목록 조회 실패:', error);
                // 에러 발생 시 빈 배열로 설정하고 currentElder도 null로 설정
                setElders([]);
                setCurrentElder(null);
            } finally {
                setIsEldersLoading(false);
            }
        };

        fetchElders();
    }, [id, navigate]);


    // 어르신이 변경되거나 월이 변경되면 캘린더 데이터 로드
    useEffect(() => {
        if (currentElder) {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1; // getMonth()는 0부터 시작
            fetchCalendarData(year, month);
        }
    }, [currentElder, currentMonth, fetchCalendarData]);

    // 페이지가 포커스를 받을 때 캘린더 데이터 새로고침 (처방전 등록 후 돌아올 때 반영)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && currentElder) {
                // 페이지가 다시 보일 때 캘린더 데이터 새로고침
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;
                fetchCalendarData(year, month);
            }
        };

        const handleFocus = () => {
            if (currentElder) {
                // 페이지에 포커스가 돌아올 때 캘린더 데이터 새로고침
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;
                fetchCalendarData(year, month);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
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
        const result = checklistData[dateKey] || null;
        console.log('[DetailPage] getSelectedDateChecklist:', {
            dateKey,
            hasData: !!result,
            itemsCount: result?.items.length || 0,
            status: result?.status,
            checklistDataKeys: Object.keys(checklistData),
        });
        return result;
    };

    if (!currentElder) {
        if (isEldersLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            );
        }
        if (elders.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-gray-500 mb-2">등록된 피보호자가 없습니다.</p>
                        <p className="text-sm text-gray-400">홈 화면에서 피보호자를 연결해주세요.</p>
                    </div>
                </div>
            );
        }
        // Fallback: elders loaded but currentElder가 아직 선택되지 않은 경우
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full relative">
            <DetailPageHeader
                currentElder={currentElder}
                elders={elders}
                onElderChange={handleElderChange}
                currentMonth={currentMonth}
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
                {(() => {
                    const selectedChecklist = getSelectedDateChecklist();
                    const hasItems = selectedChecklist && selectedChecklist.items.length > 0;

                    if (isDateClicked) {
                        if (hasItems) {
                            return (
                                <div className="mt-4 px-4">
                                    <Checklist
                                        date={selectedChecklist!.date}
                                        items={selectedChecklist!.items}
                                        elderName={currentElder.name}
                                        userId={Number(currentElder.id)}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <EmptyDateActions
                                    date={selectedDate}
                                    isDateClicked={isDateClicked}
                                    userId={Number(currentElder.id)}
                                />
                            );
                        }
                    } else {
                        return (
                            <EmptyDateActions
                                date={selectedDate}
                                isDateClicked={isDateClicked}
                                userId={Number(currentElder.id)}
                            />
                        );
                    }
                })()}
            </div>
        </div>
    );
};

export default DetailPage;
