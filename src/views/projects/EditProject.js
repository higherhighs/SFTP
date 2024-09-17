import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'

const EditProject = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProject()
    fetchConnections()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

      if (error) throw error

      setFormData(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Failed to fetch project data. Please try again.')
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
      setError('Failed to fetch connections. Please try again.')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('projects').update(formData).eq('id', id)

      if (error) throw error

      alert('Project updated successfully!')
      navigate('/projects')
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <CSpinner color="primary" />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!formData) {
    return <div>No project data found.</div>
  }

  return (
    <CCard>
      <CCardHeader>Edit Project</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CFormInput
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                label="Project Name"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                label="Description"
                rows={3}
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                name="from_connection_id"
                value={formData.from_connection_id}
                onChange={handleInputChange}
                label="From Connection"
                required
              >
                <option value="">Select a connection</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.connection_type === 'SFTP' ? conn.sftp_host : conn.salesforce_username}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                name="to_connection_id"
                value={formData.to_connection_id}
                onChange={handleInputChange}
                label="To Connection"
                required
              >
                <option value="">Select a connection</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.connection_type === 'SFTP' ? conn.sftp_host : conn.salesforce_username}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                name="operation_type"
                value={formData.operation_type}
                onChange={handleInputChange}
                label="Operation Type"
                required
              >
                <option value="">Select operation type</option>
                <option value="retrieve">Retrieve file from SFTP to Salesforce</option>
                <option value="push">Push file from Salesforce to SFTP</option>
              </CFormSelect>
            </CCol>
            {formData.operation_type === 'retrieve' && (
              <CCol md={6}>
                <CFormInput
                  name="sftp_file_path"
                  value={formData.sftp_file_path}
                  onChange={handleInputChange}
                  label="SFTP File Path"
                  required
                />
              </CCol>
            )}
            {formData.operation_type === 'push' && (
              <CCol md={6}>
                <CFormInput
                  name="salesforce_file_id"
                  value={formData.salesforce_file_id}
                  onChange={handleInputChange}
                  label="Salesforce File ID"
                  required
                />
              </CCol>
            )}
          </CRow>
          <CRow className="mt-3">
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Project'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditProject
