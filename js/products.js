import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js';
import { db, storage } from './firebase-config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary, uploadImageWithUI } from './cloudinary-config.js';

const PLACEHOLDER_PRODUCT_IMG =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect fill="#e5e7eb" width="50" height="50"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="9" font-family="system-ui,sans-serif">—</text></svg>'
    );

// ================================
// صفحة: المنتجات
// المسؤول عن:
// - عرض المنتجات + بحث سريع (يدعم العربية)
// - إضافة/تعديل/حذف منتج
// - استيراد منتجات من CSV
// - تعديل جماعي (Bulk Edit)
// - تفعيل خيار البيع بالوزن لكل منتج (soldByWeight)
// ================================

// نقطة الدخول لتحميل صفحة المنتجات داخل عنصر pageContent
export async function loadProducts() {
    const pageContent = document.getElementById('pageContent');
    
    try {
        // جلب المنتجات من Firestore
        const products = await getProducts();
        
        // بناء واجهة الصفحة
        pageContent.innerHTML = `
            <div class="card mb-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">المنتجات</h2>
                    <div class="flex space-x-2 space-x-reverse">
                        <button onclick="openImportModal()" class="btn-success">
                            <i class="fas fa-file-import ml-2"></i>استيراد منتجات
                        </button>
                        <button onclick="openBulkEditModal()" class="btn-warning">
                            <i class="fas fa-edit ml-2"></i>تعديل جماعي
                        </button>
                        <button onclick="openBulkDeleteModal()" class="btn-danger">
                            <i class="fas fa-trash ml-2"></i>حذف جماعي
                        </button>
                        <button onclick="openProductModal()" class="btn-primary">
                            <i class="fas fa-plus ml-2"></i>إضافة منتج جديد
                        </button>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex space-x-4 space-x-reverse">
                        <div class="flex-1">
                            <input type="text" id="productSearch" placeholder="بحث بالاسم، القسم، أو الوصف..." 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   >
                        </div>
                        <button onclick="clearSearch()" class="btn-secondary">
                            <i class="fas fa-times ml-2"></i>مسح البحث
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" id="selectAll" onchange="toggleSelectAll()">
                                </th>
                                <th>الصورة</th>
                                <th>الاسم</th>
                                <th>القسم</th>
                                <th>السعر</th>
                                <th>السعر بعد الخصم</th>
                                <th>الوزن</th>
                                <th>نوع البيع</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="productsTable">
                            ${products.map(product => `
                                <tr data-product-id="${product.id}">
                                    <td>
                                        <input type="checkbox" class="product-checkbox" value="${product.id}">
                                    </td>
                                    <td>
                                        <img src="${product.image || PLACEHOLDER_PRODUCT_IMG}" 
                                             alt="${product.name}" 
                                             class="w-12 h-12 object-cover rounded">
                                    </td>
                                    <td>${product.name}</td>
                                    <td>${product.category || 'غير محدد'}</td>
                                    <td>${product.price?.toFixed(2) || 0} ج.م</td>
                                    <td>${product.discountPrice ? product.discountPrice.toFixed(2) + ' ج.م' : '-'}</td>
                                    <td>${product.weight ? product.weight + ' كجم' : '-'}</td>
                                    <td>
                                        <label class="inline-flex items-center cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                ${product.soldByWeight ? 'checked' : ''}
                                                onchange="toggleSoldByWeight('${product.id}', this.checked)"
                                                class="ml-2"
                                            >
                                            <span>${product.soldByWeight ? 'بالوزن' : 'بالعدد'}</span>
                                        </label>
                                    </td>
                                    <td>${product.stock || 0}</td>
                                    <td>
                                        <span class="badge badge-${product.available ? 'success' : 'danger'}">
                                            ${product.available ? 'متوفر' : 'غير متوفر'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onclick="editProduct('${product.id}')" 
                                                class="btn-primary text-sm py-1 px-3 ml-2">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteProduct('${product.id}')" 
                                                class="btn-danger text-sm py-1 px-3">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Import Products Modal -->
            <div id="importModal" class="modal">
                <div class="modal-content" style="max-width: 700px;">
                    <span class="close" onclick="closeImportModal()">&times;</span>
                    <h2 class="text-2xl font-bold mb-6">استيراد منتجات من ملف</h2>
                    <div class="mb-4 p-4 bg-blue-50 border-r-4 border-blue-500 rounded">
                        <h3 class="font-bold mb-2">📋 تنسيق الملف المطلوب:</h3>
                        <p class="text-sm mb-2">الملف يجب أن يكون CSV (فاصلة أو فاصلة منقوطة)</p>
                        <p class="text-sm mb-2"><strong>الأعمدة المطلوبة:</strong></p>
                        <ul class="text-sm list-disc list-inside space-y-1">
                            <li><code>name</code> - اسم المنتج (مطلوب)</li>
                            <li><code>price</code> - السعر (مطلوب)</li>
                            <li><code>description</code> - الوصف (اختياري)</li>
                            <li><code>stock</code> - المخزون (افتراضي: 0)</li>
                            <li><code>category</code> - اسم القسم (اختياري)</li>
                            <li><code>available</code> - متوفر (true/false، افتراضي: true)</li>
                            <li><code>discountPrice</code> - السعر بعد الخصم (اختياري)</li>
                        </ul>
                        <p class="text-sm mt-2"><strong>مثال:</strong></p>
                        <pre class="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">name,price,description,stock,category,available
منتج 1,100.00,وصف المنتج,50,إلكترونيات,true
منتج 2,200.00,وصف آخر,30,ملابس,true</pre>
                    </div>
                    <form id="importForm" onsubmit="importProducts(event)">
                        <div class="form-group">
                            <label>اختر ملف CSV *</label>
                            <input type="file" id="importFile" accept=".csv,.txt" required>
                            <small class="text-gray-500">الملفات المدعومة: CSV, TXT</small>
                        </div>
                        <div class="form-group">
                            <label>فاصل الأعمدة</label>
                            <select id="importDelimiter">
                                <option value=",">فاصلة (,)</option>
                                <option value=";">فاصلة منقوطة (;)</option>
                                <option value="\t">Tab</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="importSkipHeader" checked>
                                تخطي السطر الأول (رأس الجدول)
                            </label>
                        </div>
                        <div id="importPreview" class="hidden mb-4">
                            <h3 class="font-bold mb-2">معاينة البيانات:</h3>
                            <div class="max-h-48 overflow-auto border rounded p-2 bg-gray-50">
                                <table class="table text-sm" id="previewTable"></table>
                            </div>
                            <p class="text-sm mt-2" id="previewCount"></p>
                        </div>
                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button type="button" onclick="closeImportModal()" 
                                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                إلغاء
                            </button>
                            <button type="submit" class="btn-primary" id="importBtn">
                                <i class="fas fa-file-import ml-2"></i>استيراد المنتجات
                            </button>
                        </div>
                    </form>
                    <div id="importProgress" class="hidden mt-4">
                        <div class="bg-blue-50 p-4 rounded">
                            <p class="font-semibold mb-2">جاري الاستيراد...</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div id="importProgressBar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                            </div>
                            <p id="importStatus" class="text-sm mt-2"></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Modal -->
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closeProductModal()">&times;</span>
                    <h2 class="text-2xl font-bold mb-6" id="modalTitle">إضافة منتج جديد</h2>
                    <form id="productForm" onsubmit="saveProduct(event)">
                        <input type="hidden" id="productId">
                        
                        <div class="form-group">
                            <label>اسم المنتج *</label>
                            <input type="text" id="productName" required>
                        </div>

                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="productDescription" rows="4"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>السعر (ج.م) *</label>
                                <input type="number" id="productPrice" step="0.01" required>
                            </div>

                            <div class="form-group">
                                <label>السعر بعد الخصم (ج.م)</label>
                                <input type="number" id="productDiscountPrice" step="0.01">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>القسم</label>
                                <select id="productCategory">
                                    <option value="">اختر القسم</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>المخزون</label>
                                <input type="number" id="productStock" min="0" value="0">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>الوزن (كجم) - اختياري</label>
                                <input type="number" id="productWeight" step="0.01" min="0" placeholder="مثال: 0.5">
                                <small class="text-gray-500">اتركه فارغاً إذا كان المنتج يُبعد بالعدد</small>
                            </div>

                            <div class="form-group">
                                <label>بيع بالوزن؟</label>
                                <select id="productSoldByWeight">
                                    <option value="false">بالعدد</option>
                                    <option value="true">بالوزن (كجم)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>الحالة</label>
                            <select id="productAvailable">
                                <option value="true">متوفر</option>
                                <option value="false">غير متوفر</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>صورة المنتج</label>
                            <input type="file" id="productImage" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onchange="previewImage(event)">
                            <small class="text-gray-500">الأنواع المدعومة: JPG, PNG, GIF, WebP (حد أقصى 5MB)</small>
                            <div id="imageUploadProgress" class="hidden mt-2">
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div id="imageProgressBar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                                </div>
                                <p id="imageProgressText" class="text-sm mt-1"></p>
                            </div>
                            <img id="imagePreview" class="mt-3 max-w-xs hidden rounded">
                        </div>

                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button type="button" onclick="closeProductModal()" 
                                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                إلغاء
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save ml-2"></i>حفظ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Load categories
        await loadCategoriesForSelect();

        // Improve search performance (debounced)
        // تهيئة البحث: debounce لتقليل عدد عمليات الفلترة أثناء الكتابة
        try {
            const input = document.getElementById('productSearch');
            if (input) {
                if (window.__productSearchHandler) {
                    input.removeEventListener('input', window.__productSearchHandler);
                }
                window.__productSearchHandler = debounce(() => {
                    if (typeof window.searchProducts === 'function') {
                        window.searchProducts();
                    }
                }, 120);
                input.addEventListener('input', window.__productSearchHandler);
            }
        } catch (e) {
            // noop
        }
    } catch (error) {
        console.error('Error loading products:', error);
        pageContent.innerHTML = '<div class="card"><p class="text-red-600">حدث خطأ أثناء تحميل المنتجات</p></div>';
    }
}

// تحديث خيار البيع بالوزن مباشرة من جدول المنتجات
window.toggleSoldByWeight = async function(productId, checked) {
    try {
        // تحديث المنتج في Firestore
        await updateDoc(doc(db, 'products', productId), {
            soldByWeight: checked === true,
            updatedAt: new Date()
        });
        loadProducts();
    } catch (error) {
        console.error('Error updating soldByWeight:', error);
        alert('حدث خطأ أثناء تحديث خيار الوزن');
        loadProducts();
    }
}

// دالة مساعدة: debounce لتأخير تنفيذ الدالة (مفيد للبحث)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// توحيد النص العربي للبحث (إزالة التشكيل وتوحيد أشكال الألف/الياء/التاء المربوطة...)
function normalizeArabic(text) {
    return String(text || '')
        .normalize('NFKD')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// جلب المنتجات من Firestore (مرتبة بالأحدث)
async function getProducts() {
    const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// تحميل الأقسام لملء select داخل نموذج إضافة/تعديل المنتج
async function loadCategoriesForSelect() {
    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        let categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // إضافة أقسام تجريبية إذا لم توجد أقسام
        if (categories.length === 0) {
            console.log('إضافة أقسام تجريبية للاختبار');
            categories = [
                { id: 'fruits', name: 'فواكه' },
                { id: 'vegetables', name: 'خضروات' },
                { id: 'dairy', name: 'منتجات الألبان' },
                { id: 'meat', name: 'لحوم' },
                { id: 'bakery', name: 'مخبوزات' },
                { id: 'drinks', name: 'مشروبات' }
            ];
        }
        
        // ملء select للمنتج العادي
        const select = document.getElementById('productCategory');
        if (select) {
            select.innerHTML = '<option value="">اختر القسم...</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
        
        // ملء select للتعديل الجماعي
        const bulkSelect = document.getElementById('bulkCategory');
        if (bulkSelect) {
            bulkSelect.innerHTML = '<option value="">لا تغيير</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                bulkSelect.appendChild(option);
            });
        }
        
        console.log(`تم تحميل ${categories.length} قسم بنجاح`);
    } catch (error) {
        console.error('Error loading categories:', error);
        
        // في حالة الخطأ، إضافة أقسام افتراضية
        const defaultCategories = [
            { id: 'fruits', name: 'فواكه' },
            { id: 'vegetables', name: 'خضروات' },
            { id: 'dairy', name: 'منتجات الألبان' }
        ];
        
        // ملء select للمنتج العادي
        const select = document.getElementById('productCategory');
        if (select) {
            select.innerHTML = '<option value="">اختر القسم...</option>';
            defaultCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
        
        // ملء select للتعديل الجماعي
        const bulkSelect = document.getElementById('bulkCategory');
        if (bulkSelect) {
            bulkSelect.innerHTML = '<option value="">لا تغيير</option>';
            defaultCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                bulkSelect.appendChild(option);
            });
        }
    }
}

