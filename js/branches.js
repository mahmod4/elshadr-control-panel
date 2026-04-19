import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { db } from './firebase-config.js';
import { showToast, saveWithFeedback, confirmDialog } from './admin-utils.js';

// نقطة الدخول لتحميل صفحة الفروع داخل عنصر pageContent
export async function loadBranches() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">فروعنا وحسابات التواصل</h2>
            <p class="text-gray-600 mt-2">إدارة فروع المتجر وحسابات التواصل الاجتماعي</p>
        </div>

        <!-- الفروع -->
        <div class="admin-card">
            <div class="card-header">
                <h3 class="card-title">فروع المتجر</h3>
                <div class="card-actions">
                    <button onclick="addNewBranch()" class="btn btn-primary">
                        <i class="fas fa-plus"></i>إضافة فرع جديد
                    </button>
                </div>
            </div>
            <div id="branchesList">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p class="mt-2">جاري تحميل الفروع...</p>
                </div>
            </div>
        </div>

        <!-- حسابات التواصل الاجتماعي -->
        <div class="admin-card">
            <div class="card-header">
                <h3 class="card-title">حسابات التواصل الاجتماعي</h3>
                <div class="card-actions">
                    <button onclick="saveSocialMedia()" class="btn btn-success">
                        <i class="fas fa-save"></i>حفظ التغييرات
                    </button>
                </div>
            </div>
            <form id="socialMediaForm" class="admin-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">فيسبوك</label>
                        <input type="url" id="facebookUrl" class="form-input" placeholder="https://facebook.com/yourpage">
                    </div>
                    <div class="form-group">
                        <label class="form-label">تويتر</label>
                        <input type="url" id="twitterUrl" class="form-input" placeholder="https://twitter.com/youraccount">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">انستغرام</label>
                        <input type="url" id="instagramUrl" class="form-input" placeholder="https://instagram.com/youraccount">
                    </div>
                    <div class="form-group">
                        <label class="form-label">تيك توك</label>
                        <input type="url" id="tiktokUrl" class="form-input" placeholder="https://tiktok.com/@youraccount">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">يوتيوب</label>
                        <input type="url" id="youtubeUrl" class="form-input" placeholder="https://youtube.com/yourchannel">
                    </div>
                    <div class="form-group">
                        <label class="form-label">لينكد إن</label>
                        <input type="url" id="linkedinUrl" class="form-input" placeholder="https://linkedin.com/yourcompany">
                    </div>
                </div>
            </form>
        </div>

        <!-- معلومات التواصل -->
        <div class="admin-card">
            <div class="card-header">
                <h3 class="card-title">معلومات التواصل</h3>
                <div class="card-actions">
                    <button onclick="saveContactInfo()" class="btn btn-success">
                        <i class="fas fa-save"></i>حفظ التغييرات
                    </button>
                </div>
            </div>
            <form id="contactInfoForm" class="admin-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">رقم الواتساب الرئيسي</label>
                        <input type="tel" id="whatsappNumber" class="form-input" placeholder="201234567890">
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الهاتف الرئيسي</label>
                        <input type="tel" id="phoneNumber" class="form-input" placeholder="201234567890">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">البريد الإلكتروني</label>
                    <input type="email" id="emailAddress" class="form-input" placeholder="info@yourstore.com">
                </div>
                <div class="form-group">
                    <label class="form-label">العنوان الرئيسي</label>
                    <textarea id="mainAddress" class="form-textarea" rows="3" placeholder="العنوان الرئيسي للمتجر"></textarea>
                </div>
            </form>
        </div>
    `;

    // تحميل البيانات
    await loadBranchesList();
    await loadSocialMedia();
    await loadContactInfo();
}

// تحميل قائمة الفروع
async function loadBranchesList() {
    try {
        const settingsDoc = await getDocs(collection(db, 'settings'));
        let branches = [];
        
        settingsDoc.forEach(doc => {
            if (doc.data().branches) {
                branches = doc.data().branches;
            }
        });

        const branchesList = document.getElementById('branchesList');
        
        if (branches.length === 0) {
            branchesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt empty-state-icon"></i>
                    <h3 class="empty-state-title">لا توجد فروع حالياً</h3>
                    <p class="empty-state-description">أضف فرع جديد للبدء</p>
                    <button onclick="addNewBranch()" class="btn btn-primary">
                        <i class="fas fa-plus"></i>إضافة فرع جديد
                    </button>
                </div>
            `;
            return;
        }

        branchesList.innerHTML = `
            <div class="list-group">
                ${branches.map((branch, index) => `
                    <div class="list-item">
                        <div class="list-item-header">
                            <div>
                                <h4 class="list-item-title">${branch.name || 'فرع غير مسمى'}</h4>
                                <p class="list-item-content">${branch.address || 'لا يوجد عنوان'}</p>
                                ${branch.phone ? `<p class="list-item-content"><i class="fas fa-phone"></i> ${branch.phone}</p>` : ''}
                                ${branch.mapUrl ? `
                                    <a href="${branch.mapUrl}" target="_blank" class="btn btn-outline btn-sm mt-2">
                                        <i class="fas fa-map"></i>عرض على الخريطة
                                    </a>
                                ` : ''}
                            </div>
                            <div class="list-item-actions">
                                <button onclick="editBranch(${index})" class="btn btn-secondary btn-sm" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteBranch(${index})" class="btn btn-danger btn-sm" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading branches:', error);
        document.getElementById('branchesList').innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>حدث خطأ</strong><br>
                لم يتم تحميل الفروع
            </div>
        `;
    }
}

// تحميل وسائل التواصل الاجتماعي
async function loadSocialMedia() {
    try {
        const settingsDoc = await getDocs(collection(db, 'settings'));
        let socialMedia = {};
        
        settingsDoc.forEach(doc => {
            const data = doc.data();
            socialMedia = {
                facebook: data.socialFacebook || '',
                twitter: data.socialTwitter || '',
                instagram: data.socialInstagram || '',
                tiktok: data.socialTiktok || '',
                youtube: data.socialYoutube || '',
                linkedin: data.socialLinkedin || ''
            };
        });

        document.getElementById('facebookUrl').value = socialMedia.facebook || '';
        document.getElementById('twitterUrl').value = socialMedia.twitter || '';
        document.getElementById('instagramUrl').value = socialMedia.instagram || '';
        document.getElementById('tiktokUrl').value = socialMedia.tiktok || '';
        document.getElementById('youtubeUrl').value = socialMedia.youtube || '';
        document.getElementById('linkedinUrl').value = socialMedia.linkedin || '';

    } catch (error) {
        console.error('Error loading social media:', error);
    }
}

// تحميل معلومات التواصل
async function loadContactInfo() {
    try {
        const settingsDoc = await getDocs(collection(db, 'settings'));
        let contactInfo = {};
        
        settingsDoc.forEach(doc => {
            const data = doc.data();
            contactInfo = {
                whatsapp: data.socialWhatsapp || '',
                phone: data.storePhone || '',
                email: data.storeEmail || '',
                address: data.storeAddress || ''
            };
        });

        document.getElementById('whatsappNumber').value = contactInfo.whatsapp || '';
        document.getElementById('phoneNumber').value = contactInfo.phone || '';
        document.getElementById('emailAddress').value = contactInfo.email || '';
        document.getElementById('mainAddress').value = contactInfo.address || '';

    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// إضافة فرع جديد
window.addNewBranch = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">إضافة فرع جديد</h3>
                <button type="button" class="modal-close" onclick="closeBranchModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="newBranchForm" class="admin-form">
                    <div class="form-group">
                        <label class="form-label required">اسم الفرع</label>
                        <input type="text" id="newBranchName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required">العنوان</label>
                        <textarea id="newBranchAddress" class="form-textarea" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الهاتف</label>
                        <input type="tel" id="newBranchPhone" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">رابط الخريطة (اختياري)</label>
                        <input type="url" id="newBranchMapUrl" class="form-input" placeholder="https://maps.google.com/...">
                        <small class="text-gray-500">انسخ رابط المشاركة من خرائط Google</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="closeBranchModal()" class="btn btn-outline">إلغاء</button>
                <button type="submit" form="newBranchForm" class="btn btn-primary">حفظ الفرع</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// حفظ فرع جديد
window.saveNewBranch = async function(event) {
    event.preventDefault();
    
    const newBranch = {
        name: document.getElementById('newBranchName').value,
        address: document.getElementById('newBranchAddress').value,
        phone: document.getElementById('newBranchPhone').value,
        mapUrl: document.getElementById('newBranchMapUrl').value
    };

    try {
        const settingsRef = collection(db, 'settings');
        const querySnapshot = await getDocs(settingsRef);
        
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                branches: arrayUnion(newBranch)
            });
        }

        closeBranchModal();
        await loadBranchesList();
        showToast('تم إضافة الفرع بنجاح', 'success');

    } catch (error) {
        console.error('Error saving branch:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('حدث خطأ أثناء حفظ الفرع', 'error');
        }
    }
};

// حذف فرع
window.deleteBranch = async function(index) {
    const confirmed = await confirmDialog('هل أنت متأكد من حذف هذا الفرع؟', 'حذف الفرع');
    if (!confirmed) return;

    try {
        const settingsRef = collection(db, 'settings');
        const querySnapshot = await getDocs(settingsRef);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const branches = doc.data().branches || [];
            const branchToDelete = branches[index];
            
            await updateDoc(doc.ref, {
                branches: arrayRemove(branchToDelete)
            });
        }

        await loadBranchesList();
        showToast('تم حذف الفرع بنجاح', 'success');

    } catch (error) {
        console.error('Error deleting branch:', error);
        showToast('حدث خطأ أثناء حذف الفرع', 'error');
    }
};

// حفظ وسائل التواصل الاجتماعي
window.saveSocialMedia = async function() {
    try {
        const settingsRef = collection(db, 'settings');
        const querySnapshot = await getDocs(settingsRef);
        
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                socialFacebook: document.getElementById('facebookUrl').value,
                socialTwitter: document.getElementById('twitterUrl').value,
                socialInstagram: document.getElementById('instagramUrl').value,
                socialTiktok: document.getElementById('tiktokUrl').value,
                socialYoutube: document.getElementById('youtubeUrl').value,
                socialLinkedin: document.getElementById('linkedinUrl').value
            });
        }

        showToast('تم حفظ وسائل التواصل الاجتماعي بنجاح', 'success');

    } catch (error) {
        console.error('Error saving social media:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
};

// حفظ معلومات التواصل
window.saveContactInfo = async function() {
    try {
        const settingsRef = collection(db, 'settings');
        const querySnapshot = await getDocs(settingsRef);
        
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                socialWhatsapp: document.getElementById('whatsappNumber').value,
                storePhone: document.getElementById('phoneNumber').value,
                storeEmail: document.getElementById('emailAddress').value,
                storeAddress: document.getElementById('mainAddress').value
            });
        }

        showToast('تم حفظ معلومات التواصل بنجاح', 'success');

    } catch (error) {
        console.error('Error saving contact info:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
};

// إغلاق النافذة المنبثقة
window.closeBranchModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
};
