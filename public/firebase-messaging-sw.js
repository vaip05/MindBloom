/*
 * Firebase Cloud Messaging service worker.
 * Replace the placeholder values below with the matching VITE_FIREBASE_*
 * values from your local .env file. These web Firebase configuration values
 * are safe to expose in a browser; never put a service-account private key here.
 */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyC13Haj-NqYFQdTqO9naLPU8Ckvir4pg6g',
  authDomain: 'mindbloom-66aa0.firebaseapp.com',
  projectId: 'mindbloom-66aa0',
  storageBucket: 'mindbloom-66aa0.firebasestorage.app',
  messagingSenderId: '956375754407',
  appId: '1:956375754407:web:e8b72d7a1c7c27d5eb9d82',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {}
  const title = data.title || 'MindBloom wellness reminder'
  const body = data.body || 'Take a moment for yourself.'

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'mindbloom-reminder',
    requireInteraction: true,
    data: {
      link: data.link || '/reminders',
      reminderId: data.reminderId || '',
    },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/reminders'
  event.waitUntil(clients.openWindow(link))
})