// تعديل منتج: فتح النافذة مع ملء البيانات الحالية
window.editProduct = async function(productId) {
    try {
        // جلب بيانات المنتج من Firestore
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (!productDoc.exists()) {
            alert('المنتج غير موجود');
            return;
        }
        
        const product = { id: productDoc.id, ...productDoc.data() };
        
        // فتح نافذة المنتج
        await openProductModal();
        
        // ملء البيانات في النموذج
        document.getElementById('modalTitle').textContent = 'تعديل المنتج';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productDiscountPrice').value = product.discountPrice || '';
        document.getElementById('productCategory').value = product.categoryId || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productWeight').value = product.weight || '';
        document.getElementById('productSoldByWeight').value = product.soldByWeight ? 'true' : 'false';
        document.getElementById('productAvailable').value = product.available ? 'true' : 'false';
        
        // عرض الصورة الحالية
        if (product.image) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = product.image;
                preview.classList.remove('hidden');
            }
        }
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('حدث خطأ أثناء تحميل بيانات المنتج');
    }
}

// فتح نافذة إضافة/تعديل المنتج
window.openProductModal = async function() {
    const modal = document.getElementById('productModal');
    if (!modal) {
        // إنشاء النافذة إذا لم تكن موجودة
        document.body.insertAdjacentHTML('beforeend', `
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closeProductModal()">&times;</span>
                    <h2 class="text-2xl font-bold mb-6" id="modalTitle">إضافة منتج جديد</h2>
                    <form id="productForm" onsubmit="saveProduct(event)">
                        <input type="hidden" id="productId">
                        
                        <div class="form-group">
                            <label>اسم المنتج *</label>
                            <input type="text" id="productName" required>
                        </div>

                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="productDescription" rows="4"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>السعر (ج.م) *</label>
                                <input type="number" id="productPrice" step="0.01" required>
                            </div>

                            <div class="form-group">
                                <label>السعر بعد الخصم (ج.م)</label>
                                <input type="number" id="productDiscountPrice" step="0.01">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>القسم</label>
                                <select id="productCategory">
                                    <option value="">اختر القسم</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>المخزون</label>
                                <input type="number" id="productStock" min="0" value="0">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label>الوزن (كجم) - اختياري</label>
                                <input type="number" id="productWeight" step="0.01" min="0" placeholder="مثال: 0.5">
                                <small class="text-gray-500">اتركه فارغاً إذا كان المنتج يُبعد بالعدد</small>
                            </div>

                            <div class="form-group">
                                <label>بيع بالوزن؟</label>
                                <select id="productSoldByWeight">
                                    <option value="false">بالعدد</option>
                                    <option value="true">بالوزن (كجم)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>الحالة</label>
                            <select id="productAvailable">
                                <option value="true">متوفر</option>
                                <option value="false">غير متوفر</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>صورة المنتج</label>
                            <input type="file" id="productImage" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onchange="previewImage(event)">
                            <small class="text-gray-500">الأنواع المدعومة: JPG, PNG, GIF, WebP (حد أقصى 5MB)</small>
                            <div id="imageUploadProgress" class="hidden mt-2">
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div id="imageProgressBar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                                </div>
                                <p id="imageProgressText" class="text-sm mt-1"></p>
                            </div>
                            <img id="imagePreview" class="mt-3 max-w-xs hidden rounded">
                        </div>

                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button type="button" onclick="closeProductModal()" 
                                    class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                إلغاء
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save ml-2"></i>حفظ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `);
    }
    
    // إعادة تعيين النموذج
    document.getElementById('productForm').reset();
    document.getElementById('modalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    
    // تحميل الأقسام
    await loadCategoriesForSelect();
    
    // عرض النافذة
    document.getElementById('productModal').style.display = 'block';
}

// إغلاق نافذة المنتج
window.closeProductModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// معاينة الصورة قبل الرفع
window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    }
}

