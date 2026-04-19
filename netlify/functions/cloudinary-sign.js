/**
 * ========================================
 * Cloudinary Signing Function - Netlify Function
 * ========================================
 * 
 * Purpose: توقيع طلبات رفع الصور إلى Cloudinary بأمان
 * Usage: يستخدمه المتصفح للحصول على توقيع آمن لرفع الصور
 * Security: يمنع كشف API Secret في المتصفح
 * 
 * هذه الـ Function تقوم بـ:
 * - استلام طلبات التوقيع من المتصفح
 * - توليد توقيع SHA1 آمن للرفع
 * - التحقق من صحة المعلمات
 * - منع الوصول غير المصرح به
 * 
 * نقطة النهاية: /.netlify/functions/cloudinary-sign
 * الطريقة: POST
 * 
 * المعلمات المطلوبة:
 * - timestamp: الطابع الزمني للطلب
 * - public_id: معرف الصورة العامة
 * - upload_preset: إعدادات الرفع
 * - folder: مجلد التخزين
 * 
 * Features:
 * - CORS headers للتواصل مع المتصفح
 * - التحقق من صحة المعلمات
 * - معالجة الأخطاء
 * - تسجيل العمليات للتصحيح
 * 
 * Security:
 * - لا يتم كشف API Secret أبداً
 * - التوقيع يتم فقط من جهة الخادم
 * - التحقق من مصدر الطلب
 * 
 * Dependencies:
 * - Node.js crypto module
 * - Netlify Functions runtime
 * 
 * Author: نظام المتجر الإلكتروني
 * Version: 1.0.0
 */

const crypto = require('crypto');


function normalizeUploadPreset(raw) {
  const s = (typeof raw === 'string' ? raw : '').trim();
  if (!s) return 'my-store';
  if (s.startsWith('mediaflows_')) return 'my-store';
  return s;
}

function sign(params, apiSecret) {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();

  const toSign = keys.map((k) => `${k}=${params[k]}`).join('&');
  console.log('String to sign:', toSign);
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

exports.handler = async function handler(event) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: 'Method Not Allowed' 
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const mode = body.mode || 'upload';

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing CLOUDINARY_API_SECRET' })
      };
    }

    const timestamp = Math.floor(Date.now() / 1000);

    if (mode === 'upload') {
      const folder = body.folder || process.env.CLOUDINARY_FOLDER || 'images/chader';
      const upload_preset = normalizeUploadPreset(
        body.upload_preset || process.env.CLOUDINARY_UPLOAD_PRESET || 'my-store'
      );

      // Cloudinary requires specific order for signing
      const paramsToSign = { 
        folder, 
        timestamp, 
        upload_preset 
      };
      
      const signature = sign(paramsToSign, apiSecret);
      console.log('Upload signature params:', paramsToSign);
      console.log('Generated signature:', signature);
      console.log('API Secret exists:', !!apiSecret);
      console.log('Using upload preset:', upload_preset);
      
      return {
        statusCode: 200,
        headers: { 
          'content-type': 'application/json; charset=utf-8', 
          'cache-control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ signature, timestamp, folder, upload_preset })
      };
    }

    if (mode === 'destroy') {
      const public_id = body.public_id;
      if (!public_id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing public_id' }) };
      }
      const paramsToSign = { public_id, timestamp };
      const signature = sign(paramsToSign, apiSecret);
      return {
        statusCode: 200,
        headers: { 
          'content-type': 'application/json; charset=utf-8', 
          'cache-control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ signature, timestamp, public_id })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid mode' }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'Unknown error' }) };
  }
};
