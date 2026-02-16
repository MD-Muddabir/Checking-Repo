{/* <a
  href={`http://localhost:5000/api/invoice/download/${invoiceName}`}
  target="_blank"
>
  Download Invoice
</a> */}


// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Card, Row, Col, Statistic, Button, message, Spin } from "antd";
// import {
//   UserOutlined,
//   TeamOutlined,
//   BookOutlined,
//   DollarCircleOutlined,
//   CalendarOutlined,
//   NotificationOutlined,
//   ArrowRightOutlined,
//   PlusOutlined
// } from "@ant-design/icons";
// import { api } from "../../api/axios";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalFaculty: 0,
//     totalClasses: 0,
//     totalSubjects: 0,
//     totalRevenue: 0,
//     upcomingExams: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch all data in parallel
//       const [studentsRes, facultyRes, classesRes, subjectsRes, paymentsRes, examsRes] = await Promise.all([
//         api.get("/students"),
//         api.get("/faculty"),
//         api.get("/classes"),
//         api.get("/subjects"),
//         api.get("/payments"),
//         api.get("/exams"),
//       ]);

//       // Calculate total revenue from payments
//       const totalRevenue = paymentsRes.data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

//       // Calculate upcoming exams (within next 30 days)
//       const today = new Date();
//       const upcomingExams = examsRes.data.filter(exam => {
//         const examDate = new Date(exam.exam_date);
//         const diffTime = examDate - today;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         return diffDays >= 0 && diffDays <= 30;
//       }).length;

//       setStats({
//         totalStudents: studentsRes.data.length,
//         totalFaculty: facultyRes.data.length,
//         totalClasses: classesRes.data.length,
//         totalSubjects: subjectsRes.data.length,
//         totalRevenue: totalRevenue,
//         upcomingExams: upcomingExams,
//       });
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       message.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const dashboardCards = [
//     {
//       title: "Total Students",
//       value: stats.totalStudents,
//       icon: <UserOutlined />,
//       color: "#1890ff",
//       link: "/admin/students",
//       description: "View all students",
//     },
//     {
//       title: "Total Faculty",
//       value: stats.totalFaculty,
//       icon: <TeamOutlined />,
//       color: "#52c41a",
//       link: "/admin/faculty",
//       description: "View all faculty",
//     },
//     {
//       title: "Total Classes",
//       value: stats.totalClasses,
//       icon: <BookOutlined />,
//       color: "#fa8c16",
//       link: "/admin/classes",
//       description: "View all classes",
//     },
//     {
//       title: "Total Subjects",
//       value: stats.totalSubjects,
//       icon: <BookOutlined />,
//       color: "#7cb305",
//       link: "/admin/subjects",
//       description: "View all subjects",
//     },
//     {
//       title: "Total Revenue",
//       value: `₹${stats.totalRevenue.toLocaleString()}`,
//       icon: <DollarCircleOutlined />,
//       color: "#13c2c2",
//       link: "/admin/payments",
//       description: "View all payments",
//     },
//     {
//       title: "Upcoming Exams",
//       value: stats.upcomingExams,
//       icon: <CalendarOutlined />,
//       color: "#eb2f96",
//       link: "/admin/exams",
//       description: "View upcoming exams",
//     },
//   ];

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "24px" }}>
//       <div style={{ marginBottom: "24px" }}>
//         <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1890ff" }}>
//           Admin Dashboard
//         </h1>
//         <p style={{ fontSize: "16px", color: "#595959" }}>
//           Welcome back, {localStorage.getItem("user_name")}!
//         </p>
//       </div>