// حذف منتج (مع حذف الصورة إن أمكن)
window.deleteProduct = async function(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        // جلب بيانات المنتج أولاً (لاستخدامها في حذف الصور إن وجدت)
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            const product = { id: productDoc.id, ...productDoc.data() };

            // حذف الصورة من Cloudinary (لو كانت مستخدمة)
            if (product.imagePath) {
                try {
                    await deleteImageFromCloudinary(product.imagePath);
                    console.log('تم حذف الصورة من Cloudinary:', product.imagePath);
                } catch (error) {
                    console.error('Error deleting image from Cloudinary:', error);
                }
            }

            // حذف الصورة من Firebase Storage (لو كانت مستخدمة)
            if (product.imageStoragePath) {
                try {
                    await deleteObject(ref(storage, product.imageStoragePath));
                    console.log('تم حذف الصورة من Storage:', product.imageStoragePath);
                } catch (error) {
                    console.error('Error deleting image from Storage:', error);
                }
            }
        }

        // حذف المنتج من Firestore
        await deleteDoc(doc(db, 'products', productId));
        alert('تم حذف المنتج بنجاح');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
    }
}

// ================================
// الاستيراد من CSV
// ================================
window.openImportModal = function() {
    document.getElementById('importModal').style.display = 'block';
    document.getElementById('importForm').reset();
    document.getElementById('importPreview').classList.add('hidden');
    document.getElementById('importProgress').classList.add('hidden');
    
    // Add event listener for file preview
    const importFileInput = document.getElementById('importFile');
    if (importFileInput) {
        // Remove old listener if exists
        importFileInput.removeEventListener('change', window.previewImportFile);
        // Add new listener
        importFileInput.addEventListener('change', window.previewImportFile);
    }
}

