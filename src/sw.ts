/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

type WBManifestEntry = {
  url: string;
  revision?: string;
};

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: WBManifestEntry[];
};

// Injected by VitePWA's injectManifest strategy so Workbox knows what to precache
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] Push 이벤트 수신!', event);

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
      // Push 데이터는 JSON 형식이므로 json()으로 파싱
      data = event.data.json();
      console.log('[Service Worker] Push 파싱된 데이터:', data);
    } else {
      console.log('[Service Worker] Push 이벤트에 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('[Service Worker] Push 데이터 파싱 실패:', error);
    // fallback keeps default data
  }

  const { title, body, scheduleId, scheduledDateTime } = data;
  console.log('[Service Worker] 알림 표시 예정:', {
    title,
    body,
    scheduleId,
    scheduledDateTime,
  });

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, {
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
        });
        console.log('[Service Worker] 알림 표시 성공!');
      } catch (error) {
        console.error('[Service Worker] 알림 표시 실패:', error);
      }

      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      console.log('[Service Worker] 클라이언트 수:', windowClients.length);

      for (const client of windowClients) {
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
        console.log('[Service Worker] 클라이언트에 메시지 전송:', message);
        client.postMessage(message);
      }

      // 클라이언트가 없어도 알림은 표시됨 (이미 위에서 표시함)
      if (windowClients.length === 0) {
        console.log(
          '[Service Worker] 열려있는 클라이언트가 없습니다. 알림만 표시됨.'
        );
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
