
Student SaaS Platform
Finance & Expenses Module
Complete Professional Implementation Guide
Faculty Salary  │  Student Fees  │  Revenue  │  Profit & Loss  │  Analytics
Node.js + Express	MySQL + Sequelize	React + Vite	Recharts / Chart.js

Version 1.0  │  April 2026  │  Confidential

 
1.  Module Overview & Architecture
The Finance & Expenses module is the most sensitive module in your Student SaaS platform. It handles real money — student fee collections, faculty salaries, institute expenses, and your SaaS revenue. This document provides a complete, production-grade implementation blueprint covering database design, backend API, frontend UI, graphs, validations, role-based access, and edge cases.

1.1  What This Module Covers
#	Feature Area	Who Manages	Description
1	Student Fees Collection	Admin / Manager	Collect tuition, partial payments, track dues
2	Fees Structure	Admin	Define fee plans per class / course
3	Faculty Salary	Admin / Manager	Monthly salary disbursement, advances, deductions
4	Expenses Tracking	Admin / Manager	Record institute operational expenses
5	Transport Fees	Admin / Manager	Bus route fees assigned to students
6	Revenue Dashboard	Admin only	Total income from fees and subscriptions
7	Profit & Loss Statement	Admin only	Revenue minus all expenses = net profit/loss
8	Analytics & Graphs	Admin / Manager (limited)	Bar, Line, Pie charts for financial trends
9	Invoice & Receipt	Admin / Manager	Auto-generate payment receipts for students
10	Defaulter Reports	Admin	Students with pending or overdue fees

1.2  Role-Based Access Control for Finance
Critical Security Rule
Manager can: Collect fees, record expenses, view transport, view attendance reports.
Manager CANNOT: See total revenue, profit/loss, salary totals, institute income summary.
Admin can: See everything including revenue, P&L, salary reports, financial analytics.
Super Admin can: See cross-institute revenue for their SaaS platform only.

Every finance API endpoint must check role before returning sensitive financial data.

 
2.  Database Design — All Tables
2.1  fees_structures Table
Defines the fee plan for each class. One structure can apply to multiple students.
CREATE TABLE fees_structures (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  institute_id    INT          NOT NULL,
  class_id        INT          NOT NULL,
  name            VARCHAR(150) NOT NULL,   -- e.g. 'Annual Tuition Fee 2026'
  total_amount    DECIMAL(12,2) NOT NULL,
  frequency       ENUM('monthly','quarterly','half_yearly','annual','one_time') DEFAULT 'monthly',
  due_date        INT          DEFAULT 10, -- day of month (1-28)
  late_fee        DECIMAL(10,2) DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  description     TEXT,
  is_active       BOOLEAN      DEFAULT TRUE,
  created_by      INT,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)     REFERENCES classes(id)    ON DELETE CASCADE,
  INDEX idx_institute_class (institute_id, class_id)
);

2.2  student_fees Table
Tracks every fee payment or due for a student. One row per fee period per student.
CREATE TABLE student_fees (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  institute_id      INT           NOT NULL,
  student_id        INT           NOT NULL,
  fees_structure_id INT           NOT NULL,
  amount_due        DECIMAL(12,2) NOT NULL,
  amount_paid       DECIMAL(12,2) DEFAULT 0,
  discount_applied  DECIMAL(10,2) DEFAULT 0,
  late_fee_applied  DECIMAL(10,2) DEFAULT 0,
  due_date          DATE          NOT NULL,
  payment_date      DATE,
  payment_method    ENUM('cash','upi','bank_transfer','cheque','card') DEFAULT 'cash',
  transaction_ref   VARCHAR(100),  -- UPI/bank reference number
  status            ENUM('pending','partial','paid','overdue','waived') DEFAULT 'pending',
  collected_by      INT,           -- user_id of who collected
,
  month_year        VARCHAR(7),    -- '2026-04' for easy monthly grouping
  notes             TEXT,
  receipt_number    VARCHAR(50)    UNIQUE,  -- auto-generated receipt
  created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id)      REFERENCES institutes(id)      ON DELETE CASCADE,
  FOREIGN KEY (student_id)        REFERENCES students(id)        ON DELETE CASCADE,
  FOREIGN KEY (fees_structure_id) REFERENCES fees_structures(id) ON DELETE RESTRICT,
  INDEX idx_student     (student_id, status),
  INDEX idx_month       (institute_id, month_year),
  INDEX idx_due_status  (institute_id, due_date, status)
);