// إغلاق نافذة الاستيراد
window.closeImportModal = function() {
    document.getElementById('importModal').style.display = 'none';
}

// قراءة ملف CSV وعرض معاينة قبل الاستيراد
window.previewImportFile = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const delimiter = document.getElementById('importDelimiter').value;
    const skipHeader = document.getElementById('importSkipHeader').checked;
    
    try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            alert('الملف فارغ');
            return;
        }
        
        const startIndex = skipHeader ? 1 : 0;
        const previewLines = lines.slice(startIndex, Math.min(startIndex + 10, lines.length));
        
        // Parse CSV
        const rows = previewLines.map(line => {
            const cols = line.split(delimiter).map(col => col.trim().replace(/^"|"$/g, ''));
            return cols;
        });
        
        if (rows.length === 0) {
            alert('لا توجد بيانات في الملف');
            return;
        }
        
        // Show preview
        const previewTable = document.getElementById('previewTable');
        previewTable.innerHTML = '';
        
        // Header
        const headerRow = document.createElement('tr');
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        previewTable.appendChild(headerRow);
        
        // Data rows
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell || '-';
                tr.appendChild(td);
            });
            previewTable.appendChild(tr);
        });
        
        document.getElementById('previewCount').textContent = 
            `سيتم استيراد ${lines.length - startIndex} منتج (يعرض أول 10 صفوف)`;
        document.getElementById('importPreview').classList.remove('hidden');
    } catch (error) {
        console.error('Error previewing file:', error);
        alert('حدث خطأ أثناء قراءة الملف');
    }
}

