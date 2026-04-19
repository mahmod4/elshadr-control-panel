/**
 * ========================================
 * إعدادات Firebase - ملف التكوين الرئيسي
 * ========================================
 * 
 * Purpose: تهيئة وتكوين جميع خدمات Firebase للمشروع
 * Usage: يتم استيراده في جميع الملفات التي تحتاج Firebase
 * Features: تكوين ديناميكي، دعم البيئة المحلية والإنتاج
 * 
 * يحتوي هذا الملف على:
 * - تهيئة تطبيق Firebase الأساسي
 * - تكوين خدمة المصادقة (Auth)
 * - تكوين قاعدة البيانات (Firestore)
 * - تكوين خدمة التخزين (Storage)
 * - تكوين خدمة التحليلات (Analytics)
 * - دعم متغيرات البيئة الديناميكية
 * 
 * Services:
 * - Authentication: تسجيل الدخول والخروج
 * - Firestore: قاعدة البيانات الرئيسية
 * - Storage: تخزين الصور والملفات
 * - Analytics: تحليلات وتتبع الاستخدام
 * 
 * Environment Support:
 * - التطوير المحلي (.env)
 * - النشر على Netlify (Runtime Environment)
 * - النشر على منصات أخرى
 * 
 * Author: نظام المتجر الإلكتروني
 * Version: 1.0.0
 */
// ================================
// إعدادات Firebase - ملف التكوين الرئيسي
// ================================
// هذا الملف مسؤول عن تهيئة جميع خدمات Firebase المستخدمة في المشروع
// يشمل: المصادقة، قاعدة البيانات، التخزين، التحليلات

// استيراد مكتبات Firebase المطلوبة
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'; // تهيئة التطبيق الأساسي
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'; // خدمة المصادقة
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js'; // قاعدة البيانات
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js'; // خدمة التخزين
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js'; // خدمة التحليلات

// إعدادات مشروع Firebase
// هذه الإعدادات تربط التطبيق بمشروع Firebase في السحابة
const env = (typeof window !== 'undefined' && window.RUNTIME_ENV && typeof window.RUNTIME_ENV === 'object')
    ? window.RUNTIME_ENV
    : {};

const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY || "",
    authDomain: env.FIREBASE_AUTH_DOMAIN || "",
    databaseURL: env.FIREBASE_DATABASE_URL || "",
    projectId: env.FIREBASE_PROJECT_ID || "",
    storageBucket: env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: env.FIREBASE_APP_ID || ""
};

// تهيئة تطبيق Firebase
// إنشاء اتصال مع خدمات Firebase باستخدام الإعدادات أعلاه
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات وتصديرها للاستخدام في باقي المشروع
export const auth = getAuth(app); // خدمة المصادقة لتسجيل الدخول والخروج
export const db = getFirestore(app); // قاعدة بيانات Firestore لتخزين البيانات
export const storage = getStorage(app); // خدمة التخزين للملفات والصور

// تهيئة خدمة التحليلات (اختياري - فقط في بيئة المتصفح)
// يتم تهيئتها بشكل آمن لتجنب الأخطاء في بيئة الخادم
let analytics = null;
if (typeof window !== 'undefined') { // التحقق من وجود بيئة المتصفح
    try {
        analytics = getAnalytics(app); // تهيئة خدمة التحليلات
    } catch (error) {
        console.log('تم تخطي تهيئة التحليلات:', error); // رسالة خطأ غير حاسمة
    }
}
export { analytics }; // تصدير خدمة التحليلات

