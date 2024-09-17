import React, { Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useSupabase } from './hooks/useSupabase'

// Import your components
import DefaultLayout from './layout/DefaultLayout'
import Login from './views/auth/Login'
import SignUp from './views/auth/SignUp'
import Home from './views/home/Home'
import Connections from './views/connections/Connections'
import CreateConnection from './views/connections/CreateConnection'
import EditConnection from './views/connections/EditConnection'
import Projects from './views/projects/Projects'
import CreateProject from './views/projects/CreateProject'
import EditProject from './views/projects/EditProject'

function App() {
  const { user } = useSupabase()

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={user ? <DefaultLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<Home />} />
            <Route path="connections" element={<Connections />} />
            <Route path="connections/create" element={<CreateConnection />} />
            <Route path="connections/edit/:id" element={<EditConnection />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/edit/:id" element={<EditProject />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
