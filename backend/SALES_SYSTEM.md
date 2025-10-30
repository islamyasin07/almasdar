# 📊 نظام دفتر المبيعات - Sales Ledger System

نظام شامل لإدارة المبيعات والزبائن مع تتبع الأرقام التسلسلية، الدفعات، والإرجاعات.

## ✨ المميزات الرئيسية

### 📝 إدارة المبيعات
- ✅ تسجيل عمليات البيع مع تفاصيل كاملة
- ✅ البحث بالرقم التسلسلي (Serial Number)
- ✅ إضافة منتجات متعددة لكل عملية بيع
- ✅ حساب تلقائي للإجمالي والمتبقي
- ✅ إمكانية رفع صور للمنتجات (اختياري)

### 💰 إدارة الدفعات
- ✅ دفعات متعددة (تقسيط)
- ✅ طرق دفع متنوعة: نقداً، بطاقة، تحويل بنكي
- ✅ تتبع المبلغ المدفوع والمتبقي
- ✅ حالات البيع: معلق، جزئي، مدفوع كاملاً

### 👥 إدارة الزبائن
- ✅ إنشاء تلقائي للزبون إذا لم يكن موجود
- ✅ بحث ذكي بالاسم أو رقم الهاتف
- ✅ تتبع إجمالي المشتريات والإنفاق
- ✅ سجل كامل لكل عمليات الشراء

### 🔄 إدارة الإرجاعات
- ✅ إرجاع منتجات محددة
- ✅ تسجيل سبب الإرجاع وتاريخه
- ✅ تحديث تلقائي لحالة البيع

### 📈 التقارير والإحصائيات
- ✅ إحصائيات المبيعات حسب الفترة
- ✅ أفضل الزبائن
- ✅ المبيعات حسب اليوم
- ✅ تحليل حالات الدفع

## 🗄️ قاعدة البيانات