//       {/* Quick Actions */}
//       <div style={{ marginBottom: "32px" }}>
//         <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
//           Quick Actions
//         </h2>
//         <Row gutter={16}>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/students/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#e6f7ff",
//                     color: "#1890ff",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Student
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Register new student
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/faculty/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#f6ffed",
//                     color: "#52c41a",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Faculty
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Register new faculty
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/classes/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#fff7e6",
//                     color: "#fa8c16",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Class
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Create new class
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/subjects/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#f0f2f5",
//                     color: "#7cb305",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Subject
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Create new subject
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/payments/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#e8f6f6",
//                     color: "#13c2c2",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Payment
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Record new payment
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//           <Col xs={24} sm={12} md={8} lg={6}>
//             <Link to="/admin/exams/add">
//               <Card hoverable>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                   <div style={{
//                     backgroundColor: "#ffe6f2",
//                     color: "#eb2f96",
//                     padding: "12px",
//                     borderRadius: "8px"
//                   }}>
//                     <PlusOutlined style={{ fontSize: "24px" }} />
//                   </div>
//                   <div>
//                     <div style={{ fontSize: "16px", fontWeight: "bold" }}>
//                       Add Exam
//                     </div>
//                     <div style={{ color: "#595959" }}>
//                       Schedule new exam
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Link>
//           </Col>
//         </Row>
//       </div>

//       {/* Dashboard Cards */}
//       <div style={{ marginBottom: "32px" }}>
//         <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
//           Overview
//         </h2>
//         <Row gutter={16}>
//           {dashboardCards.map((card, index) => (
//             <Col key={index} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: "16px" }}>
//               <Link to={card.link}>
//                 <Card hoverable>
//                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                     <div>
//                       <div style={{ fontSize: "14px", color: "#595959", marginBottom: "8px" }}>
//                         {card.title}
//                       </div>
//                       <div style={{ fontSize: "28px", fontWeight: "bold", color: card.color }}>
//                         {card.value}
//                       </div>
//                       <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "8px" }}>
//                         {card.description}
//                       </div>
//                     </div>
//                     <div style={{
//                       backgroundColor: `${card.color}15`,
//                       color: card.color,
//                       padding: "16px",
//                       borderRadius: "12px"
//                     }}>
//                       {React.cloneElement(card.icon, { style: { fontSize: "28px" } })}
//                     </div>
//                   </div>
//                 </Card>
//               </Link>
//             </Col>
//           ))}
//         </Row>
//       </div>

//       {/* Recent Activity */}
//       <Row gutter={24}>
//         <Col xs={24} md={12}>
//           <Card title="Recent Students" extra={<Link to="/admin/students">View All</Link>}>
//             <div style={{ maxHeight: "300px", overflowY: "auto" }}>
//               {stats.totalStudents > 0 ? (
//                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//                   {Array.from({ length: Math.min(stats.totalStudents, 5) }).map((_, index) => (
//                     <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
//                       <div style={{
//                         backgroundColor: "#1890ff",
//                         color: "white",
//                         width: "40px",
//                         height: "40px",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontWeight: "bold"
//                       }}>
//                         {`S${index + 1}`}
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: "bold" }}>
//                           Student {index + 1}
//                         </div>
//                         <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
//                           Enrolled on {new Date().toLocaleDateString()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ textAlign: "center", padding: "20px", color: "#8c8c8c" }}>
//                   No students enrolled yet
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//         <Col xs={24} md={12}>
//           <Card title="Recent Payments" extra={<Link to="/admin/payments">View All</Link>}>
//             <div style={{ maxHeight: "300px", overflowY: "auto" }}>
//               {stats.totalRevenue > 0 ? (
//                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//                   {Array.from({ length: Math.min(5, 5) }).map((_, index) => (
//                     <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
//                       <div style={{
//                         backgroundColor: "#13c2c2",
//                         color: "white",
//                         width: "40px",
//                         height: "40px",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontWeight: "bold"
//                       }}>
//                         <DollarCircleOutlined />
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: "bold" }}>
//                           Payment {index + 1}
//                         </div>
//                         <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
//                           ₹{1000 * (index + 1)}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ textAlign: "center", padding: "20px", color: "#8c8c8c" }}>
//                   No payments recorded yet
//                 </div>
//               )}
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default AdminDashboard;