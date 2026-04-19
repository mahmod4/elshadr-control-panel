/**
 * ========================================
 * ملف المصادقة (Auth) للوحة التحكم
 * ========================================
 * 
 * Purpose: إدارة المصادقة والصلاحيات في لوحة تحكم المتجر
 * Usage: حماية لوحة التحكم والتحقق من هوية المسؤولين
 * Features: تسجيل دخول آمن، صلاحيات، حماية كاملة
 * 
 * يحتوي هذا الملف على:
 * - نظام مصادقة قوي للمسؤولين
 * - التحقق من صلاحيات الأدمن
 * - مراقبة حالة المستخدم في الوقت الفعلي
 * - تسجيل الخروج الآمن
 * - حماية الصفحات من الوصول غير المصرح به
 * 
 * الوظائف الرئيسية:
 * - checkAdminStatus(): التحقق من صلاحيات الأدمن
 * - login(): تسجيل الدخول بالإيميل وكلمة المرور
 * - logout(): تسجيل الخروج الآمن
 * - onAuthStateChanged(): مراقبة حالة المستخدم
 * - protectDashboard(): حماية لوحة التحكم
 * 
 * Security Features:
 * - التحقق من مجموعة الأدمن في Firestore
 * - منع الوصول للمستخدمين غير المصرح لهم
 * - تسجيل جميع محاولات الوصول
 * - معالجة الأخطاء الأمنية
 * 
 * Dependencies:
 * - Firebase Auth للمصادقة
 * - Firebase Firestore للتحقق من الصلاحيات
 * - firebase-config.js للإعدادات
 * 
 * Author: نظام المتجر الإلكتروني
 * Version: 1.0.0
 */
// ================================
// ملف المصادقة (Auth) للوحة التحكم
// ================================
// هذا الملف مسؤول عن إدارة المصادقة والصلاحيات في لوحة التحكم
// الوظائف الرئيسية:
// - تسجيل الدخول بالإيميل وكلمة المرور
// - تسجيل الخروج الآمن
// - مراقبة حالة المستخدم الحالي
// - التحقق من صلاحيات الأدمن
// - حماية لوحة التحكم من الوصول غير المصرح به

// استيراد مكتبات Firebase المطلوبة للمصادقة وقاعدة البيانات
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'; // دوال المصادقة
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js'; // دوال قاعدة البيانات
import { auth, db } from './firebase-config.js'; // خدمات Firebase المهيأة

// التحقق مما إذا كان المستخدم لديه صلاحيات الأدمن
// هذه الدالة تتحقق من وجود المستخدم في مجموعة الأدمن في Firestore
export async function checkAdminStatus(userId) {
    try {
        // قراءة مستند الأدمن بنفس معرف المستخدم (UID)
        const userDoc = await getDoc(doc(db, 'admins', userId));
        console.log('مستند الأدمن موجود:', userDoc.exists()); // تسجيل حالة المستند
        
        if (userDoc.exists()) {
            const data = userDoc.data(); // جلب بيانات المستند
            console.log('بيانات مستند الأدمن:', data); // تسجيل البيانات للتشخيص
            console.log('قيمة isAdmin:', data.isAdmin, 'النوع:', typeof data.isAdmin); // التحقق من النوع
            
            // يجب أن تكون القيمة boolean true (وليس string) للمصادقة الصحيحة
            return data.isAdmin === true;
        }
        return false; // المستخدم غير موجود في مجموعة الأدمن
    } catch (error) {
        // في حالة حدوث خطأ في القراءة، نعتبر المستخدم غير أدمن لحماية اللوحة
        console.error('خطأ في التحقق من حالة الأدمن:', error);
        return false;
    }
}

