import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "pages/HomePage.jsx";
import DashboardPage from "pages/DashboardPage.jsx";
import AuthPage from "pages/AuthPage.jsx";
import AdminPage from "pages/AdminPage.jsx";
import PageNotFound from "pages/404.jsx";
import Details from "pages/Details.jsx";
import useUser from "hooks/useUser.js";

function Router() {
    const { profile } = useUser();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/details/:id" element={<Details />} />
            <Route path="/dashboard" element={profile ? <DashboardPage /> : <Navigate to="/auth" replace />} />
            <Route path="/auth" element={profile ? <Navigate to="/" replace /> : <AuthPage />} />
            <Route path="/admin" element={profile?.data?.role === "ADMIN" ? <AdminPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
}
export default Router;