// ================================
// إعدادات Firebase - ملف التكوين الرئيسي
// ================================
// هذا الملف مسؤول عن تهيئة جميع خدمات Firebase المستخدمة في المشروع
// يشمل: المصادقة، قاعدة البيانات، التخزين، التحليلات

// استيراد مكتبات Firebase المطلوبة
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'; // تهيئة التطبيق الأساسي
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'; // خدمة المصادقة
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'; // قاعدة البيانات
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js'; // خدمة التخزين
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js'; // خدمة التحليلات

// إعدادات مشروع Firebase
// هذه الإعدادات تربط التطبيق بمشروع Firebase في السحابة
const env = (typeof window !== 'undefined' && window.RUNTIME_ENV && typeof window.RUNTIME_ENV === 'object')
    ? window.RUNTIME_ENV
    : {};

const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY || "AIzaSyAWkruoIMbTxD-5DHCpspPY8p2TtZLLmLM", // مفتاح API للمصادقة
    authDomain: env.FIREBASE_AUTH_DOMAIN || "dashboard-27bc8.firebaseapp.com", // نطاق المصادقة
    projectId: env.FIREBASE_PROJECT_ID || "dashboard-27bc8", // معرف المشروع الفريد
    storageBucket: env.FIREBASE_STORAGE_BUCKET || "dashboard-27bc8.firebasestorage.app", // سجل التخزين السحابي
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || "707339591256", // معرف إرسال الرسائل
    appId: env.FIREBASE_APP_ID || "1:707339591256:web:dcc2649182e97249a2742d", // معرف التطبيق
    measurementId: env.FIREBASE_MEASUREMENT_ID || "G-K8FNNYH4S1" // معرف خدمة التحليلات
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

