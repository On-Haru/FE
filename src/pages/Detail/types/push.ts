// Push 알림 API 타입 정의

// 알림 발송 요청 타입
export interface NotifyRequest {
    scheduleId?: number;
    title: string;
    body: string;
}

// 구독 등록 요청 타입
export interface SubscribeRequest {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
}

