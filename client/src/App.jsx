import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CreateIssue from './pages/citizen/CreateIssue';
import IssueDetail from './pages/citizen/IssueDetail';
import MyIssues from './pages/citizen/MyIssues';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Home />} />

      <Route path="/issues/new" element={
        <ProtectedRoute><CreateIssue /></ProtectedRoute>
      } />
      <Route path="/issues/:id" element={
        <IssueDetail />
      } />
      <Route path="/my-issues" element={
        <ProtectedRoute><MyIssues /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
    </Routes>
  );
}

export default App;