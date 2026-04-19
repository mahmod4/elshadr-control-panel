# لوحة تحكم ومتجر إلكتروني

مشروع متكامل يتكون من:
- **لوحة تحكم** لإدارة المنتجات، الأقسام، الطلبات، الإعدادات
- **متجر أمامي** للزبائن مع سلة مشتريات، دفع عبر WhatsApp، دعم البيع بالوزن

## 🚀 البدء السريع

### المتطلبات
- Git
- حساب Netlify (للنشر)

### التثبيت
```bash
git clone <repository-url>
cd <project-folder>
```

### إعداد متغيرات البيئة
1. انسخ ملف المتغيرات:
   ```bash
   cp .env.example .env
   ```
2. املأ القيم الحقيقية في ملف `.env` (انظر قسم متغيرات البيئة أدناه)

### التشغيل المحلي
- المشروع **Static HTML/CSS/JS** ولا يحتاج `npm install`.
- افتح الصفحات مباشرة عبر خادم محلي بسيط أو عبر Netlify.

## 🔧 متغيرات البيئة

### Firebase
احصل على القيم من: [Firebase Console](https://console.firebase.google.com) > Project Settings > General > Your apps

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Cloudinary
احصل على القيم من: [Cloudinary Dashboard](https://cloudinary.com/console) > Settings > API Keys

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_FOLDER=products
```

ملاحظة أمنية:
- **لا يتم استخدام `CLOUDINARY_API_SECRET` داخل المتصفح**.
- التوقيع يتم عبر Netlify Function: `/.netlify/functions/cloudinary-sign`.

### WhatsApp (اختياري)
```env
VITE_WHATSAPP_PHONE=201234567890
```

### Google Analytics (اختياري)
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### إعدادات الموقع
```env
VITE_SITE_NAME=متجري الإلكتروني
VITE_SITE_URL=https://your-domain.com
VITE_SITE_CURRENCY=ج.م
```

## 📁 هيكل المشروع

```
├── index.html              # صفحة لوحة التحكم الرئيسية
├── kdwe/                  # المتجر الأمامي
│   ├── index.html         # صفحة المتجر الرئيسية
│   ├── css/
│   │   └── styles.css    # أنماط المتجر
│   └── js/
│       ├── script.js      # منطق المتجر الرئيسي
│       ├── cart.js        # سلة المشتريات
│       └── weight-products.js # نظام البيع بالوزن
├── js/                   # ملفات لوحة التحكم
│   ├── firebase-config.js  # إعدادات Firebase
│   ├── cloudinary-config.js # إعدادات Cloudinary
│   ├── auth.js          # المصادقة
│   ├── dashboard.js      # الصفحة الرئيسية
│   ├── products.js       # إدارة المنتجات
│   ├── categories.js     # إدارة الأقسام
│   ├── orders.js         # إدارة الطلبات
│   └── settings.js      # إعدادات المتجر
├── css/                  # أنماط لوحة التحكم
│   └── style.css        # أنماط لوحة التحكم
└── .env.example          # مثال متغيرات البيئة
```

## 🎯 السيناريوهات المدعومة

### 1. سيناريو التطوير المحلي (Local Development)
- استخدام `.env` للقيم المحلية
- Firebase Emulator Suite (اختياري)
- رفع الصور المحلية إلى Cloudinary

### 2. سيناريو النشر على Netlify
- إعدادات البيئة عبر Netlify UI
- **Static بدون Build** مدعوم عبر:
  - `/.netlify/functions/runtime-env` لتوفير المتغيرات للمتصفح
  - `js/runtime-env-client.js` لتحميلها إلى `window.RUNTIME_ENV` قبل تهيئة Firebase
  - `/.netlify/functions/cloudinary-sign` لتوليد توقيع Cloudinary بأمان

### 3. سيناريو النشر على Vercel
- متغيرات البيئة في Vercel Dashboard
- تحسين تلقائي للصور
- دعم Edge Functions

### 4. سيناريو النشر على استضافة خاصة
- متغيرات البيئة في الخادم
- SSL Certificate
- CDN للصور عبر Cloudinary

## 🔗 روابط مفيدة

- [Firebase Console](https://console.firebase.google.com)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 📝 ملاحظات هامة

1. **الأمان**: لا تضع مفاتيح API الحقيقية في الكود أو في Git
2. **.gitignore**: تأكد من إضافة `.env` (ولا يوجد `node_modules` في هذا المشروع)
3. **Firebase Rules**: تأكد من إعدادات Security Rules لقاعدة البيانات
4. **Cloudinary**: استخدم Signed Uploads للإنتاج
5. **WhatsApp**: استخدم رقم هاتف عمل معتمد

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرعًا جديدًا (`git checkout -b feature/amazing-feature`)
3. أرسل التعديلات (`git commit -m 'Add amazing feature'`)
4. ارفع الفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT.
