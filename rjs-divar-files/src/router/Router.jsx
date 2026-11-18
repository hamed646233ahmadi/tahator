import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import HomePage from "pages/HomePage.jsx";
import DashboardPage from "pages/DashboardPage.jsx";
import AuthPage from "pages/AuthPage.jsx";
import AdminPage from "pages/AdminPage.jsx";
import StaffLoginPage from "pages/StaffLoginPage.jsx";
import PageNotFound from "pages/404.jsx";
import Details from "pages/Details.jsx";
import Loader from "components/modules/Loader.jsx";
import useUser from "hooks/useUser.js";
function Router() {
  const {profile, isProfileLoading} = useUser();
  if (isProfileLoading) return <Loader/>;
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/details/:id" element={profile ? <Details /> : <Navigate to="/auth" />} />
    <Route path="/dashboard" element={profile ? <DashboardPage /> : <Navigate to="/auth" />} />
    <Route path="/auth" element={profile ? <Navigate to="/"/> : <AuthPage />} />
    <Route path="/staff-login" element={<StaffLoginPage />} />
    <Route path="/admin" element={sessionStorage.getItem("tahaterStaffToken") ? <AdminPage /> : <Navigate to="/staff-login" replace />} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>;
}
export default Router;