// تنفيذ الاستيراد الفعلي (إضافة المنتجات إلى Firestore)
window.importProducts = async function(event) {
    event.preventDefault();
    
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        alert('يرجى اختيار ملف');
        return;
    }
    
    const delimiter = document.getElementById('importDelimiter').value;
    const skipHeader = document.getElementById('importSkipHeader').checked;
    const importBtn = document.getElementById('importBtn');
    const progressDiv = document.getElementById('importProgress');
    const progressBar = document.getElementById('importProgressBar');
    const statusText = document.getElementById('importStatus');
    
    // Show progress
    progressDiv.classList.remove('hidden');
    importBtn.disabled = true;
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الاستيراد...';
    
    try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            throw new Error('الملف فارغ');
        }
        
        const startIndex = skipHeader ? 1 : 0;
        const dataLines = lines.slice(startIndex);
        
        if (dataLines.length === 0) {
            throw new Error('لا توجد بيانات للاستيراد');
        }
        
        // Get headers
        const headerLine = skipHeader ? lines[0] : null;
        const headers = headerLine ? 
            headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/^"|"$/g, '')) : 
            ['name', 'price', 'description', 'stock', 'category', 'available', 'discountprice'];
        
        // Get categories for mapping
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Process each line
        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const cols = line.split(delimiter).map(col => col.trim().replace(/^"|"$/g, ''));
            
            try {
                // Map columns to data
                const productData = {};
                
                headers.forEach((header, index) => {
                    const value = cols[index] || '';
                    
                    switch(header) {
                        case 'name':
                            productData.name = value;
                            break;
                        case 'price':
                            productData.price = parseFloat(value) || 0;
                            break;
                        case 'description':
                            productData.description = value;
                            break;
                        case 'stock':
                            productData.stock = parseInt(value) || 0;
                            break;
                        case 'category':
                            if (value) {
                                const categoryId = categoryMap.get(value.toLowerCase());
                                if (categoryId) {
                                    productData.categoryId = categoryId;
                                } else {
                                    // Try to find by partial match
                                    const found = categories.find(cat => 
                                        cat.name.toLowerCase().includes(value.toLowerCase()) ||
                                        value.toLowerCase().includes(cat.name.toLowerCase())
                                    );
                                    if (found) {
                                        productData.categoryId = found.id;
                                    }
                                }
                            }
                            break;
                        case 'available':
                            productData.available = value.toLowerCase() === 'true' || value === '1' || value === '';
                            break;
                        case 'discountprice':
                            if (value) {
                                productData.discountPrice = parseFloat(value);
                            }
                            break;
                    }
                });
                
                // Validate required fields
                if (!productData.name || !productData.price) {
                    throw new Error('اسم المنتج والسعر مطلوبان');
                }
                
                // Set defaults
                productData.stock = productData.stock || 0;
                productData.available = productData.available !== undefined ? productData.available : true;
                productData.createdAt = new Date();
                productData.updatedAt = new Date();
                
                // Add to Firestore
                await addDoc(collection(db, 'products'), productData);
                successCount++;
                
            } catch (error) {
                errorCount++;
                errors.push(`السطر ${i + 1 + startIndex}: ${error.message || 'خطأ غير معروف'}`);
            }
            
            // Update progress
            const progress = ((i + 1) / dataLines.length) * 100;
            progressBar.style.width = progress + '%';
            statusText.textContent = `تم معالجة ${i + 1} من ${dataLines.length} منتج`;
        }
        
        // Show results
        let message = `تم استيراد ${successCount} منتج بنجاح`;
        if (errorCount > 0) {
            message += `\nفشل استيراد ${errorCount} منتج`;
            console.error('Import errors:', errors);
        }
        
        alert(message);
        
        // Reset
        closeImportModal();
        loadProducts();
        
    } catch (error) {
        console.error('Error importing products:', error);
        alert(`حدث خطأ أثناء الاستيراد: ${error.message || 'خطأ غير معروف'}`);
    } finally {
        importBtn.disabled = false;
        importBtn.innerHTML = '<i class="fas fa-file-import ml-2"></i>استيراد المنتجات';
        progressDiv.classList.add('hidden');
    }
}


window.saveProduct = async function(event) {
    event.preventDefault();
    
    // حفظ منتج: إضافة جديد أو تحديث موجود حسب وجود productId
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const discountPrice = document.getElementById('productDiscountPrice').value ? 
                         parseFloat(document.getElementById('productDiscountPrice').value) : null;
    const categoryId = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const available = document.getElementById('productAvailable').value === 'true';
    const weight = document.getElementById('productWeight').value ? 
                   parseFloat(document.getElementById('productWeight').value) : null;
    const soldByWeight = document.getElementById('productSoldByWeight').value === 'true';
    const imageFile = document.getElementById('productImage').files[0];
    
    try {
        let imageUrl = '';
        let imagePath = '';
        
        // Upload image if new file selected
        if (imageFile) {
            try {
                // Show upload progress
                console.log('بدء رفع الصورة إلى Cloudinary:', imageFile.name);
                
                // Upload to Cloudinary
                const uploadResult = await uploadImageWithUI(
                    document.getElementById('productImage'),
                    productId || 'temp',
                    (progress, status) => {
                        // Update progress UI
                        const progressDiv = document.getElementById('imageUploadProgress');
                        const progressBar = document.getElementById('imageProgressBar');
                        
                        if (progressDiv) {
                            progressDiv.classList.remove('hidden');
                        }
                        
                        if (progressBar) {
                            progressBar.style.width = `${progress}%`;
                        }
                        
                        console.log(`Upload progress: ${progress}% - ${status}`);
                    }
                );
                
                imageUrl = uploadResult.url;
                imagePath = uploadResult.publicId;
                
                console.log('تم رفع الصورة إلى Cloudinary بنجاح:', imageUrl);
                
                // Hide progress
                const progressDiv = document.getElementById('imageUploadProgress');
                if (progressDiv) {
                    progressDiv.classList.add('hidden');
                }
                
            } catch (uploadError) {
                console.error('خطأ في رفع الصورة إلى Cloudinary:', uploadError);
                throw new Error(`فشل رفع الصورة: ${uploadError.message || 'تحقق من إعدادات Cloudinary'}`);
            }
        } else if (productId) {
            // Keep existing image if editing and no new image
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                imageUrl = productDoc.data().image || '';
                imagePath = productDoc.data().imagePath || '';
            }
        }
        
        const productData = {
            name,
            description,
            price,
            discountPrice,
            categoryId,
            stock,
            available,
            weight,
            soldByWeight,
            image: imageUrl,
            imagePath: imagePath,
            updatedAt: new Date()
        };
        
        if (productId) {
            // Update existing product
            await updateDoc(doc(db, 'products', productId), productData);
            alert('تم تحديث المنتج بنجاح');
        } else {
            // Add new product
            productData.createdAt = new Date();
            await addDoc(collection(db, 'products'), productData);
            alert('تم إضافة المنتج بنجاح');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        let errorMessage = 'حدث خطأ أثناء حفظ المنتج';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code) {
            if (error.code === 'storage/unauthorized') {
                errorMessage = 'ليس لديك صلاحية لرفع الصور. تحقق من قواعد Storage';
            } else if (error.code === 'storage/canceled') {
                errorMessage = 'تم إلغاء رفع الصورة';
            } else if (error.code === 'storage/unknown') {
                errorMessage = 'حدث خطأ غير معروف أثناء رفع الصورة';
            }
        }
        
        alert(errorMessage);
    }
}

// ================================
// البحث والفلترة داخل جدول المنتجات
// ================================
window.searchProducts = function() {
    const searchTerm = normalizeArabic(document.getElementById('productSearch').value);
    const rows = document.querySelectorAll('#productsTable tr');
    
    rows.forEach(row => {
        const text = normalizeArabic(row.textContent);
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// مسح خانة البحث وإظهار كل المنتجات
window.clearSearch = function() {
    document.getElementById('productSearch').value = '';
    searchProducts();
}

// تحديد/إلغاء تحديد كل المنتجات (للاستخدام في التعديل الجماعي)
window.toggleSelectAll = function() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// الحصول على قائمة المنتجات المحددة
window.getSelectedProducts = function() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const selectedProducts = [];
    
    checkboxes.forEach(checkbox => {
        selectedProducts.push(checkbox.value);
    });
    
    return selectedProducts;
}

// ================================
// التعديل الجماعي (Bulk Edit)
// ================================
window.openBulkEditModal = async function() {
    const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked'))
        .map(cb => cb.value);
    
    if (selectedProducts.length === 0) {
        alert('يرجى اختيار منتج واحد على الأقل للتعديل الجماعي');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeBulkEditModal()">&times;</span>
            <h2 class="text-2xl font-bold mb-6">تعديل جماعي (${selectedProducts.length} منتج)</h2>
            <form id="bulkEditForm" onsubmit="saveBulkEdit(event)">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>تغيير القسم</label>
                        <select id="bulkCategory">
                            <option value="">لا تغيير</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>تغيير الحالة</label>
                        <select id="bulkAvailable">
                            <option value="">لا تغيير</option>
                            <option value="true">متوفر</option>
                            <option value="false">غير متوفر</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>زيادة السعر (%)</label>
                        <input type="number" id="bulkPriceIncrease" step="0.1" min="0" placeholder="مثال: 10">
                        <small class="text-gray-500">اتركه فارغاً لعدم التغيير</small>
                    </div>
                    
                    <div class="form-group">
                        <label>تغيير المخزون</label>
                        <input type="number" id="bulkStock" min="0" placeholder="مثال: 50">
                        <small class="text-gray-500">اتركه فارغاً لعدم التغيير</small>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label>تغيير الوزن (كجم)</label>
                        <input type="number" id="bulkWeight" step="0.01" min="0" placeholder="مثال: 1">
                        <small class="text-gray-500">اتركه فارغاً لعدم التغيير</small>
                    </div>
                    
                    <div class="form-group">
                        <label>بيع بالوزن؟</label>
                        <select id="bulkSoldByWeight">
                            <option value="">لا تغيير</option>
                            <option value="true">بالوزن</option>
                            <option value="false">بالعدد</option>
                        </select>
                    </div>
                </div>
                
                <input type="hidden" id="bulkProductIds" value="${selectedProducts.join(',')}">
                
                <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                    <button type="button" onclick="closeBulkEditModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        إلغاء
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save ml-2"></i>حفظ التعديلات
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load categories for select
    await loadCategoriesForSelect();
}

// إغلاق نافذة التعديل الجماعي
window.closeBulkEditModal = function() {
    // البحث عن جميع النوافذ المفتوحة وإغلاقها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 50);
        }
    });
}

// فتح نافذة الحذف الجماعي
window.openBulkDeleteModal = function() {
    const selectedProducts = getSelectedProducts();
    
    if (selectedProducts.length === 0) {
        alert('يرجى اختيار منتج واحد على الأقل للحذف');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-bold mb-4 text-red-600">
                <i class="fas fa-exclamation-triangle ml-2"></i>
                تأكيد الحذف الجماعي
            </h3>
            
            <div class="mb-4">
                <p class="text-gray-700 mb-2">
                    هل أنت متأكد من حذف <strong>${selectedProducts.length}</strong> منتج؟
                </p>
                <p class="text-red-600 text-sm">
                    ⚠️ هذا الإجراء لا يمكن التراجع عنه وسيحذف:
                </p>
                <ul class="text-red-600 text-sm mr-4 mt-2">
                    <li>• بيانات المنتجات</li>
                    <li>• جميع الصور المرتبطة</li>
                    <li>• أي بيانات متعلقة بالمنتجات</li>
                </ul>
            </div>
            
            <div class="mb-4">
                <label class="flex items-center text-red-600">
                    <input type="checkbox" id="confirmDelete" class="ml-2">
                    <span>نعم، أنا متأكد من الحذف</span>
                </label>
            </div>
            
            <input type="hidden" id="bulkDeleteProductIds" value="${selectedProducts.join(',')}">
            
            <div class="flex justify-end space-x-3 space-x-reverse">
                <button type="button" onclick="closeBulkDeleteModal()" 
                        class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    إلغاء
                </button>
                <button type="button" onclick="performBulkDelete()" 
                        class="btn-danger" id="bulkDeleteBtn" disabled>
                    <i class="fas fa-trash ml-2"></i>حذف المنتجات
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // تفعيل زر الحذف عند تأكيد المستخدم
    document.getElementById('confirmDelete').addEventListener('change', function() {
        document.getElementById('bulkDeleteBtn').disabled = !this.checked;
    });
}

// إغلاق نافذة الحذف الجماعي
window.closeBulkDeleteModal = function() {
    // البحث عن جميع النوافذ المفتوحة وإغلاقها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 50);
        }
    });
}

// تنفيذ الحذف الجماعي
window.performBulkDelete = async function() {
    const productIds = document.getElementById('bulkDeleteProductIds').value.split(',');
    const deleteBtn = document.getElementById('bulkDeleteBtn');
    
    try {
        // تعطيل الزر أثناء الحذف
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحذف...';
        
        let deletedCount = 0;
        let errorCount = 0;
        
        for (const productId of productIds) {
            try {
                // جلب بيانات المنتج أولاً
                const productDoc = await getDoc(doc(db, 'products', productId.trim()));
                
                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    
                    // حذف الصور من Cloudinary
                    if (productData.images && Array.isArray(productData.images)) {
                        for (const image of productData.images) {
                            if (image.publicId) {
                                try {
                                    await deleteImageFromCloudinary(image.publicId);
                                    console.log('تم حذف الصورة:', image.publicId);
                                } catch (error) {
                                    console.warn('خطأ في حذف الصورة:', error);
                                }
                            }
                        }
                    }
                    
                    // حذف المنتج من Firestore
                    await deleteDoc(doc(db, 'products', productId.trim()));
                    console.log('تم حذف المنتج:', productId);
                    deletedCount++;
                }
            } catch (error) {
                console.error('خطأ في حذف المنتج:', productId, error);
                errorCount++;
            }
        }
        
        // إغلاق النافذة مع تأخير بسيط
        setTimeout(() => {
            closeBulkDeleteModal();
        }, 100);
        
        // إعادة تحميل قائمة المنتجات
        loadProducts();
        
        // عرض رسالة النتيجة
        if (errorCount === 0) {
            alert(`✅ تم حذف ${deletedCount} منتج بنجاح`);
        } else {
            alert(`⚠️ تم حذف ${deletedCount} منتج بنجاح، وفشل حذف ${errorCount} منتج`);
        }
        
    } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('حدث خطأ أثناء الحذف الجماعي: ' + error.message);
    } finally {
        // إعادة تعيين الزر
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="fas fa-trash ml-2"></i>حذف المنتجات';
    }
}

// حفظ التعديلات الجماعية وتحديث المنتجات في Firestore
window.saveBulkEdit = async function(event) {
    event.preventDefault();
    
    const productIds = document.getElementById('bulkProductIds').value.split(',');
    const category = document.getElementById('bulkCategory').value;
    const available = document.getElementById('bulkAvailable').value;
    const priceIncrease = document.getElementById('bulkPriceIncrease').value;
    const stock = document.getElementById('bulkStock').value;
    const weight = document.getElementById('bulkWeight').value;
    const soldByWeight = document.getElementById('bulkSoldByWeight').value;
    
    try {
        for (const productId of productIds) {
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                const product = productDoc.data();
                const updates = {};
                
                if (category) updates.categoryId = category;
                if (available !== '') updates.available = available === 'true';
                if (priceIncrease) {
                    const increase = parseFloat(priceIncrease) / 100;
                    updates.price = product.price * (1 + increase);
                    if (product.discountPrice) {
                        updates.discountPrice = product.discountPrice * (1 + increase);
                    }
                }
                if (stock !== '') updates.stock = parseInt(stock);
                if (weight !== '') updates.weight = parseFloat(weight);
                if (soldByWeight !== '') updates.soldByWeight = soldByWeight === 'true';
                
                updates.updatedAt = new Date();
                
                await updateDoc(doc(db, 'products', productId), updates);
            }
        }
        
        alert(`تم تحديث ${productIds.length} منتج بنجاح`);
        closeBulkEditModal();
        loadProducts();
    } catch (error) {
        console.error('Error in bulk edit:', error);
        alert('حدث خطأ أثناء التحديث الجماعي');
    }
}

