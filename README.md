# 🛒 متجر الشادر للخضروات والفواكه

**منصة تجارة إلكترونية متكاملة متخصصة في بيع الخضروات والفواكه الطازجة**

![Shadar Store](https://img.shields.io/badge/متجر_الشادر-خضروات_وفواكه-success)
![Firebase](https://img.shields.io/badge/Firebase-Cloud_Database-orange)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Management-blue)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-teal)

---

## 📋 نظرة عامة

متجر الشادر هو نظام تجارة إلكتروني متكامل مصمم خصيصاً لمتاجر الخضروات والفواكه، يوفر واجهة إدارة احترافية ومتجر إلكتروني عصري للعملاء مع دعم كامل للغة العربية والاتجاه من اليمين إلى اليسار.

### 🎯 **المميزات الرئيسية**

#### 🛍️ **للواجهة الأمامية (المتجر):**
- **عرض المنتجات** مع تصنيفات منظمة
- **نظام البيع بالوزن** مع وحدات قياس مرنة
- **سلة مشتريات تفاعلية** مع حساب تلقائي
- **عروض يومية** ومنتجات مميزة
- **البحث والتصفية** المتقدم
- **المفضلة** للمنتجات
- **دفع عبر WhatsApp** مع رسائل جاهزة
- **تسجيل الدخول** بحساب Google
- **PWA** للتثبيت كتطبيق على الهاتف

#### 🎛️ **لوحة التحكم (الإدارة):**
- **إدارة المنتجات** مع رفع الصور
- **إدارة الأقسام** والأصناف
- **إدارة الطلبات** والمشتريات
- **إدارة العملاء** والمستخدمين
- **إعدادات المتجر** الشاملة
- **إدارة المحتوى** والبنرات
- **نظام التقارير** والإحصائيات
- **إدارة العروض** والخصومات

---

## 🚀 البدء السريع

### 📋 **المتطلبات الأساسية**
- **Git** لإدارة النسخ
- **حساب Firebase** لقاعدة البيانات
- **حساب Cloudinary** لرفع الصور
- **حساب Netlify** (اختياري) للنشر

### 🔧 **التثبيت والتشغيل**

1. **نسخ المشروع:**
   ```bash
   git clone <repository-url>
   cd "تطوير/الشادر جديد"
   ```

2. **إعداد متغيرات البيئة:**
   ```bash
   cp .env.example .env
   ```

3. **تشغيل محلياً:**
   - المشروع **Static HTML/CSS/JS** لا يحتاج `npm install`
   - افتح `index.html` مباشرة في المتصفح
   - أو استخدم خادم محلي مثل Live Server

---

## ⚙️ إعدادات البيئة

### 🔥 **Firebase Configuration**
احصل على الإعدادات من: [Firebase Console](https://console.firebase.google.com) > Project Settings > General > Your apps

```env
# Firebase Core
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🌤️ **Cloudinary Configuration**
احصل على الإعدادات من: [Cloudinary Dashboard](https://cloudinary.com/console) > Settings > API Keys

```env
# Cloudinary Image Management
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_FOLDER=images/chader
```

### 📱 **إعدادات المتجر**

```env
# Store Settings
VITE_SITE_NAME=متجر الشادر للخضروات والفواكه
VITE_SITE_URL=https://your-domain.com
VITE_SITE_CURRENCY=ج.م

# WhatsApp Integration
VITE_WHATSAPP_PHONE=201013449050

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📁 هيكل المشروع

```
📦 متجر الشادر
├── 🏠 index.html                 # لوحة التحكم الرئيسية
├── 🛍️ kdwe/                      # المتجر الأمامي
│   ├── 📄 index.html            # صفحة المتجر الرئيسية
│   ├── 📄 product.html          # صفحة تفاصيل المنتج
│   ├── 📄 cart.html             # صفحة السلة
│   ├── 📄 login.html            # صفحة تسجيل الدخول
│   ├── 📄 contact.html          # صفحة الاتصال
│   ├── 📄 favorites.html        # صفحة المفضلة
│   ├── 🎨 css/
│   │   └── styles.css           # أنماط المتجر
│   └── ⚙️ js/
│       ├── script.js            # المنطق الرئيسي للمتجر
│       ├── cart.js              # سلة المشتريات
│       ├── product.js           # صفحة المنتج
│       ├── weight-*.js          # نظام البيع بالوزن
│       ├── settings*.js         # مزامنة الإعدادات
│       ├── favorites.js         # المفضلة
│       └── whatsapp-sync.js     # مزامنة WhatsApp
├── 🎛️ js/                       # ملفات لوحة التحكم
│   ├── 🔐 firebase-config.js    # إعدادات Firebase
│   ├── 🌤️ cloudinary-config.js  # إعدادات Cloudinary
│   ├── 👤 auth.js               # المصادقة
│   ├── 📊 dashboard.js          # الصفحة الرئيسية
│   ├── 🛍️ products.js           # إدارة المنتجات
│   ├── 📂 categories.js         # إدارة الأقسام
│   ├── 📦 orders.js             # إدارة الطلبات
│   ├── 👥 users.js              # إدارة المستخدمين
│   ├── ⚙️ settings.js           # إعدادات المتجر
│   ├── 🎯 offers.js             # إدارة العروض
│   └── 📝 content.js            # إدارة المحتوى
├── 🎨 css/                      # أنماط لوحة التحكم
│   └── style.css               # أنماط لوحة التحكم
├── 🔧 netlify/functions/        # Netlify Functions
│   ├── runtime-env.js          # توفير متغيرات البيئة
│   └── cloudinary-sign.js      # توقيع Cloudinary
├── 📄 manifest.json            # PWA Manifest
├── 🔧 js/sw.js                 # Service Worker
└── 📝 .env.example             # مثال متغيرات البيئة
```

---

## 🎯 السيناريوهات المدعومة

### 💻 **1. التطوير المحلي**
```bash
# تشغيل مباشر
open index.html  # لوحة التحكم
open kdwe/index.html  # المتجر
```

### 🚀 **2. النشر على Netlify**
- **Static Site** بدون build
- **Environment Variables** عبر Netlify UI
- **Functions** للعمليات الآمنة
- **Auto-deploy** من GitHub

### ☁️ **3. النشر على Vercel**
- **Edge Functions** مدعومة
- **Environment Variables** في Dashboard
- **Optimized Images** تلقائياً

### 🏠 **4. النشر على استضافة خاصة**
- **PHP/Node.js** backend (اختياري)
- **Apache/Nginx** configuration
- **SSL Certificate** مطلوب
- **CDN** للصور عبر Cloudinary

---

## 🔧 المميزات التقنية

### 🌟 **Frontend Features**
- **Progressive Web App (PWA)**
- **Service Worker** للتخزين المؤقت
- **Lazy Loading** للصور
- **Responsive Design** لجميع الأجهزة
- **RTL Support** كامل للغة العربية
- **Dark/Light Mode** (قادم)
- **Offline Support** جزئي

### 🗄️ **Backend Integration**
- **Firebase Firestore** لقاعدة البيانات
- **Firebase Authentication** للمستخدمين
- **Cloudinary** لرفع وتخزين الصور
- **Netlify Functions** للعمليات الخلفية
- **WhatsApp API** للطلبات

### 🔒 **Security Features**
- **Environment Variables** حماية البيانات
- **Signed Uploads** للصور
- **Firebase Security Rules**
- **XSS Protection**
- **CSRF Protection**

---

## 📊 نظام البيانات

### 🗂️ **Firebase Collections**
```
📦 products/     # المنتجات
📂 categories/   # الأقسام  
📋 orders/       # الطلبات
👥 users/        # المستخدمون
⚙️ settings/     # إعدادات المتجر
🎯 offers/       # العروض
📝 content/      # المحتوى
```

### 🏷️ **هيكل المنتج**
```javascript
{
  id: "product_123",
  name: "تفاح أحمر",
  price: 25.50,
  discountPrice: 20.00,
  image: "https://cloudinary.com/...",
  category: "فواكه",
  description: "تفاح أحمر طازج من أفضل الأنواع",
  soldByWeight: true,
  weightUnit: "كجم",
  stock: 100,
  available: true,
  featured: false
}
```

---

## 🎨 التخصيص

### 🎯 **تخصيص المتجر**
من لوحة التحكم يمكنك تعديل:
- **اسم المتجر** والشعار
- **الألوان** والثيم
- **معلومات الاتصال**
- **روابط التواصل الاجتماعي**
- **عملة الدفع**
- **رسائل WhatsApp**

### 📱 **تخصيص الواجهة**
- **CSS Variables** للألوان
- **RTL/LTR** للغات
- **Responsive Breakpoints**
- **Typography** والخطوط

---

## 🚀 النشر والتشغيل

### 🌐 **خطوات النشر على Netlify**

1. **Connect Repository** إلى Netlify
2. **Build Settings:**
   ```
   Build command: (leave blank)
   Publish directory: ./
   ```
3. **Environment Variables** في Netlify UI
4. **Deploy** تلقائي

### 🔧 **الإعدادات المتقدمة**
```bash
# تفعيل Firebase Emulators (اختياري)
firebase emulators:start

# رفع الصور يدوياً
# استخدم لوحة التحكم أو Cloudinary Dashboard
```

---

## 📈 الأداء والتحسين

### ⚡ **تحسينات السرعة**
- **Lazy Loading** للصور
- **Code Splitting** للـ JavaScript
- **Service Worker** للتخزين
- **Minified CSS/JS**
- **Optimized Images** عبر Cloudinary

### 📊 **مراقبة الأداء**
- **Google Analytics** integration
- **Firebase Performance** monitoring
- **Core Web Vitals** tracking
- **Error Reporting**

---

## 🔧 صيانة وتحديث

### 🔄 **التحديثات الدورية**
- **Firebase SDK** updates
- **Security patches**
- **Feature enhancements**
- **Performance optimizations**

### 🛠️ **الصيانة**
- **Database cleanup** للبيانات القديمة
- **Image optimization** دوري
- **Backup verification**
- **Security audit**

---

## 🤝 المساهمة في المشروع

### 📋 **كيف تساهم؟**

1. **Fork** المشروع
2. **Create Branch** (`git checkout -b feature/amazing-feature`)
3. **Commit Changes** (`git commit -m 'Add amazing feature'`)
4. **Push Branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### 🎯 **مجالات المساهمة**
- 🐛 **Bug Fixes**
- ✨ **New Features**
- 📝 **Documentation**
- 🎨 **UI/UX Improvements**
- ⚡ **Performance**
- 🔒 **Security**

---

## 📞 الدعم والمساعدة

### 🆘 **الحصول على المساعدة**
- 📧 **Email Support**: support@shadar.com
- 💬 **WhatsApp**: 201013449050
- 📱 **Facebook**: [صفحة الشادر](https://www.facebook.com/share/1CizJTdEEc/)
- 🐛 **Issue Tracker**: GitHub Issues

### 📚 **المصادر التعليمية**
- 📖 **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- 🎥 **Video Tutorials**: [YouTube Channel]
- 📱 **Demo**: [Live Demo](https://shadar-demo.netlify.app)

---

## 📄 الترخيص

هذا المشروع مرخص تحت **رخصة MIT** - يمكنك استخدامه وتعديله وتوزيعه بحرية.

```
MIT License

Copyright (c) 2024 متجر الشادر

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 الشكر والتقدير

- **Firebase** لقاعدة البيانات والمصادقة
- **Cloudinary** لإدارة الصور
- **Netlify** للاستضافة والدوال
- **Font Awesome** للأيقونات
- **Lucide** للأيقونات الحديثة
- **Google Fonts** للخطوط العربية

---

<div align="center">

**🥬🍎🥕 متجر الشادر للخضروات والفواكه 🥬🍎🥕**

*جودة عالية وتوصيل سريع للمنتجات الطازجة*

[🌐 زيارة المتجر](https://shadar-store.netlify.app) • [📧 التواصل](mailto:info@shadar.com)

Made with ❤️ in Egypt

</div>