2.3  faculty_salaries Table
CREATE TABLE faculty_salaries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  institute_id    INT           NOT NULL,
  faculty_id      INT           NOT NULL,
  month_year      VARCHAR(7)    NOT NULL,  -- '2026-04'
  basic_salary    DECIMAL(12,2) NOT NULL,
  allowances      DECIMAL(10,2) DEFAULT 0, -- HRA, travel, etc.
  deductions      DECIMAL(10,2) DEFAULT 0, -- PF, tax, absences
  advance_paid    DECIMAL(10,2) DEFAULT 0,
  net_salary      DECIMAL(12,2) NOT NULL,  -- basic + allowances - deductions - advance
  payment_date    DATE,
  payment_method  ENUM('cash','bank_transfer','upi','cheque') DEFAULT 'bank_transfer',
  transaction_ref VARCHAR(100),
  status          ENUM('pending','paid','on_hold') DEFAULT 'pending',
  working_days    INT           DEFAULT 26,
  present_days    INT           DEFAULT 26,
  remarks         TEXT,
  paid_by         INT,           -- admin/manager user_id
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id)   REFERENCES faculty(id)    ON DELETE CASCADE,
  UNIQUE KEY uq_faculty_month (faculty_id, month_year),
  INDEX idx_month (institute_id, month_year)
);

2.4  expenses Table
CREATE TABLE expenses (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  institute_id    INT           NOT NULL,
  category        ENUM('rent','electricity','internet','maintenance','stationery',
                       'marketing','software','transport','miscellaneous','other') NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  expense_date    DATE          NOT NULL,
  payment_method  ENUM('cash','upi','bank_transfer','cheque','card') DEFAULT 'cash',
  receipt_url     VARCHAR(500),  -- uploaded receipt image/pdf
  description     TEXT,
  approved_by     INT,
  created_by      INT           NOT NULL,
  month_year      VARCHAR(7),    -- computed: '2026-04'
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
  INDEX idx_month    (institute_id, month_year),
  INDEX idx_category (institute_id, category)
);

2.5  transport_fees Table
CREATE TABLE transport_fees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  institute_id  INT           NOT NULL,
  route_name    VARCHAR(150)  NOT NULL,  -- 'Route A - Hitech City'
  pickup_point  VARCHAR(200),
  monthly_fee   DECIMAL(10,2) NOT NULL,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Link students to transport routes
CREATE TABLE student_transport (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  institute_id    INT NOT NULL,
  student_id      INT NOT NULL,
  transport_fee_id INT NOT NULL,
  start_date      DATE,
  end_date        DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  UNIQUE KEY uq_student (student_id)
);

 
3.  Backend Implementation — Phase by Phase
Phase 1	Install Dependencies & Setup Models
Add required packages and Sequelize models

Run inside your backend folder:
npm install pdfkit uuid date-fns
# pdfkit   = generate PDF receipts
# uuid      = auto-generate receipt numbers
# date-fns  = date formatting and calculations

Add models to backend/models/index.js
const FeesStructure   = require('./feesStructure');
const StudentFee      = require('./studentFee');
const FacultySalary   = require('./facultySalary');
const Expense         = require('./expense');
const TransportFee    = require('./transportFee');
const StudentTransport= require('./studentTransport');

// Associations
FeesStructure.hasMany(StudentFee,    { foreignKey: 'fees_structure_id' });
StudentFee.belongsTo(FeesStructure,  { foreignKey: 'fees_structure_id' });
Student.hasMany(StudentFee,          { foreignKey: 'student_id' });
StudentFee.belongsTo(Student,        { foreignKey: 'student_id' });
Faculty.hasMany(FacultySalary,       { foreignKey: 'faculty_id' });
FacultySalary.belongsTo(Faculty,     { foreignKey: 'faculty_id' });
TransportFee.hasMany(StudentTransport, { foreignKey: 'transport_fee_id' });
Student.hasOne(StudentTransport,     { foreignKey: 'student_id' });

Phase 2	Fees Structure API
CRUD for fee plans — admin only

