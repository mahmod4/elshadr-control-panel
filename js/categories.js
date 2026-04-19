/**
 * ========================================
 * إدارة الأقسام - Categories Management
 * ========================================
 * 
 * Purpose: إدارة أقسام المنتجات في لوحة تحكم المتجر
 * Usage: صفحة الأقسام في لوحة التحكم لتنظيم المنتجات
 * Features: CRUD كامل، أيقونات، ترتيب، تصنيف
 * 
 * يحتوي هذا الملف على:
 * - عرض جميع أقسام المتجر
 * - إضافة أقسام جديدة مع أيقونات
 * - تعديل بيانات الأقسام الموجودة
 * - حذف الأقسام غير المستخدمة
 * - ترتيب الأقسام وتنظيمها
 * - رفع أيقونات الأقسام
 * 
 * الوظائف الرئيسية:
 * - loadCategories(): تحميل وعرض الأقسام
 * - getCategories(): جلب قائمة الأقسام
 * - addCategory(): إضافة قسم جديد
 * - updateCategory(): تحديث قسم موجود
 * - deleteCategory(): حذف قسم
 * - uploadCategoryIcon(): رفع أيقونة القسم
 * 
 * Features:
 * - رفع الأيقونات عبر Cloudinary
 * - التحقق من صحة البيانات
 * - منع حذف الأقسام المستخدمة
 * - عرض المنتجات في كل قسم
 * - ترتيب الأقسام بالسحب والإفلات
 * 
 * Dependencies:
 * - Firebase Firestore للأقسام
 * - Cloudinary للأيقونات
 * - firebase-config.js للإعدادات
 * 
 * Author: نظام المتجر الإلكتروني
 * Version: 1.0.0
 */

import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import { db } from './firebase-config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './cloudinary-config.js?v=20260405';

const PLACEHOLDER_CATEGORY_ICON =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="#e5e7eb" width="40" height="40"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="8" font-family="system-ui,sans-serif">—</text></svg>'
    );

export async function loadCategories() {
    const pageContent = document.getElementById('pageContent');
    
    try {
        const categories = await getCategories();
        
        pageContent.innerHTML = `
            <div class="card mb-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">الأقسام</h2>
                    <button onclick="openCategoryModal()" class="btn-primary">
                        <i class="fas fa-plus ml-2"></i>إضافة قسم جديد
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>الترتيب</th>
                                <th>الأيقونة</th>
                                <th>الاسم</th>
                                <th>الوصف</th>
                                <th>عدد المنتجات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="categoriesTable">
                            ${categories.map((category, index) => `
                                <tr>
                                    <td>
                                        <button onclick="moveCategory('${category.id}', 'up')" 
                                                class="btn-primary text-sm py-1 px-2 ml-1" 
                                                ${index === 0 ? 'disabled' : ''}>
                                            <i class="fas fa-arrow-up"></i>
                                        </button>
                                        <button onclick="moveCategory('${category.id}', 'down')" 
                                                class="btn-primary text-sm py-1 px-2" 
                                                ${index === categories.length - 1 ? 'disabled' : ''}>
                                            <i class="fas fa-arrow-down"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <img src="${category.iconUrl || PLACEHOLDER_CATEGORY_ICON}" alt="${category.name}" class="w-10 h-10 object-contain rounded bg-white" />
                                    </td>
                                    <td>${category.name}</td>
                                    <td>${category.description || '-'}</td>
                                    <td>${category.productCount || 0}</td>
                                    <td>
                                        <button onclick="editCategory('${category.id}')" 
                                                class="btn-primary text-sm py-1 px-3 ml-2">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteCategory('${category.id}')" 
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

            <!-- Category Modal -->
            <div id="categoryModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closeCategoryModal()">&times;</span>
                    <h2 class="text-2xl font-bold mb-6" id="categoryModalTitle">إضافة قسم جديد</h2>
                    <form id="categoryForm" onsubmit="saveCategory(event)">
                        <input type="hidden" id="categoryId">
                        
                        <div class="form-group">
                            <label>اسم القسم *</label>
                            <input type="text" id="categoryName" required>
                        </div>

                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="categoryDescription" rows="4"></textarea>
                        </div>

                        <div class="form-group">
                            <label>أيقونة القسم (صورة)</label>
                            <input type="file" id="categoryIcon" accept="image/*">
                            <small class="text-gray-500">إذا لم يتم اختيار صورة، سيتم استخدام أيقونة افتراضية في المتجر</small>
                        </div>

                        <div class="form-group">
                            <label>ترتيب العرض</label>
                            <input type="number" id="categoryOrder" min="0" value="0">
                        </div>

                        <div class="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button type="button" onclick="closeCategoryModal()" 
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
    } catch (error) {
        console.error('Error loading categories:', error);
        pageContent.innerHTML = '<div class="card"><p class="text-red-600">حدث خطأ أثناء تحميل الأقسام</p></div>';
    }
}

async function getCategories() {
    const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get product count for each category
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => doc.data());
    
    return categories.map(category => ({
        ...category,
        productCount: products.filter(p => p.categoryId === category.id).length
    }));
}

window.openCategoryModal = function() {
    document.getElementById('categoryModal').style.display = 'block';
    document.getElementById('categoryModalTitle').textContent = 'إضافة قسم جديد';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
}

window.closeCategoryModal = function() {
    document.getElementById('categoryModal').style.display = 'none';
}

window.editCategory = async function(categoryId) {
    try {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        if (categoryDoc.exists()) {
            const category = { id: categoryDoc.id, ...categoryDoc.data() };
            
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name || '';
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryOrder').value = category.order || 0;
            
            document.getElementById('categoryModalTitle').textContent = 'تعديل القسم';
            document.getElementById('categoryModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading category:', error);
        alert('حدث خطأ أثناء تحميل القسم');
    }
}

window.deleteCategory = async function(categoryId) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    
    try {
        // Check if category has products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const hasProducts = productsSnapshot.docs.some(doc => doc.data().categoryId === categoryId);
        
        if (hasProducts) {
            alert('لا يمكن حذف القسم لأنه يحتوي على منتجات');
            return;
        }
        
        await deleteDoc(doc(db, 'categories', categoryId));
        alert('تم حذف القسم بنجاح');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('حدث خطأ أثناء حذف القسم');
    }
}

window.moveCategory = async function(categoryId, direction) {
    try {
        const categories = await getCategories();
        const currentIndex = categories.findIndex(c => c.id === categoryId);
        
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;
        
        const currentCategory = categories[currentIndex];
        const targetCategory = categories[newIndex];
        
        // Swap orders
        await updateDoc(doc(db, 'categories', currentCategory.id), {
            order: targetCategory.order || newIndex
        });
        
        await updateDoc(doc(db, 'categories', targetCategory.id), {
            order: currentCategory.order || currentIndex
        });
        
        loadCategories();
    } catch (error) {
        console.error('Error moving category:', error);
        alert('حدث خطأ أثناء تغيير الترتيب');
    }
}

window.saveCategory = async function(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    const order = parseInt(document.getElementById('categoryOrder').value) || 0;
    const iconFile = document.getElementById('categoryIcon').files[0];
    
    try {
        const categoryData = {
            name,
            description,
            order,
            updatedAt: new Date()
        };

        // رفع أيقونة القسم إلى Cloudinary إذا تم اختيار صورة
        if (iconFile) {
            let oldPublicId = '';
            if (categoryId) {
                try {
                    const existing = await getDoc(doc(db, 'categories', categoryId));
                    if (existing.exists()) {
                        oldPublicId = existing.data().iconPublicId || '';
                    }
                } catch (e) {
                }
            }

            if (oldPublicId) {
                try {
                    await deleteImageFromCloudinary(oldPublicId);
                } catch (e) {
                }
            }

            const uploadResult = await uploadImageToCloudinary(iconFile, 'categories');
            categoryData.iconUrl = uploadResult.url;
            categoryData.iconPublicId = uploadResult.publicId;
        }
        
        if (categoryId) {
            await updateDoc(doc(db, 'categories', categoryId), categoryData);
            alert('تم تحديث القسم بنجاح');
        } else {
            categoryData.createdAt = new Date();
            await addDoc(collection(db, 'categories'), categoryData);
            alert('تم إضافة القسم بنجاح');
        }
        
        closeCategoryModal();
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        alert('حدث خطأ أثناء حفظ القسم');
    }
}

