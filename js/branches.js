import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// نقطة الدخول لتحميل صفحة الفروع داخل عنصر pageContent
export async function loadBranches() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">فروعنا وحسابات التواصل</h2>
            <p class="text-gray-600 mt-2">إدارة فروع المتجر وحسابات التواصل الاجتماعي</p>
        </div>

        <!-- الفروع -->
        <div class="card mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">فروع المتجر</h3>
                <button onclick="addNewBranch()" class="btn-primary">
                    <i class="fas fa-plus ml-2"></i>إضافة فرع جديد
                </button>
            </div>
            <div id="branchesList" class="space-y-4">
                <div class="text-center py-8">
                    <div class="spinner"></div>
                    <p class="text-gray-500 mt-2">جاري تحميل الفروع...</p>
                </div>
            </div>
        </div>

        <!-- حسابات التواصل الاجتماعي -->
        <div class="card mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">حسابات التواصل الاجتماعي</h3>
                <button onclick="saveSocialMedia()" class="btn-primary">
                    <i class="fas fa-save ml-2"></i>حفظ التغييرات
                </button>
            </div>
            <form id="socialMediaForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="form-label">فيسبوك</label>
                    <input type="url" id="facebookUrl" class="form-input" placeholder="https://facebook.com/yourpage">
                </div>
                <div>
                    <label class="form-label">تويتر</label>
                    <input type="url" id="twitterUrl" class="form-input" placeholder="https://twitter.com/youraccount">
                </div>
                <div>
                    <label class="form-label">انستغرام</label>
                    <input type="url" id="instagramUrl" class="form-input" placeholder="https://instagram.com/youraccount">
                </div>
                <div>
                    <label class="form-label">تيك توك</label>
                    <input type="url" id="tiktokUrl" class="form-input" placeholder="https://tiktok.com/@youraccount">
                </div>
                <div>
                    <label class="form-label">يوتيوب</label>
                    <input type="url" id="youtubeUrl" class="form-input" placeholder="https://youtube.com/yourchannel">
                </div>
                <div>
                    <label class="form-label">لينكد إن</label>
                    <input type="url" id="linkedinUrl" class="form-input" placeholder="https://linkedin.com/yourcompany">
                </div>
            </form>
        </div>

        <!-- معلومات التواصل -->
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">معلومات التواصل</h3>
                <button onclick="saveContactInfo()" class="btn-primary">
                    <i class="fas fa-save ml-2"></i>حفظ التغييرات
                </button>
            </div>
            <form id="contactInfoForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="form-label">رقم الواتساب الرئيسي</label>
                    <input type="tel" id="whatsappNumber" class="form-input" placeholder="201234567890">
                </div>
                <div>
                    <label class="form-label">رقم الهاتف الرئيسي</label>
                    <input type="tel" id="phoneNumber" class="form-input" placeholder="201234567890">
                </div>
                <div class="md:col-span-2">
                    <label class="form-label">البريد الإلكتروني</label>
                    <input type="email" id="emailAddress" class="form-input" placeholder="info@yourstore.com">
                </div>
                <div class="md:col-span-2">
                    <label class="form-label">العنوان الرئيسي</label>
                    <textarea id="mainAddress" class="form-input" rows="3" placeholder="العنوان الرئيسي للمتجر"></textarea>
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
                <div class="text-center py-8">
                    <i class="fas fa-map-marker-alt text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد فروع حالياً</h3>
                    <p class="text-gray-500 mb-4">أضف فرع جديد للبدء</p>
                    <button onclick="addNewBranch()" class="btn-primary">
                        <i class="fas fa-plus ml-2"></i>إضافة فرع جديد
                    </button>
                </div>
            `;
            return;
        }

        branchesList.innerHTML = branches.map((branch, index) => `
            <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-800 mb-2">${branch.name || 'فرع غير مسمى'}</h4>
                        <p class="text-gray-600 mb-2">${branch.address || 'لا يوجد عنوان'}</p>
                        ${branch.phone ? `<p class="text-sm text-gray-500"><i class="fas fa-phone ml-1"></i>${branch.phone}</p>` : ''}
                        ${branch.mapUrl ? `
                            <a href="${branch.mapUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                                <i class="fas fa-map ml-1"></i>عرض على الخريطة
                            </a>
                        ` : ''}
                    </div>
                    <div class="flex space-x-reverse space-x-2">
                        <button onclick="editBranch(${index})" class="btn-secondary text-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBranch(${index})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading branches:', error);
        document.getElementById('branchesList').innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-red-600 mb-2">حدث خطأ</h3>
                <p class="text-gray-500">لم يتم تحميل الفروع</p>
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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 class="text-xl font-bold mb-4">إضافة فرع جديد</h3>
            <form onsubmit="saveNewBranch(event)">
                <div class="mb-4">
                    <label class="form-label">اسم الفرع *</label>
                    <input type="text" id="newBranchName" class="form-input" required>
                </div>
                <div class="mb-4">
                    <label class="form-label">العنوان *</label>
                    <textarea id="newBranchAddress" class="form-input" rows="3" required></textarea>
                </div>
                <div class="mb-4">
                    <label class="form-label">رقم الهاتف</label>
                    <input type="tel" id="newBranchPhone" class="form-input">
                </div>
                <div class="mb-4">
                    <label class="form-label">رابط الخريطة (اختياري)</label>
                    <input type="url" id="newBranchMapUrl" class="form-input" placeholder="https://maps.google.com/...">
                </div>
                <div class="flex justify-end space-x-reverse space-x-2">
                    <button type="button" onclick="closeBranchModal()" class="btn-secondary">إلغاء</button>
                    <button type="submit" class="btn-primary">حفظ</button>
                </div>
            </form>
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
        
        if (typeof window.showToast === 'function') {
            window.showToast('تم إضافة الفرع بنجاح', 'success');
        }

    } catch (error) {
        console.error('Error saving branch:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('حدث خطأ أثناء حفظ الفرع', 'error');
        }
    }
};

// حذف فرع
window.deleteBranch = async function(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;

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
        
        if (typeof window.showToast === 'function') {
            window.showToast('تم حذف الفرع بنجاح', 'success');
        }

    } catch (error) {
        console.error('Error deleting branch:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('حدث خطأ أثناء حذف الفرع', 'error');
        }
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

        if (typeof window.showToast === 'function') {
            window.showToast('تم حفظ وسائل التواصل الاجتماعي بنجاح', 'success');
        }

    } catch (error) {
        console.error('Error saving social media:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('حدث خطأ أثناء الحفظ', 'error');
        }
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

        if (typeof window.showToast === 'function') {
            window.showToast('تم حفظ معلومات التواصل بنجاح', 'success');
        }

    } catch (error) {
        console.error('Error saving contact info:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('حدث خطأ أثناء الحفظ', 'error');
        }
    }
};

// إغلاق النافذة المنبثقة
window.closeBranchModal = function() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
};