backend/controllers/feesStructure.controller.js
exports.create = async (req, res) => {
  try {
    const { class_id, name, total_amount, frequency,
            due_date, late_fee, discount, description } = req.body;
    const institute_id = req.user.institute_id;

    // Validation
    if (!class_id || !name || !total_amount)
      return res.status(400).json({ success:false, message:'class_id, name and total_amount are required' });
    if (total_amount <= 0)
      return res.status(400).json({ success:false, message:'Amount must be greater than 0' });
    if (due_date && (due_date < 1 || due_date > 28))
      return res.status(400).json({ success:false, message:'Due date must be between 1 and 28' });

    const structure = await FeesStructure.create({
      institute_id, class_id, name, total_amount, frequency,
      due_date: due_date || 10, late_fee: late_fee || 0,
      discount: discount || 0, description, created_by: req.user.id
    });

    res.status(201).json({ success:true, message:'Fees structure created', data: structure });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.getAll = async (req, res) => {
  const { class_id, is_active } = req.query;
  const where = { institute_id: req.user.institute_id };
  if (class_id)  where.class_id  = class_id;
  if (is_active !== undefined) where.is_active = is_active === 'true';

  const structures = await FeesStructure.findAll({
    where, include: [{ model: Class, attributes: ['id','name','section'] }],
    order: [['created_at','DESC']]
  });
  res.json({ success:true, data: structures });
};

backend/routes/fees.routes.js
const router = require('express').Router();
const feesCtrl   = require('../controllers/feesStructure.controller');
const studentFee = require('../controllers/studentFee.controller');
const verifyToken  = require('../middlewares/auth.middleware');
const allowRoles   = require('../middlewares/role.middleware');
const checkFeature = require('../middlewares/checkFeatureAccess');

router.use(verifyToken, checkFeature('feature_fees'));

// Fees Structure (admin only)
router.get   ('/structures',        allowRoles('admin'), feesCtrl.getAll);
router.post  ('/structures',        allowRoles('admin'), feesCtrl.create);
router.put   ('/structures/:id',    allowRoles('admin'), feesCtrl.update);
router.delete('/structures/:id',    allowRoles('admin'), feesCtrl.delete);

// Student Fees (admin + manager)
router.get ('/student/:id',         allowRoles('admin','manager'), studentFee.getByStudent);
router.post('/collect',             allowRoles('admin','manager'), studentFee.collectFee);
router.post('/generate-monthly',    allowRoles('admin'),           studentFee.generateMonthlyFees);
router.get ('/defaulters',          allowRoles('admin'),           studentFee.getDefaulters);
router.get ('/summary',             allowRoles('admin'),           studentFee.getMonthlySummary);
router.get ('/receipt/:id',         allowRoles('admin','manager'), studentFee.downloadReceipt);

module.exports = router;

Phase 3	Student Fee Collection API
Collect, partial payment, receipt generation

3.1  collectFee — Core Collection Logic
const { v4: uuidv4 } = require('uuid');

exports.collectFee = async (req, res) => {
  try {
    const { student_id, fees_structure_id, amount_paid,
            payment_method, transaction_ref, discount_applied, notes } = req.body;
    const institute_id  = req.user.institute_id;
    const collected_by  = req.user.id;

    // ── Validations ────────────────────────────────
    if (!student_id || !fees_structure_id || !amount_paid)
      return res.status(400).json({ success:false,
        message:'student_id, fees_structure_id and amount_paid are required' });

    if (amount_paid <= 0)
      return res.status(400).json({ success:false, message:'Amount must be greater than 0' });

    // Verify student belongs to institute
    const student = await Student.findOne({ where:{ id:student_id, institute_id } });
    if (!student) return res.status(404).json({ success:false, message:'Student not found' });

    // Get fee structure
    const structure = await FeesStructure.findOne({
      where:{ id:fees_structure_id, institute_id }
    });
    if (!structure) return res.status(404).json({ success:false, message:'Fee structure not found' });

    // Check for existing record this month
    const monthYear = new Date().toISOString().slice(0,7); // '2026-04'
    let existing = await StudentFee.findOne({
      where:{ student_id, fees_structure_id, month_year:monthYear }
    });

    if (existing && existing.status === 'paid')
      return res.status(409).json({ success:false, message:'Fee already paid for this period' });

    const discountAmt = discount_applied || 0;
    const amountDue   = structure.total_amount - discountAmt;

    if (amount_paid > amountDue)
      return res.status(400).json({ success:false,
        message:`Amount cannot exceed due amount of Rs.${amountDue}` });

    const totalPaid = existing ? (parseFloat(existing.amount_paid) + parseFloat(amount_paid)) : parseFloat(amount_paid);
    const newStatus = totalPaid >= amountDue ? 'paid' : 'partial';
    const receiptNo = `RCP-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    let feeRecord;
    if (existing) {
      await existing.update({ amount_paid: totalPaid, status: newStatus,
        payment_date: new Date(), payment_method, transaction_ref, notes });
      feeRecord = existing;
    } else {
      feeRecord = await StudentFee.create({
        institute_id, student_id, fees_structure_id,
        amount_due: amountDue, amount_paid: parseFloat(amount_paid),
        discount_applied: discountAmt, due_date: new Date(),
        payment_date: new Date(), payment_method, transaction_ref,
        status: newStatus, collected_by, month_year: monthYear,
        receipt_number: receiptNo, notes
      });
    }

    res.status(200).json({
      success:true,
      message: newStatus==='paid' ? 'Payment complete!' : `Partial payment recorded. Remaining: Rs.${(amountDue-totalPaid).toFixed(2)}`,
      data: feeRecord
    });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
};

3.2  generateMonthlyFees — Bulk Fee Generation
Call this API on the 1st of every month (or via cron job) to auto-create pending fee records for all students:
exports.generateMonthlyFees = async (req, res) => {
  try {
    const { month_year } = req.body; // '2026-05'
    const institute_id = req.user.institute_id;

    const structures = await FeesStructure.findAll({
      where: { institute_id, is_active: true, frequency: 'monthly' },
      include: [{ model: Student, through: { model: Class } }]
    });

    let created = 0;
    for (const structure of structures) {
      const students = await Student.findAll({
        where: { class_id: structure.class_id, institute_id }
      });
      for (const student of students) {
        const exists = await StudentFee.findOne({
          where: { student_id:student.id, fees_structure_id:structure.id, month_year }
        });
        if (!exists) {
          const dueDate = new Date(`${month_year}-${String(structure.due_date).padStart(2,'0')}`);
          await StudentFee.create({
            institute_id, student_id:student.id,
            fees_structure_id:structure.id,
            amount_due: structure.total_amount,
            due_date: dueDate, status:'pending', month_year,
            receipt_number: `RCP-${Date.now()}-${student.id}`
          });
          created++;
        }
      }
    }
    res.json({ success:true, message:`Generated ${created} fee records for ${month_year}` });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

Phase 4	Faculty Salary API
Salary creation, payment, advance tracking

backend/controllers/facultySalary.controller.js
exports.createSalary = async (req, res) => {
  try {
    const { faculty_id, month_year, basic_salary, allowances,
            deductions, advance_paid, working_days, present_days, remarks } = req.body;
    const institute_id = req.user.institute_id;

    // Validations
    if (!faculty_id || !month_year || !basic_salary)
      return res.status(400).json({ success:false,
        message:'faculty_id, month_year and basic_salary are required' });

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month_year))
      return res.status(400).json({ success:false, message:'month_year must be YYYY-MM format' });

    // Check if salary already created for this month
    const existing = await FacultySalary.findOne({ where:{ faculty_id, month_year } });
    if (existing) return res.status(409).json({ success:false,
      message:'Salary already created for this faculty this month' });

    const a = parseFloat(allowances  || 0);
    const d = parseFloat(deductions  || 0);
    const v = parseFloat(advance_paid || 0);
    const b = parseFloat(basic_salary);

    // Attendance-based salary if present_days provided
    const wDays = working_days  || 26;
    const pDays = present_days  || wDays;
    const attendanceFactor = pDays / wDays;
    const earnedSalary = b * attendanceFactor;
    const netSalary    = (earnedSalary + a - d - v).toFixed(2);

    if (netSalary < 0) return res.status(400).json({ success:false,
      message:'Deductions exceed salary. Please review values.' });

    const salary = await FacultySalary.create({
      institute_id, faculty_id, month_year,
      basic_salary: b, allowances:a, deductions:d, advance_paid:v,
      net_salary: netSalary, working_days:wDays, present_days:pDays,
      status:'pending', created_by: req.user.id, remarks
    });

    res.status(201).json({ success:true, message:'Salary record created', data:salary });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.paySalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, transaction_ref } = req.body;
    const salary = await FacultySalary.findOne({
      where:{ id, institute_id: req.user.institute_id }
    });
    if (!salary) return res.status(404).json({ success:false, message:'Salary record not found' });
    if (salary.status === 'paid')
      return res.status(409).json({ success:false, message:'Salary already paid' });

    await salary.update({
      status:'paid', payment_date: new Date(),
      payment_method, transaction_ref, paid_by: req.user.id
    });
    res.json({ success:true, message:'Salary marked as paid', data:salary });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

Phase 5	Revenue, Profit & Loss API
Financial analytics — admin only

This is the most sensitive section. Always verify role === 'admin' before returning data.
// backend/controllers/finance.analytics.controller.js

exports.getRevenueSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Access denied' });

    const institute_id = req.user.institute_id;
    const { month_year, year } = req.query;

    // ── Total Revenue (Fees Collected) ──────────────
    const feeWhere = { institute_id, status: ['paid','partial'] };
    if (month_year) feeWhere.month_year = month_year;

    const totalRevenue = await StudentFee.sum('amount_paid', { where: feeWhere }) || 0;

    // ── Total Expenses ──────────────────────────────
    const expWhere = { institute_id };
    if (month_year) expWhere.month_year = month_year;
    const totalExpenses = await Expense.sum('amount', { where: expWhere }) || 0;

    // ── Total Salaries Paid ─────────────────────────
    const salWhere = { institute_id, status: 'paid' };
    if (month_year) salWhere.month_year = month_year;
    const totalSalaries = await FacultySalary.sum('net_salary', { where: salWhere }) || 0;

    // ── Pending Fees ────────────────────────────────
    const pendingFees = await StudentFee.sum('amount_due', {
      where: { institute_id, status: ['pending','partial','overdue'] }
    }) || 0;
    const pendingPaid = await StudentFee.sum('amount_paid', {
      where: { institute_id, status: ['pending','partial','overdue'] }
    }) || 0;
    const netPending = pendingFees - pendingPaid;

    // ── P&L Calculation ─────────────────────────────
    const totalCosts   = totalExpenses + totalSalaries;
    const netProfitLoss = totalRevenue - totalCosts;

    res.json({
      success: true,
      data: {
        revenue:    { total: totalRevenue,    label: 'Total Fees Collected' },
        expenses:   { total: totalExpenses,   label: 'Operational Expenses' },
        salaries:   { total: totalSalaries,   label: 'Faculty Salaries Paid' },
        total_costs:{ total: totalCosts,      label: 'Total Costs' },
        profit_loss:{ amount: netProfitLoss,  is_profit: netProfitLoss >= 0 },
        pending:    { total: netPending,      label: 'Pending Fee Collections' },
      }
    });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

// Monthly trend data for charts
exports.getMonthlyTrend = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Access denied' });

    const institute_id = req.user.institute_id;
    const { Op, fn, col } = require('sequelize');

    // Last 12 months
    const months = [];
    for(let i=11; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0,7));
    }

    const revenueByMonth = await StudentFee.findAll({
      attributes: ['month_year', [fn('SUM', col('amount_paid')), 'total']],
      where: { institute_id, month_year: { [Op.in]: months }, status: ['paid','partial'] },
      group: ['month_year'], order: [['month_year','ASC']],
      raw: true
    });

    const expenseByMonth = await Expense.findAll({
      attributes: ['month_year', [fn('SUM', col('amount')), 'total']],
      where: { institute_id, month_year: { [Op.in]: months } },
      group: ['month_year'], order: [['month_year','ASC']],
      raw: true
    });

    res.json({ success:true, data:{ months, revenue: revenueByMonth, expenses: expenseByMonth } });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

Finance Analytics Routes
// backend/routes/finance.routes.js
const analytics = require('../controllers/finance.analytics.controller');

router.get('/revenue/summary',      allowRoles('admin'), analytics.getRevenueSummary);
router.get('/revenue/monthly-trend',allowRoles('admin'), analytics.getMonthlyTrend);
router.get('/expenses/summary',     allowRoles('admin'), analytics.getExpenseSummary);
router.get('/salary/monthly',       allowRoles('admin'), analytics.getSalaryReport);
router.get('/defaulters',           allowRoles('admin'), analytics.getDefaulterList);
router.get('/expense-by-category',  allowRoles('admin'), analytics.getExpenseByCategory);

 
4.  Frontend Implementation
Phase 6	Install Chart Libraries
Recharts for graphs

cd frontend
npm install recharts
# Recharts is the best choice for React — no extra config, works with Vite

Phase 7	Finance Dashboard Page
Main finance overview with all KPI cards

Create frontend/src/pages/admin/Finance.jsx — the main finance overview page. This page has four sections: KPI summary cards, charts row, fees table, and expenses table.
7.1  KPI Summary Cards
// Finance.jsx — KPI cards section
const [summary, setSummary] = useState(null);

useEffect(() => {
  api.get('/finance/revenue/summary').then(r => setSummary(r.data.data));
}, []);

// Render 5 KPI cards in a grid
{summary && (
  <div className='finance-kpi-grid'>
    <KpiCard icon='rupee' label='Total Revenue'
      value={summary.revenue.total} color='green' />
    <KpiCard icon='chart-down' label='Total Expenses'
      value={summary.expenses.total} color='red' />
    <KpiCard icon='users' label='Salaries Paid'
      value={summary.salaries.total} color='blue' />
    <KpiCard icon='alert' label='Pending Fees'
      value={summary.pending.total} color='orange' />
    <KpiCard
      label={summary.profit_loss.is_profit ? 'Net Profit' : 'Net Loss'}
      value={Math.abs(summary.profit_loss.amount)}
      color={summary.profit_loss.is_profit ? 'green' : 'red'}
      icon={summary.profit_loss.is_profit ? 'trending-up' : 'trending-down'} />
  </div>
)}

7.2  KPI Card Component
// components/KpiCard.jsx
const KpiCard = ({ label, value, color, icon }) => {
  const colorMap = {
    green:  { bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0' },
    red:    { bg:'#FEF2F2', text:'#DC2626', border:'#FECACA' },
    blue:   { bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE' },
    orange: { bg:'#FFFBEB', text:'#D97706', border:'#FDE68A' },
    purple: { bg:'#F5F3FF', text:'#7C3AED', border:'#DDD6FE' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`,
         borderRadius:12, padding:'20px 24px' }}>
      <p style={{ color:'#6B7280', fontSize:13, margin:0 }}>{label}</p>
      <h2 style={{ color:c.text, margin:'8px 0 0', fontSize:28, fontWeight:700 }}>
        {formatRupee(value)}
      </h2>
    </div>
  );
};

