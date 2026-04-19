import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// عرض صفحة إدارة الفروع
export async function loadBranches() {
    const pageContent = document.getElementById('pageContent');
    
    pageContent.innerHTML = `
        <div class="card mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">إدارة الفروع</h2>
                <button onclick="showAddBranchForm()" class="btn-primary">
                    <i class="fas fa-plus ml-2"></i>إضافة فرع جديد
                </button>
            </div>
        </div>

        <div id="branchesContent">
            <div class="loading"><div class="spinner"></div><p>جاري تحميل الفروع...</p></div>
        </div>
    `;
    
    await loadBranchesList();
}

// تحميل قائمة الفروع
async function loadBranchesList() {
    const branchesContent = document.getElementById('branchesContent');
    
    try {
        const branchesSnapshot = await getDocs(query(collection(db, 'branches'), orderBy('name')));
        const branches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (branches.length === 0) {
            branchesContent.innerHTML = `
                <div class="card">
                    <div class="text-center py-8">
                        <i class="fas fa-store text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد فروع</h3>
                        <p class="text-gray-500 mb-4">قم بإضافة أول فرع للمتجر</p>
                        <button onclick="showAddBranchForm()" class="btn-primary">
                            <i class="fas fa-plus ml-2"></i>إضافة فرع جديد
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        let branchesHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
        
        branches.forEach(branch => {
            branchesHTML += `
                <div class="card">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-bold">${branch.name || 'فرع بدون اسم'}</h3>
                        <div class="flex space-x-2 space-x-reverse">
                            <button onclick="editBranch('${branch.id}')" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteBranch('${branch.id}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        ${branch.address ? `
                            <div class="flex items-start">
                                <i class="fas fa-map-marker-alt text-gray-400 ml-2 mt-1"></i>
                                <span class="text-gray-600">${branch.address}</span>
                            </div>
                        ` : ''}
                        
                        ${branch.phone ? `
                            <div class="flex items-center">
                                <i class="fas fa-phone text-gray-400 ml-2"></i>
                                <a href="tel:${branch.phone}" class="text-blue-600 hover:underline">${branch.phone}</a>
                            </div>
                        ` : ''}
                        
                        ${branch.whatsapp ? `
                            <div class="flex items-center">
                                <i class="fab fa-whatsapp text-green-500 ml-2"></i>
                                <a href="https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}" 
                                   class="text-green-600 hover:underline" target="_blank">${branch.whatsapp}</a>
                            </div>
                        ` : ''}
                        
                        ${branch.email ? `
                            <div class="flex items-center">
                                <i class="fas fa-envelope text-gray-400 ml-2"></i>
                                <a href="mailto:${branch.email}" class="text-blue-600 hover:underline">${branch.email}</a>
                            </div>
                        ` : ''}
                        
                        ${branch.googleMapUrl ? `
                            <div class="mt-3">
                                <a href="${branch.googleMapUrl}" target="_blank" 
                                   class="btn-primary text-sm w-full text-center">
                                    <i class="fas fa-map ml-2"></i>عرض على الخريطة
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        branchesHTML += '</div>';
        branchesContent.innerHTML = branchesHTML;
        
    } catch (error) {
        console.error('Error loading branches:', error);
        branchesContent.innerHTML = `
            <div class="card">
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-red-600 mb-2">حدث خطأ</h3>
                    <p class="text-gray-600">فشل تحميل الفروع</p>
                </div>
            </div>
        `;
    }
}

// عرض نموذج إضافة فرع
window.showAddBranchForm = function() {
    const branchesContent = document.getElementById('branchesContent');
    
    branchesContent.innerHTML = `
        <div class="card">
            <h3 class="text-xl font-bold mb-4">إضافة فرع جديد</h3>
            <form id="branchForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2">اسم الفرع *</label>
                        <input type="text" id="branchName" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block mb-2">رقم الهاتف</label>
                        <input type="tel" id="branchPhone" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-2">رقم الواتساب</label>
                        <input type="tel" id="branchWhatsapp" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block mb-2">البريد الإلكتروني</label>
                        <input type="email" id="branchEmail" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div>
                    <label class="block mb-2">العنوان *</label>
                    <textarea id="branchAddress" required rows="3" class="w-full px-4 py-2 border rounded-lg"></textarea>
                </div>
                
                <div>
                    <label class="block mb-2">رابط الخريطة (Google Maps)</label>
                    <input type="url" id="branchGoogleMapUrl" placeholder="https://maps.google.com/..." 
                           class="w-full px-4 py-2 border rounded-lg">
                    <p class="text-sm text-gray-500 mt-1">
                        افتح الموقع على Google Maps ثم انقر على "Share" وانسخ الرابط
                    </p>
                </div>
                
                <div class="flex justify-end space-x-3 space-x-reverse">
                    <button type="button" onclick="loadBranchesList()" class="btn-secondary">
                        إلغاء
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save ml-2"></i>حفظ الفرع
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('branchForm').addEventListener('submit', saveBranch);
};

// حفظ فرع جديد
async function saveBranch(e) {
    e.preventDefault();
    
    const branchData = {
        name: document.getElementById('branchName').value.trim(),
        phone: document.getElementById('branchPhone').value.trim(),
        whatsapp: document.getElementById('branchWhatsapp').value.trim(),
        email: document.getElementById('branchEmail').value.trim(),
        address: document.getElementById('branchAddress').value.trim(),
        googleMapUrl: document.getElementById('branchGoogleMapUrl').value.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await addDoc(collection(db, 'branches'), branchData);
        alert('تم إضافة الفرع بنجاح');
        await loadBranchesList();
    } catch (error) {
        console.error('Error saving branch:', error);
        alert('فشل حفظ الفرع: ' + error.message);
    }
}

// تعديل فرع
window.editBranch = async function(branchId) {
    try {
        const branchDoc = await getDoc(doc(db, 'branches', branchId));
        if (!branchDoc.exists()) {
            alert('الفرع غير موجود');
            return;
        }
        
        const branch = branchDoc.data();
        const branchesContent = document.getElementById('branchesContent');
        
        branchesContent.innerHTML = `
            <div class="card">
                <h3 class="text-xl font-bold mb-4">تعديل الفرع</h3>
                <form id="branchForm" class="space-y-4">
                    <input type="hidden" id="branchId" value="${branchId}">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-2">اسم الفرع *</label>
                            <input type="text" id="branchName" value="${branch.name || ''}" required 
                                   class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block mb-2">رقم الهاتف</label>
                            <input type="tel" id="branchPhone" value="${branch.phone || ''}" 
                                   class="w-full px-4 py-2 border rounded-lg">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-2">رقم الواتساب</label>
                            <input type="tel" id="branchWhatsapp" value="${branch.whatsapp || ''}" 
                                   class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block mb-2">البريد الإلكتروني</label>
                            <input type="email" id="branchEmail" value="${branch.email || ''}" 
                                   class="w-full px-4 py-2 border rounded-lg">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block mb-2">العنوان *</label>
                        <textarea id="branchAddress" required rows="3" 
                                  class="w-full px-4 py-2 border rounded-lg">${branch.address || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block mb-2">رابط الخريطة (Google Maps)</label>
                        <input type="url" id="branchGoogleMapUrl" value="${branch.googleMapUrl || ''}" 
                               placeholder="https://maps.google.com/..." class="w-full px-4 py-2 border rounded-lg">
                        <p class="text-sm text-gray-500 mt-1">
                            افتح الموقع على Google Maps ثم انقر على "Share" وانسخ الرابط
                        </p>
                    </div>
                    
                    <div class="flex justify-end space-x-3 space-x-reverse">
                        <button type="button" onclick="loadBranchesList()" class="btn-secondary">
                            إلغاء
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save ml-2"></i>تحديث الفرع
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('branchForm').addEventListener('submit', updateBranch);
        
    } catch (error) {
        console.error('Error loading branch:', error);
        alert('فشل تحميل بيانات الفرع');
    }
}

// تحديث فرع
async function updateBranch(e) {
    e.preventDefault();
    
    const branchId = document.getElementById('branchId').value;
    const branchData = {
        name: document.getElementById('branchName').value.trim(),
        phone: document.getElementById('branchPhone').value.trim(),
        whatsapp: document.getElementById('branchWhatsapp').value.trim(),
        email: document.getElementById('branchEmail').value.trim(),
        address: document.getElementById('branchAddress').value.trim(),
        googleMapUrl: document.getElementById('branchGoogleMapUrl').value.trim(),
        updatedAt: new Date()
    };
    
    try {
        await updateDoc(doc(db, 'branches', branchId), branchData);
        alert('تم تحديث الفرع بنجاح');
        await loadBranchesList();
    } catch (error) {
        console.error('Error updating branch:', error);
        alert('فشل تحديث الفرع: ' + error.message);
    }
}

// حذف فرع
window.deleteBranch = async function(branchId) {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'branches', branchId));
        alert('تم حذف الفرع بنجاح');
        await loadBranchesList();
    } catch (error) {
        console.error('Error deleting branch:', error);
        alert('فشل حذف الفرع: ' + error.message);
    }
}