### Schema: Customer (الزبائن)
```typescript
{
  name: string,           // اسم الزبون (مطلوب)
  phone?: string,         // رقم الهاتف (اختياري، مفهرس)
  email?: string,         // البريد الإلكتروني (اختياري، مفهرس)
  address?: string,       // العنوان
  notes?: string,         // ملاحظات
  totalPurchases: number, // عدد عمليات الشراء
  totalSpent: number,     // إجمالي الإنفاق
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (index)
- `phone` (sparse index)
- `email` (sparse index)
- Text index: `name`, `phone`, `email`
- `totalSpent` (desc)
- `totalPurchases` (desc)
- `createdAt` (desc)

### Schema: Sale (المبيعات)
```typescript
{
  customerId: ObjectId,      // مرجع للزبون (مطلوب، مفهرس)
  customerName: string,      // اسم الزبون (مطلوب، مفهرس)
  items: [                   // المنتجات
    {
      productId?: ObjectId,
      serialNumber: string,  // الرقم التسلسلي (مطلوب، مفهرس)
      productName: string,
      quantity: number,
      price: number,
      images?: string[],
      isReturned?: boolean,
      returnDate?: Date,
      returnReason?: string
    }
  ],
  totalAmount: number,       // المبلغ الإجمالي
  paidAmount: number,        // المبلغ المدفوع (محسوب تلقائياً)
  remainingAmount: number,   // المبلغ المتبقي (محسوب تلقائياً)
  payments: [                // الدفعات
    {
      amount: number,
      date: Date,
      method: string,        // cash, card, bank
      notes?: string
    }
  ],
  status: string,            // pending, paid, partial, returned (محسوب تلقائياً)
  notes?: string,
  createdBy: ObjectId,       // المستخدم المنشئ
  saleDate: Date,            // تاريخ البيع (مفهرس)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `customerId` (index)
- `customerName` (index + text index)
- `items.serialNumber` (index)
- `status` (index)
- `saleDate` (desc)
- `createdBy` (index)
- `createdAt` (desc)
- `totalAmount` (desc)
- `remainingAmount` (desc)
- Compound: `customerId + saleDate`
- Compound: `status + saleDate`
- Compound: `createdBy + saleDate`

### Schema: Product (تحديث)
```typescript
{
  // ... الحقول الموجودة ...
  serialNumber?: string,  // الرقم التسلسلي (اختياري، فريد، مفهرس)
  // ... باقي الحقول ...
}
```

**Indexes المضافة:**
- `serialNumber` (unique sparse index)
- Text index: includes `serialNumber`

## 🛣️ API Endpoints

### Customers API
```
POST   /api/customers/search-or-create  - بحث أو إنشاء زبون
GET    /api/customers                   - قائمة الزبائن
GET    /api/customers/:id               - تفاصيل زبون
PUT    /api/customers/:id               - تحديث زبون
DELETE /api/customers/:id               - حذف زبون
```

### Sales API
```
POST   /api/sales                       - إنشاء عملية بيع
GET    /api/sales                       - قائمة المبيعات
GET    /api/sales/:id                   - تفاصيل بيع
PUT    /api/sales/:id                   - تحديث بيع
DELETE /api/sales/:id                   - حذف بيع
POST   /api/sales/:id/payment           - إضافة دفعة
POST   /api/sales/return-item           - إرجاع منتج
GET    /api/sales/search-product        - البحث بالرقم التسلسلي
```

### Database API
```
GET    /api/database/health             - حالة قاعدة البيانات والـ indexes
GET    /api/database/sales-stats        - إحصائيات المبيعات
```

## 🎨 Frontend Components

### AdminSalesComponent
صفحة إضافة عملية بيع جديدة:
- بحث واختيار الزبون
- إضافة منتجات بالرقم التسلسلي
- إدارة الدفعات
- حساب تلقائي للإجمالي
- Glass/Glow effects

**Route:** `/admin/sales/new`

### AdminSalesHistoryComponent
صفحة عرض سجل المبيعات:
- كروت تلخيصية
- فلاتر حسب الحالة
- بحث متقدم
- Modal لتفاصيل البيع
- إضافة دفعات
- إرجاع منتجات

**Route:** `/admin/sales`

## 🔐 الصلاحيات

جميع endpoints تتطلب:
- Authentication (JWT Token)
- Authorization: `admin` أو `staff`

## 📊 التحليلات والتقارير

### Database Health
```typescript
GET /api/database/health

Response:
{
  collections: {
    customers: { count: number },
    sales: { count: number },
    products: { count: number }
  },
  indexes: {
    customer: { count: number, indexes: string[] },
    product: { count: number, indexes: string[] },
    sale: { count: number, indexes: string[] }
  },
  indexesValid: boolean
}
```

### Sales Statistics
```typescript
GET /api/database/sales-stats?period=30d

Response:
{
  period: '7d' | '30d' | '90d' | '1y',
  startDate: Date,
  endDate: Date,
  summary: {
    totalSales: number,
    totalPaid: number,
    totalRemaining: number,
    salesCount: number,
    avgSaleAmount: number,
    maxSaleAmount: number,
    minSaleAmount: number
  },
  statusBreakdown: {
    paid: { count: number, totalAmount: number },
    partial: { count: number, totalAmount: number },
    pending: { count: number, totalAmount: number }
  },
  topCustomers: Array<{
    customerName: string,
    totalSpent: number,
    purchaseCount: number
  }>,
  salesByDay: Array<{
    date: string,
    totalAmount: number,
    salesCount: number
  }>
}
```

## 🚀 التشغيل

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## ✅ Validation & Testing

### Check Database Health
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/database/health
```

### Check Sales Statistics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/database/sales-stats?period=30d"
```

## 📝 Notes

1. **Indexes:** يتم إنشاء جميع الـ indexes تلقائياً عند بدء التطبيق
2. **Status Calculation:** حالة البيع (status) يتم حسابها تلقائياً في `pre-save` hook
3. **Customer Stats:** إحصائيات الزبون (totalPurchases, totalSpent) يتم تحديثها عند كل عملية بيع
4. **Serial Numbers:** الأرقام التسلسلية فريدة على مستوى المنتجات

## 🌍 الترجمة

النظام يدعم العربية والإنجليزية بالكامل:
- واجهة المستخدم
- الرسائل
- التنبيهات
- التقارير

## 🎨 التصميم

- Dark theme with red accents (#dc2626)
- Glass morphism effects
- Smooth animations
- Responsive design
- RTL support for Arabic

---

Made with ❤️ for Al-Masdar Security
