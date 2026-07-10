import { Routes, Route } from 'react-router'
import { DashboardLayout } from './components/dashboard-layout'
import Home from './pages/Home'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import { DashboardPage } from './pages/DashboardPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { ModelsPage } from './pages/ModelsPage'
import { UsersPage } from './pages/UsersPage'
import { ChatHistoryPage } from './pages/ChatHistoryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/providers" element={<ProvidersPage />} />
        <Route path="/dashboard/models" element={<ModelsPage />} />
        <Route path="/dashboard/users" element={<UsersPage />} />
        <Route path="/dashboard/chats" element={<ChatHistoryPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