// دالة تسجيل الدخول
// تقوم بتسجيل الدخول والتحقق من صلاحيات الأدمن
export async function login(email, password) {
    try {
        // تسجيل الدخول عبر Firebase Auth باستخدام الإيميل وكلمة المرور
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('تم تسجيل الدخول بنجاح، التحقق من حالة الأدمن لـ:', userCredential.user.uid);
        
        // بعد الدخول، نتأكد من صلاحيات الأدمن عبر Firestore
        const isAdmin = await checkAdminStatus(userCredential.user.uid);
        console.log('حالة الأدمن:', isAdmin);
        
        if (!isAdmin) {
            // إذا لم يكن أدمن: نسجل خروج المستخدم فورًا لحماية اللوحة
            await signOut(auth);
            
            // رسالة خطأ مفصلة لتوجيه المستخدم لحل المشكلة (إنشاء مستند الأدمن أو تعديل الحقل)
            const userDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
            let errorMessage = 'ليس لديك صلاحية للوصول إلى لوحة التحكم.\n\n';
            
            if (!userDoc.exists()) {
                // حالة: مستند الأدمن غير موجود
                errorMessage += `❌ المستند غير موجود في Firestore.\n\n`;
                errorMessage += `📋 خطوات الحل:\n`;
                errorMessage += `1. اذهب إلى Firestore Database\n`;
                errorMessage += `2. أنشئ Collection: admins\n`;
                errorMessage += `3. Document ID: ${userCredential.user.uid}\n`;
                errorMessage += `4. أضف Field: isAdmin (boolean) = true\n\n`;
                errorMessage += `User UID: ${userCredential.user.uid}`;
            } else {
                // حالة: مستند الأدمن موجود لكن به مشكلة
                const data = userDoc.data();
                errorMessage += `⚠️ المستند موجود لكن:\n\n`;
                
                if (data.isAdmin === undefined) {
                    errorMessage += `❌ الحقل isAdmin غير موجود\n`;
                } else if (typeof data.isAdmin !== 'boolean') {
                    errorMessage += `❌ الحقل isAdmin من نوع ${typeof data.isAdmin} (يجب أن يكون boolean)\n`;
                    errorMessage += `القيمة الحالية: ${data.isAdmin}\n\n`;
                } else if (data.isAdmin === false) {
                    errorMessage += `❌ الحقل isAdmin = false (يجب أن يكون true)\n`;
                } else {
                    errorMessage += `❌ سبب غير معروف. تحقق من Console للمزيد من التفاصيل.`;
                }
                errorMessage += `\n\nUser UID: ${userCredential.user.uid}`;
            }
            
            // نرمي الخطأ ليظهر في واجهة تسجيل الدخول
            throw new Error(errorMessage);
        }
        
        return userCredential.user; // إرجاع بيانات المستخدم في حالة النجاح
    } catch (error) {
        // أي خطأ: نرجعه كما هو إن كان يحتوي على رسالة واضحة
        console.error('خطأ في تسجيل الدخول:', error);
        
        // الحفاظ على رسالة الخطأ الأصلية إذا كانت موجودة
        if (error.message) {
            throw error;
        }
        // إنشاء رسالة خطأ وديلة للمستخدم
        throw new Error('حدث خطأ أثناء تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
    }
}

// دالة تسجيل الخروج
// تقوم بتسجيل خروج المستخدم من Firebase Auth
export async function logout() {
    try {
        await signOut(auth); // تسجيل الخروج من Firebase
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error); // تسجيل الخطأ
    }
}

// مراقبة حالة تسجيل الدخول
// هذه الدالة تراقب تغيرات حالة المصادقة وتستدعي الدالة الممررة مع بيانات المستخدم وحالة الأدمن
export function onAuthStateChange(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // إذا كان هناك مستخدم مسجل دخول: نتحقق من صلاحيات الأدمن ثم نبلغ main.js
            const isAdmin = await checkAdminStatus(user.uid); // التحقق من حالة الأدمن
            callback(user, isAdmin); // استدعاء الدالة مع بيانات المستخدم وحالة الأدمن
        } else {
            // حالة عدم تسجيل الدخول
            callback(null, false); // استدعاء الدالة بدون مستخدم وحالة أدمن false
        }
    });
}