const formatRupee = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}`;

Phase 8	Charts & Graphs
6 professional graphs using Recharts

#	Chart Name	Chart Type	Data Source
1	Monthly Revenue vs Expenses	Bar Chart (grouped)	/finance/revenue/monthly-trend
2	Revenue Trend Line	Line Chart	/finance/revenue/monthly-trend
3	Expense Breakdown	Pie Chart	/finance/expense-by-category
4	Fee Collection Rate	Donut / Radial Bar	/finance/revenue/summary (paid vs pending)
5	Faculty Salary Overview	Horizontal Bar	/finance/salary/monthly
6	Profit vs Loss Monthly	Area Chart	/finance/revenue/monthly-trend (derived)

Chart 1 — Monthly Revenue vs Expenses (Bar Chart)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
         Legend, ResponsiveContainer } from 'recharts';

const RevenueVsExpensesChart = ({ data }) => {
  // data: [{ month:'Apr 2026', revenue:150000, expenses:42000 }, ...]
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:24,
         boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:24 }}>
      <h3 style={{ margin:'0 0 16px', color:'#1E3A5F' }}>Revenue vs Expenses</h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data} margin={{ top:5, right:20, left:20, bottom:5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#F1F5F9' />
          <XAxis dataKey='month' tick={{ fontSize:12 }} />
          <YAxis tickFormatter={v => `Rs.${(v/1000).toFixed(0)}K`} tick={{ fontSize:12 }} />
          <Tooltip formatter={(v, n) => [`Rs. ${v.toLocaleString('en-IN')}`, n]} />
          <Legend />
          <Bar dataKey='revenue'  fill='#16A34A' radius={[4,4,0,0]} name='Revenue' />
          <Bar dataKey='expenses' fill='#DC2626' radius={[4,4,0,0]} name='Expenses' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

Chart 2 — Expense Breakdown (Pie Chart)
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563EB','#16A34A','#DC2626','#D97706','#7C3AED','#0D9488'];

const ExpensePieChart = ({ data }) => {
  // data: [{ category:'Rent', amount:25000 }, ...]
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:24,
         boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin:'0 0 16px', color:'#1E3A5F' }}>Expense Breakdown</h3>
      <ResponsiveContainer width='100%' height={280}>
        <PieChart>
          <Pie data={data} cx='50%' cy='50%' outerRadius={90}
            dataKey='amount' nameKey='category' label={({category,percent})=>
              `${category} ${(percent*100).toFixed(0)}%`}>
            {data.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={v=>[`Rs. ${v.toLocaleString('en-IN')}`, 'Amount']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

Chart 3 — Fee Collection Rate (Donut Chart)
const FeeCollectionDonut = ({ paid, pending }) => {
  const data = [
    { name:'Collected', value: paid,    fill:'#16A34A' },
    { name:'Pending',   value: pending,  fill:'#DC2626' },
  ];
  const total = paid + pending;
  const pct   = total > 0 ? ((paid/total)*100).toFixed(1) : 0;

  return (
    <div style={{ position:'relative', background:'#fff', borderRadius:12, padding:24 }}>
      <h3 style={{ margin:'0 0 16px', color:'#1E3A5F' }}>Collection Rate</h3>
      <ResponsiveContainer width='100%' height={240}>
        <PieChart>
          <Pie data={data} cx='50%' cy='50%' innerRadius={60}
            outerRadius={90} dataKey='value' paddingAngle={3}>
            {data.map((d,i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip formatter={v=>[`Rs. ${v.toLocaleString('en-IN')}`]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position:'absolute', top:'50%', left:'50%',
           transform:'translate(-50%,-20%)', textAlign:'center' }}>
        <div style={{ fontSize:24, fontWeight:700, color:'#16A34A' }}>{pct}%</div>
        <div style={{ fontSize:12, color:'#6B7280' }}>Collected</div>
      </div>
    </div>
  );
};

Chart 4 — Profit vs Loss Area Chart
import { AreaChart, Area, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer } from 'recharts';

const ProfitLossChart = ({ data }) => {
  // data: [{ month:'Apr', profit:85000 }, { month:'May', profit:-12000 }]
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:24,
         boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin:'0 0 16px', color:'#1E3A5F' }}>Monthly Profit / Loss</h3>
      <ResponsiveContainer width='100%' height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id='profitGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#16A34A' stopOpacity={0.3}/>
              <stop offset='95%' stopColor='#16A34A' stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#F1F5F9' />
          <XAxis dataKey='month' />
          <YAxis tickFormatter={v=>`Rs.${(v/1000).toFixed(0)}K`} />
          <Tooltip formatter={v=>[`Rs.${v.toLocaleString('en-IN')}`, v>=0?'Profit':'Loss']} />
          <Area type='monotone' dataKey='profit' stroke='#16A34A'
            fill='url(#profitGrad)' strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

 
Phase 9	Fee Collection UI
Search student, collect fees, show history

// FeeCollection.jsx — key UI parts
const [searchTerm, setSearchTerm]   = useState('');
const [student, setStudent]         = useState(null);
const [feeHistory, setFeeHistory]   = useState([]);
const [selectedStructure, setSelectedStructure] = useState('');
const [amountPaid, setAmountPaid]   = useState('');
const [paymentMethod, setPayMethod] = useState('cash');

// Search student
const searchStudent = async () => {
  const res = await api.get(`/students?search=${searchTerm}`);
  // show dropdown of matching students
};

// Load student fee details
const loadStudentFees = async (studentId) => {
  const res = await api.get(`/fees/student/${studentId}`);
  setStudent(res.data.data.student);
  setFeeHistory(res.data.data.fees);
};

// Submit collection
const handleCollect = async () => {
  if (!selectedStructure || !amountPaid)
    return alert('Please select fee type and enter amount');

  if (parseFloat(amountPaid) <= 0)
    return alert('Amount must be greater than 0');

  const res = await api.post('/fees/collect', {
    student_id:       student.id,
    fees_structure_id: selectedStructure,
    amount_paid:       parseFloat(amountPaid),
    payment_method:    paymentMethod,
  });
  alert(res.data.message);
  loadStudentFees(student.id); // reload history
};

Phase 10	Faculty Salary UI
Monthly salary management screen

// FacultySalary.jsx
// Shows a table of all faculty with current month salary status

const SalaryStatusBadge = ({ status }) => {
  const map = {
    paid:    { bg:'#F0FDF4', color:'#16A34A', label:'Paid' },
    pending: { bg:'#FFFBEB', color:'#D97706', label:'Pending' },
    on_hold: { bg:'#FEF2F2', color:'#DC2626', label:'On Hold' },
  };
  const s = map[status] || map.pending;
  return <span style={{ background:s.bg, color:s.color,
    padding:'3px 10px', borderRadius:20, fontSize:12 }}>{s.label}</span>;
};

// Salary creation form fields:
// basic_salary (required), allowances, deductions, advance_paid
// working_days (default 26), present_days
// Auto-calculates net_salary = basic * (present/working) + allowances - deductions - advance

const calculateNet = () => {
  const earned = basic * (presentDays / workingDays);
  return Math.max(0, earned + allowances - deductions - advance).toFixed(2);
};

Phase 11	Expenses UI
Add expense, category filter, monthly summary

// Expenses.jsx — expense categories
const EXPENSE_CATEGORIES = [
  { value:'rent',         label:'Rent' },
  { value:'electricity',  label:'Electricity' },
  { value:'internet',     label:'Internet / WiFi' },
  { value:'maintenance',  label:'Maintenance' },
  { value:'stationery',   label:'Stationery / Supplies' },
  { value:'marketing',    label:'Marketing / Ads' },
  { value:'software',     label:'Software / Subscriptions' },
  { value:'transport',    label:'Transport' },
  { value:'miscellaneous',label:'Miscellaneous' },
  { value:'other',        label:'Other' },
];

// Expense form validations (frontend)
const validateExpense = (form) => {
  if (!form.category)    return 'Please select a category';
  if (!form.title.trim())return 'Title is required';
  if (!form.amount || parseFloat(form.amount) <= 0)
                         return 'Amount must be greater than 0';
  if (!form.expense_date)return 'Expense date is required';
  const expDate = new Date(form.expense_date);
  if (expDate > new Date()) return 'Expense date cannot be in the future';
  return null; // valid
};

 
5.  Complete Validations — All Modules
5.1  Student Fee Validations
#	Validation Rule	Where Checked	Error Message
1	student_id, fees_structure_id, amount_paid required	Backend controller	Field X is required
2	amount_paid must be > 0	Backend + Frontend	Amount must be > 0
3	amount_paid cannot exceed amount_due	Backend	Amount exceeds due of Rs.X
4	Fee already paid for this period — block duplicate	Backend	Fee already paid for this period
5	Student must belong to same institute	Backend	Student not found
6	Discount cannot exceed total fee amount	Backend	Discount exceeds fee amount
7	payment_method must be valid enum value	Backend	Invalid payment method
8	Transaction ref required for UPI/bank transfer	Frontend	Please enter transaction reference

5.2  Faculty Salary Validations
#	Validation Rule	Where	Error Message
1	faculty_id, month_year, basic_salary required	Backend	Required fields missing
2	month_year must be YYYY-MM format	Backend regex	Invalid month format
3	Salary already exists for this faculty + month — block	Backend	Salary already created
4	net_salary cannot be negative	Backend calculation	Deductions exceed salary
5	present_days cannot exceed working_days	Backend	Present days exceed working days
6	basic_salary must be > 0	Backend + Frontend	Salary must be > 0
7	Cannot pay salary already marked paid	Backend	Salary already paid

5.3  Expenses Validations
#	Validation Rule	Where	Error
1	category, title, amount, expense_date required	Both	Field required
2	amount must be > 0	Both	Amount must be > 0
3	expense_date cannot be future date	Frontend	Cannot add future expense
4	category must be valid ENUM value	Backend	Invalid category
5	receipt upload: max 5MB, only image/pdf allowed	Frontend	File too large or invalid format
6	Manager cannot see total expenses summary (finance P&L)	Backend role check	Access denied

 
6.  Plan-Based Feature Control
Add these columns to your plans table to control which finance features are available per subscription plan:
ALTER TABLE plans
  ADD COLUMN feature_fees          BOOLEAN DEFAULT FALSE,
  ADD COLUMN feature_salary         BOOLEAN DEFAULT FALSE,
  ADD COLUMN feature_expenses       BOOLEAN DEFAULT FALSE,
  ADD COLUMN feature_finance_reports BOOLEAN DEFAULT FALSE,
  ADD COLUMN feature_transport_fees  BOOLEAN DEFAULT FALSE;

Feature	Basic Plan	Pro Plan	Enterprise
Student Fee Collection	Yes	Yes	Yes
Fees Structure Management	Basic only	Yes	Yes + Bulk
Faculty Salary	No	Yes	Yes + Advance
Expenses Tracking	No	Yes	Yes + Receipt
Revenue Dashboard	No	Yes	Yes + Export
Profit & Loss Reports	No	No	Yes
Finance Graphs & Analytics	No	Basic charts	All 6 charts
Transport Fees	No	Yes	Yes
Invoice / Receipt PDF	No	Yes	Yes + Branding

 
7.  Edge Cases & How to Handle Them
#	Edge Case	Correct Handling
1	Student drops course mid-month — fee already paid	Do NOT auto-refund. Admin manually marks a refund entry as a negative expense.
2	Faculty joins mid-month — partial salary	Use present_days field. Net = basic*(present/working). System auto-calculates pro-rata.
3	Discount applied after fee already partially paid	Discount applies to original amount_due. Update the record. System recalculates remaining.
4	Duplicate fee payment attempt (double click)	Backend checks existing paid record and returns 409 Conflict. Frontend disables submit button after first click.
5	Revenue month filter returns empty data	Return zero values not empty array. Frontend always shows chart with Rs. 0 data points.
6	Salary deductions exceed basic salary	Backend blocks with 400 error. Frontend shows live calculation preview so admin sees net before saving.
7	Same expense accidentally submitted twice	No auto-dedup — expenses can legitimately repeat. Admin must delete manually. Add delete with soft-delete.
8	Fee structure deleted after students assigned	Use ON DELETE RESTRICT. Block deletion if student_fees records exist. Show warning: 'X records exist'.
9	Manager sees Profit & Loss accidentally	Backend checks role on every finance analytics endpoint. Never trust frontend-only role hiding.
10	Chart shows zero for all months	Show empty state graphic with message: 'No financial data for this period'. Do not show broken chart.
11	Student transport fee + tuition fee — collect both	Transport fee is a separate StudentFee record with its own fees_structure_id. Collect independently.
12	Late fee auto-apply for overdue students	Run a cron job daily. Check StudentFee where status='pending' AND due_date < today. Add late_fee_applied.

 
8.  Complete API Routes Reference
Method	Module	Endpoint	Access	Purpose
GET	Fees	/api/fees/structures	Admin	List all fee structures
POST	Fees	/api/fees/structures	Admin	Create fee structure
PUT	Fees	/api/fees/structures/:id	Admin	Update fee structure
DELETE	Fees	/api/fees/structures/:id	Admin	Soft delete structure
GET	Fees	/api/fees/student/:id	Admin/Manager	Student fee history
POST	Fees	/api/fees/collect	Admin/Manager	Collect payment
POST	Fees	/api/fees/generate-monthly	Admin	Bulk generate fees
GET	Fees	/api/fees/defaulters	Admin	Overdue students list
GET	Fees	/api/fees/receipt/:id	Admin/Manager	Download PDF receipt
GET	Salary	/api/salary	Admin	List salary records
POST	Salary	/api/salary	Admin	Create salary record
PUT	Salary	/api/salary/:id/pay	Admin	Mark salary as paid
GET	Expense	/api/expenses	Admin/Manager	List expenses
POST	Expense	/api/expenses	Admin/Manager	Add expense
DELETE	Expense	/api/expenses/:id	Admin	Soft delete expense
GET	Analytics	/api/finance/revenue/summary	Admin ONLY	P&L summary
GET	Analytics	/api/finance/revenue/monthly-trend	Admin ONLY	12-month chart data
GET	Analytics	/api/finance/expense-by-category	Admin ONLY	Pie chart data

 
9.  Implementation Checklist
Phase	Area	Task	Priority
1	Database	Create all 5 new tables (fees_structures, student_fees, faculty_salaries, expenses, transport_fees)	Critical — Do First
1	Database	ALTER plans table to add feature_ columns	Critical
2	Backend	Create Sequelize models for all 5 tables with associations	Critical
2	Backend	Install pdfkit, uuid, date-fns packages	Required
3	Backend	Build feesStructure.controller.js (CRUD)	High
3	Backend	Build studentFee.controller.js (collectFee, generateMonthly, defaulters)	High
4	Backend	Build facultySalary.controller.js (create, pay, monthly report)	High
4	Backend	Build expense.controller.js (CRUD with category filter)	High
5	Backend	Build finance.analytics.controller.js (revenue, P&L, trend data)	Critical — Admin only
5	Backend	Add all routes to fees.routes.js, salary.routes.js, finance.routes.js	Required
6	Frontend	npm install recharts in frontend	Required
7	Frontend	Build Finance.jsx dashboard with 5 KPI cards	High
8	Frontend	Build all 6 chart components (Bar, Pie, Area, Donut, Line, Horizontal Bar)	High
9	Frontend	Build FeeCollection.jsx (search student, collect, show history)	High
10	Frontend	Build FacultySalary.jsx (create, pay, filter by month)	High
11	Frontend	Build Expenses.jsx (add, filter by category/month)	High
12	Frontend	Add routes in App.jsx for all new finance pages	Required
13	Security	Verify all analytics routes block Manager role — test with manager login	Critical
14	Security	Add checkFeatureAccess middleware to all finance routes	Critical
15	Testing	Test all edge cases from Section 7 — especially duplicate payments and role blocking	Required

Important Tip — Manager vs Admin
The single most important rule in this entire module: NEVER show Profit/Loss, Revenue Total,
or Salary Reports to the Manager role. These numbers reveal how much the institute earns.
Institutes hire managers specifically because they do NOT want staff to know full financials.
Backend role check on every /finance/revenue/* and /finance/salary/* endpoint is mandatory.
Frontend hiding alone is NOT enough — a manager can still call the API directly.

