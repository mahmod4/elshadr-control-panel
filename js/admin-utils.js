/**
 * ========================================
 * Admin Utils - Shared Functions
 * ========================================
 * 
 * Purpose: وظائف مشتركة لجميع صفحات التعديل في لوحة التحكم
 * Usage: استيراد في صفحات التعديل لاستخدام الوظائف الموحدة
 * 
 * يحتوي هذا الملف على:
 * - وظائف عرض الرسائل والإشعارات
 * - وظائف التعامل مع النوافذ المنبثقة
 * - وظائف التحقق من صحة البيانات
 * - وظائف حفظ البيانات الموحدة
 * - مساعدات عامة
 */

// ================================
// نظام الرسائل والإشعارات
// ================================

/**
 * عرض رسالة مؤقتة (Toast)
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success, error, warning, info)
 * @param {number} duration - مدة العرض بالمللي ثانية
 */
export function showToast(message, type = 'info', duration = 3000) {
    // إزالة الرسائل القديمة
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // إنشاء الرسالة الجديدة
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icon} toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // إضافة للصفحة
    document.body.appendChild(toast);

    // إظهار الرسالة
    setTimeout(() => toast.classList.add('show'), 100);

    // إخفاء وحذف الرسالة
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * الحصول على أيقونة الرسالة
 * @param {string} type - نوع الرسالة
 * @returns {string} - اسم الأيقونة
 */
function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ================================
// نظام النوافذ المنبثقة
// ================================

/**
 * إنشاء نافذة منبثقة موحدة
 * @param {Object} options - خيارات النافذة
 * @returns {HTMLElement} - عنصر النافذة
 */
export function createModal(options = {}) {
    const {
        title = 'نافذة منبثقة',
        content = '',
        size = 'md', // sm, md, lg, xl
        showClose = true,
        closeOnOverlay = true,
        footer = null
    } = options;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = `modal modal-${size}`;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${showClose ? '<button type="button" class="modal-close">&times;</button>' : ''}
        </div>
        <div class="modal-body">
            ${content}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // أحداث الإغلاق
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    if (showClose) {
        modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    }

    if (closeOnOverlay) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // إظهار النافذة
    setTimeout(() => modal.classList.add('show'), 10);

    return modal;
}

/**
 * نافذة تأكيد موحدة
 * @param {string} message - رسالة التأكيد
 * @param {string} title - عنوان النافذة
 * @returns {Promise<boolean>} - وعد بالنتيجة
 */
export function confirmDialog(message, title = 'تأكيد') {
    return new Promise((resolve) => {
        const modal = createModal({
            title,
            content: `<p>${message}</p>`,
            footer: `
                <button class="btn btn-outline" data-action="cancel">إلغاء</button>
                <button class="btn btn-danger" data-action="confirm">تأكيد</button>
            `
        });

        modal.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'confirm') {
                resolve(true);
                modal.remove();
            } else if (e.target.dataset_action === 'cancel') {
                resolve(false);
                modal.remove();
            }
        });
    });
}

// ================================
// التحقق من صحة البيانات
// ================================

/**
 * التحقق من صحة النموذج
 * @param {HTMLFormElement} form - عنصر النموذج
 * @returns {Object} - نتيجة التحقق
 */
export function validateForm(form) {
    const errors = [];
    const data = {};

    // التحقق من الحقول المطلوبة
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push(`${getFieldLabel(field)} مطلوب`);
            field.classList.add('error');
        } else {
            field.classList.remove('error');
            data[field.name] = field.value;
        }
    });

    // التحقق من أنواع البيانات
    const emailFields = form.querySelectorAll('[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            errors.push(`${getFieldLabel(field)} غير صالح`);
            field.classList.add('error');
        }
    });

    const urlFields = form.querySelectorAll('[type="url"]');
    urlFields.forEach(field => {
        if (field.value && !isValidUrl(field.value)) {
            errors.push(`${getFieldLabel(field)} غير صالح`);
            field.classList.add('error');
        }
    });

    const telFields = form.querySelectorAll('[type="tel"]');
    telFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            errors.push(`${getFieldLabel(field)} غير صالح`);
            field.classList.add('error');
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        data
    };
}

