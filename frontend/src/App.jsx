import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute  from "./components/ProtectedRoute";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Dashboard       from "./pages/Dashboard";
import CreateRequest   from "./pages/CreateRequest";
import LiveTracking    from "./pages/LiveTracking";
import Chat from "./pages/Chat";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request"   element={<CreateRequest />} />
          <Route path="/track/:id" element={<LiveTracking />} />
          <Route path="/chat/:requestId" element={<Chat />} />
        </Route>

        {/* default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;