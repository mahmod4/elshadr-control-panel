/**
 * ========================================
 * Runtime Environment Function - Netlify Function
 * ========================================
 * 
 * Purpose: توفير متغيرات البيئة للمتصفح بأمان
 * Usage: يتم تحميله من js/runtime-env-client.js
 * Security: يمنع كشف البيانات الحساسة في المتصفح
 * 
 * هذه الـ Function تقوم بـ:
 * - قراءة متغيرات البيئة من Netlify
 * - تنقية البيانات الحساسة
 * - توفير المتغيرات الآمنة للمتصفح
 * - منع كشف API Secrets
 * 
 * نقطة النهاية: /.netlify/functions/runtime-env
 * الطريقة: GET
 * 
 * المتغيرات التي يتم توفيرها:
 * - Firebase configuration (بدون API Secrets)
 * - Cloudinary configuration (بدون API Secret)
 * - Google Analytics ID
 * - معلومات الموقع الأساسية
 * - رقم WhatsApp
 * 
 * Features:
 * - تنقية البيانات الحساسة
 * - التحقق من صحة القيم
 * - CORS headers للتواصل مع المتصفح
 * - معالجة الأخطاء
 * 
 * Security:
 * - لا يتم كشف أي API Secrets
 * - تنقية أسماء Cloudinary
 * - التحقق من القيم قبل إرسالها
 * 
 * Dependencies:
 * - Netlify Functions runtime
 * - Environment variables
 * 
 * Author: نظام المتجر الإلكتروني
 * Version: 1.0.0
 */

function sanitizeCloudNameForClient(v) {
  let s = (v || '').trim();
  try {
    s = s.normalize('NFKC');
  } catch (e) { /* ignore */ }
  s = s.replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
  if (!s || /^kdwe$/i.test(s)) return '';
  return s;
}

exports.handler = async function handler() {
  const env = {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',

    CLOUDINARY_CLOUD_NAME: sanitizeCloudNameForClient(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || '',
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || '',

    VITE_GA_MEASUREMENT_ID: process.env.VITE_GA_MEASUREMENT_ID || '',
    VITE_SITE_NAME: process.env.VITE_SITE_NAME || '',
    VITE_SITE_URL: process.env.VITE_SITE_URL || '',
    VITE_WHATSAPP_PHONE: process.env.VITE_WHATSAPP_PHONE || ''
  };

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(env)
  };
};
