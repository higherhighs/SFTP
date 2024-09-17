import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
} from '@coreui/react'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    from_connection_id: '',
    to_connection_id: '',
    operation_type: '',
    sftp_file_path: '',
    salesforce_file_id: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
    fetchConnections()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(
          '*, from_connection:connections!from_connection_id(*), to_connection:connections!to_connection_id(*)',
        )

      if (error) throw error

      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to fetch projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase.from('connections').select('*')
      if (error) throw error
      setConnections(data)
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const handleEdit = (id) => {
    navigate(`/projects/edit/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id)

        if (error) throw error

        setProjects(projects.filter((project) => project.id !== id))
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project. Please try again.')
      }
    }
  }

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from('projects').insert([newProject])

      if (error) throw error

      if (data && data.length > 0) {
        setProjects([...projects, data[0]])
        setNewProject({
          name: '',
          description: '',
          from_connection_id: '',
          to_connection_id: '',
          operation_type: '',
          sftp_file_path: '',
          salesforce_file_id: '',
        })
        setShowCreateForm(false)
      } else {
        console.error('No data returned from insert operation')
        alert('Project created, but no data returned. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert(`Failed to create project. Error: ${error.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return <CSpinner color="primary" />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Projects</strong>
            <CButton
              color="primary"
              className="float-end"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Project'}
            </CButton>
          </CCardHeader>
          <CCardBody>
            {showCreateForm && (
              <CForm onSubmit={handleCreateSubmit} className="mb-4">
                <CRow>
                  <CCol md={6}>
                    <CFormInput
                      name="name"
                      value={newProject.name}
                      onChange={handleCreateInputChange}
                      label="Project Name"
                      required
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormTextarea
                      name="description"
                      value={newProject.description}
                      onChange={handleCreateInputChange}
                      label="Description"
                      rows={3}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect
                      name="from_connection_id"
                      value={newProject.from_connection_id}
                      onChange={handleCreateInputChange}
                      label="From Connection"
                      required
                    >
                      <option value="">Select a connection</option>
                      {connections.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.connection_type === 'SFTP'
                            ? conn.sftp_host
                            : conn.salesforce_username}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect
                      name="to_connection_id"
                      value={newProject.to_connection_id}
                      onChange={handleCreateInputChange}
                      label="To Connection"
                      required
                    >
                      <option value="">Select a connection</option>
                      {connections.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.connection_type === 'SFTP'
                            ? conn.sftp_host
                            : conn.salesforce_username}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect
                      name="operation_type"
                      value={newProject.operation_type}
                      onChange={handleCreateInputChange}
                      label="Operation Type"
                      required
                    >
                      <option value="">Select operation type</option>
                      <option value="retrieve">Retrieve file from SFTP to Salesforce</option>
                      <option value="push">Push file from Salesforce to SFTP</option>
                    </CFormSelect>
                  </CCol>
                  {newProject.operation_type === 'retrieve' && (
                    <CCol md={6}>
                      <CFormInput
                        name="sftp_file_path"
                        value={newProject.sftp_file_path}
                        onChange={handleCreateInputChange}
                        label="SFTP File Path"
                        required
                      />
                    </CCol>
                  )}
                  {newProject.operation_type === 'push' && (
                    <CCol md={6}>
                      <CFormInput
                        name="salesforce_file_id"
                        value={newProject.salesforce_file_id}
                        onChange={handleCreateInputChange}
                        label="Salesforce File ID"
                        required
                      />
                    </CCol>
                  )}
                </CRow>
                <CButton type="submit" color="success" className="mt-3">
                  Create Project
                </CButton>
              </CForm>
            )}
            {projects.length === 0 ? (
              <div>No projects found. Create a new one to get started!</div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>From Connection</CTableHeaderCell>
                    <CTableHeaderCell>To Connection</CTableHeaderCell>
                    <CTableHeaderCell>Operation Type</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {projects.map((project) => (
                    <CTableRow key={project.id}>
                      <CTableDataCell>{project.name}</CTableDataCell>
                      <CTableDataCell>{project.description}</CTableDataCell>
                      <CTableDataCell>
                        {project.from_connection?.connection_type === 'SFTP'
                          ? project.from_connection?.sftp_host
                          : project.from_connection?.salesforce_username}
                      </CTableDataCell>
                      <CTableDataCell>
                        {project.to_connection?.connection_type === 'SFTP'
                          ? project.to_connection?.sftp_host
                          : project.to_connection?.salesforce_username}
                      </CTableDataCell>
                      <CTableDataCell>{project.operation_type}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handleEdit(project.id)}
                          className="me-2"
                        >
                          Edit
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(project.id)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Projects
