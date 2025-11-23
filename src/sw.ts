/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

type WBManifestEntry = {
  url: string;
  revision?: string;
};

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: WBManifestEntry[];
};

// Injected by VitePWA's injectManifest strategy so Workbox knows what to precache
precacheAndRoute(self.__WB_MANIFEST);

// API 요청은 네트워크로만 전송 (캐시하지 않음)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly()
);

self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] ========== Push 이벤트 수신! ==========');
  console.log('[Service Worker] Push 이벤트 객체:', {
    type: event.type,
    timeStamp: event.timeStamp,
    hasData: !!event.data,
  });
  

  let data: {
    title: string;
    body: string;
    scheduleId?: number;
    scheduledDateTime?: string;
  } = {
    title: '약 드실 시간입니다!',
    body: '복용할 약이 있습니다.',
  };

  try {
    if (event.data) {
      const rawData = event.data.text();
      console.log('[Service Worker] Push 원본 데이터 (text):', rawData);
      
      try {
        data = event.data.json();
        console.log('[Service Worker] Push 파싱된 데이터 (JSON):', data);
      } catch (jsonError) {
        console.error('[Service Worker] JSON 파싱 실패, 텍스트로 처리:', jsonError);
        // 텍스트가 JSON이 아닐 수도 있으므로 기본값 사용
      }
    } else {
      console.warn('[Service Worker] ⚠️ Push 이벤트에 데이터가 없습니다!');
    }
  } catch (error) {
    console.error('[Service Worker] ❌ Push 데이터 파싱 실패:', error);
    // fallback keeps default data
  }

  const { title, body, scheduleId, scheduledDateTime } = data;

  event.waitUntil(
    (async () => {
      try {
        const notificationOptions = {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `medication-${scheduleId || 'default'}`,
          data: {
            scheduleId,
            scheduledDateTime,
            title,
            body,
          },
        };
        
        console.log('[Service Worker] 알림 옵션:', notificationOptions);
        console.log('[Service Worker] 알림 표시 시도 중...');
        
        await self.registration.showNotification(title, notificationOptions);
        console.log('[Service Worker] ✅ 알림 표시 성공!');
      } catch (error) {
        console.error('[Service Worker] ❌ 알림 표시 실패:', error);
        console.error('[Service Worker] 에러 상세:', {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
      }

      // BroadcastChannel을 사용하여 메시지 전송 (더 확실함)
      try {
        const channel = new BroadcastChannel('push-notification');
n
        const message = {
          type: 'PUSH_RECEIVED',
          payload: {
            title,
            body,
            scheduleId,
            scheduledDateTime,
            receivedAt: Date.now(),
          },
        };
        channel.postMessage(message);
        console.log('[Service Worker] BroadcastChannel로 메시지 전송:', message);
        channel.close();
      } catch (error) {
        console.error('[Service Worker] BroadcastChannel 전송 실패:', error);
      }

      // 기존 방식도 유지 (클라이언트에 직접 전송)
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      console.log('[Service Worker] 클라이언트 수:', windowClients.length);

      if (windowClients.length > 0) {
        // 어르신 페이지(/elder) 클라이언트 찾기
        const elderClients = windowClients.filter((client) =>
          client.url.includes('/elder')
        );
        
        console.log('[Service Worker] 전체 클라이언트 수:', windowClients.length);
        console.log('[Service Worker] 어르신 페이지 클라이언트 수:', elderClients.length);
        windowClients.forEach((client) => {
          console.log('[Service Worker] 클라이언트 URL:', client.url);
        });

        // 어르신 페이지 클라이언트에만 메시지 전송
        const targetClients = elderClients.length > 0 ? elderClients : windowClients;
        
        for (const client of targetClients) {
          console.log('[Service Worker] 클라이언트에 메시지 전송:', client.url);
          try {
            client.postMessage({
              type: 'PUSH_RECEIVED',
              payload: {
                title,
                body,
                scheduleId,
                scheduledDateTime,
                receivedAt: Date.now(),
              },
            });
            console.log('[Service Worker] ✅ 클라이언트 메시지 전송 성공:', client.url);
          } catch (error) {
            console.error('[Service Worker] ❌ 클라이언트 메시지 전송 실패:', client.url, error);
          }
        }
      } else {
        console.warn('[Service Worker] ⚠️ 열려있는 클라이언트가 없습니다.');

      }
    })()
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // 이미 열려있는 클라이언트가 있으면 포커스
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          await client.focus();
          // 알림 데이터 전송
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: notificationData,
          });
          return;
        }
      }

      // 열려있는 클라이언트가 없으면 새로 열기
      if (self.clients.openWindow) {
        await self.clients.openWindow('/elder');
      }
    })()
  );
});