/**
 * الحصول على تسمية الحقل
 * @param {HTMLElement} field - عنصر الحقل
 * @returns {string} - تسمية الحقل
 */
function getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('.form-label');
    return label ? label.textContent.replace('*', '').trim() : field.name || 'الحقل';
}

/**
 * التحقق من البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - نتيجة التحقق
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * التحقق من الرابط
 * @param {string} url - الرابط
 * @returns {boolean} - نتيجة التحقق
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * التحقق من رقم الهاتف
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} - نتيجة التحقق
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ================================
// وظائف حفظ البيانات
// ================================

/**
 * حفظ البيانات مع عرض التحميل والنتائج
 * @param {Function} saveFunction - دالة الحفظ
 * @param {Object} options - خيارات الحفظ
 * @returns {Promise} - وعد بالنتيجة
 */
export async function saveWithFeedback(saveFunction, options = {}) {
    const {
        loadingMessage = 'جاري الحفظ...',
        successMessage = 'تم الحفظ بنجاح',
        errorMessage = 'حدث خطأ أثناء الحفظ',
        showLoading = true
    } = options;

    let loadingOverlay = null;

    if (showLoading) {
        loadingOverlay = createLoadingOverlay(loadingMessage);
        document.body.appendChild(loadingOverlay);
    }

    try {
        const result = await saveFunction();
        
        if (showLoading) {
            loadingOverlay.remove();
        }
        
        showToast(successMessage, 'success');
        return result;
        
    } catch (error) {
        console.error('Save error:', error);
        
        if (showLoading) {
            loadingOverlay.remove();
        }
        
        showToast(errorMessage, 'error');
        throw error;
    }
}

/**
 * إنشاء شاشة تحميل
 * @param {string} message - رسالة التحميل
 * @returns {HTMLElement} - عنصر شاشة التحميل
 */
function createLoadingOverlay(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    return overlay;
}

// ================================
// مساعدات عامة
// ================================

/**
 * تنسيق التاريخ
 * @param {Date} date - التاريخ
 * @returns {string} - التاريخ المنسق
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * إنشاء معرف فريد
 * @returns {string} - المعرف الفريد
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @returns {Promise<boolean>} - نجاح النسخ
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('تم النسخ إلى الحافظة', 'success');
        return true;
    } catch {
        showToast('فشل نسخ النص', 'error');
        return false;
    }
}

/**
 * تنزيل ملف
 * @param {string} content - محتوى الملف
 * @param {string} filename - اسم الملف
 * @param {string} mimeType - نوع الملف
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

// ================================
// تهيئة عامة
// ================================

/**
 * تهيئة الوظائف العامة
 */
export function initAdminUtils() {
    // إضافة أنماط CSS للرسائل والتحميل
    if (!document.getElementById('admin-utils-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-utils-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                padding: 1rem;
                min-width: 300px;
                max-width: 500px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                border-right: 4px solid #3b82f6;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast-success { border-color: #10b981; }
            .toast-error { border-color: #ef4444; }
            .toast-warning { border-color: #f59e0b; }
            .toast-info { border-color: #3b82f6; }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .toast-icon {
                font-size: 1.25rem;
            }
            
            .toast-success .toast-icon { color: #10b981; }
            .toast-error .toast-icon { color: #ef4444; }
            .toast-warning .toast-icon { color: #f59e0b; }
            .toast-info .toast-icon { color: #3b82f6; }
            
            .toast-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 0.25rem;
                margin-right: 0.5rem;
            }
            
            .toast-close:hover {
                background: #f3f4f6;
            }
            
            .loading-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            }
            
            .loading-content {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            }
            
            .loading-content .spinner {
                margin: 0 auto 1rem;
            }
            
            .modal-sm { max-width: 400px; }
            .modal-md { max-width: 600px; }
            .modal-lg { max-width: 800px; }
            .modal-xl { max-width: 1000px; }
            
            .modal-overlay.show {
                opacity: 1;
            }
            
            .modal.show {
                transform: translateY(0);
            }
            
            .form-input.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
}

// تهيئة تلقائية
initAdminUtils();

// تصدير الوظائف للاستخدام العام
window.showToast = showToast;
window.createModal = createModal;
window.confirmDialog = confirmDialog;
