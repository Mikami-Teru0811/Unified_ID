import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthProvider"

// Lazy load all route components for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"))
const DoctorLayout = lazy(() => import("./layouts/DoctorLayout"))
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard"))
const PatientHistory = lazy(() => import("./pages/doctor/PatientHistory"))
const MedicalShopLayout = lazy(() => import("./layouts/MedicalShopLayout"))
const MedicalShopDashboard = lazy(() => import("./pages/medicalShop/Dashboard"))
const PrescriptionViewer = lazy(() => import("./pages/medicalShop/PrescriptionViewer"))
const ClinicalNote = lazy(() => import("./pages/hospital/ClinicalNote"))
const PatientRoutes = lazy(() => import("./routes/PatientRoutes"))
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"))
const HospitalLayout = lazy(() => import("./layouts/HospitalLayout"))
const HospitalDashboard = lazy(() => import("./pages/hospital/Dashboard"))
const RegisterPatient = lazy(() => import("./pages/hospital/register/RegisterPatient"))
const Step1Personal = lazy(() => import("./pages/hospital/register/Step1Personal"))
const Step2Contact = lazy(() => import("./pages/hospital/register/Step2Contact"))
const Step3Medical = lazy(() => import("./pages/hospital/register/Step3Medical"))
const Step4FingerAuth = lazy(() => import("./pages/hospital/register/Step4FingerAuth"))
const RegisterSuccess = lazy(() => import("./pages/hospital/register/RegisterSuccess"))
const OtpAuth = lazy(() => import("./pages/hospital/OtpAuth"))
const BiometricAuth = lazy(() => import("./pages/hospital/BiometricAuth"))
const EmergencyConfirm = lazy(() => import("./pages/hospital/EmergencyConfirm"))
const EmergencyNFC = lazy(() => import("./pages/hospital/EmergencyNFC"))
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"))
import { ROLES } from "./utils/roles"
import Loader from "./components/Loader"

function App() {
  const { user, loading } = useAuth()

  // Development logging only
  if (import.meta.env.DEV) {
    console.log("App Render: User State:", { user, loading })
  }

  if (loading) return <Loader />

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route
          path="/"
          element={
            user?.role === ROLES.DOCTOR
              ? <Navigate to="/doctor" replace />
              : user?.role === ROLES.MEDICAL_SHOP
                ? <Navigate to="/medical-shop" replace />
                : user?.role === ROLES.PATIENT
                  ? <Navigate to="/patient" replace />
                  : user?.role === ROLES.HOSPITAL
                    ? <Navigate to="/hospital" replace />
                    : user?.role === ROLES.ADMIN
                      ? <Navigate to="/admin" replace />
                      : <LoginPage />
          }
        />

        {/* DOCTOR ROUTES */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="history" element={<PatientHistory />} />
        </Route>

        {/* MEDICAL SHOP ROUTES */}
        <Route
          path="/medical-shop"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEDICAL_SHOP]}>
              <MedicalShopLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MedicalShopDashboard />} />
        </Route>

        {/* PATIENT ROUTES */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
              <PatientRoutes />
            </ProtectedRoute>
          }
        />

        {/* HOSPITAL ROUTES */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]}>
              <HospitalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HospitalDashboard />} />
          <Route path="register" element={<RegisterPatient />}>
            <Route index element={<Step1Personal />} />
            <Route path="contact" element={<Step2Contact />} />
            <Route path="medical" element={<Step3Medical />} />
            <Route path="fingerprint" element={<Step4FingerAuth />} />
          </Route>
          <Route path="clinical-note/auth" element={<OtpAuth />} />
          <Route path="clinical-note/biometric" element={<BiometricAuth />} />
          <Route path="emergency/confirm" element={<EmergencyConfirm />} />
          <Route path="emergency/nfc-scan" element={<EmergencyNFC />} />
          <Route path="clinical-note" element={<ClinicalNote />} />
        </Route>

        <Route
          path="/hospital/register/success"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]}>
              <RegisterSuccess />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* SECURE PRESCRIPTION VIEWER */}
        <Route
          path="/medical-shop/prescriptions/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEDICAL_SHOP]}>
              <PrescriptionViewer />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<div className="p-20 text-center text-red-500 font-bold">Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
