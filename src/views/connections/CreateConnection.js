import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CRow,
} from '@coreui/react'

const CreateConnection = () => {
  const [formData, setFormData] = useState({
    connection_type: '',
    sftp_host: '',
    sftp_port: '',
    sftp_username: '',
    sftp_password: '',
    salesforce_username: '',
    salesforce_password: '',
    salesforce_security_token: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create a new object with the form data
      const connectionData = {
        ...formData,
        // Convert sftp_port to integer or null if it's empty
        sftp_port: formData.sftp_port ? parseInt(formData.sftp_port, 10) : null,
      }

      // Remove empty fields
      Object.keys(connectionData).forEach(
        (key) =>
          (connectionData[key] === '' || connectionData[key] === null) &&
          delete connectionData[key],
      )

      const { data, error } = await supabase.from('connections').insert([connectionData])

      if (error) throw error

      alert('Connection created successfully!')
      navigate('/connections')
    } catch (error) {
      console.error('Error creating connection:', error)
      setError('Failed to create connection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader>Create New Connection</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CFormSelect
                name="connection_type"
                value={formData.connection_type}
                onChange={handleInputChange}
                label="Connection Type"
                required
              >
                <option value="">Select a type</option>
                <option value="SFTP">SFTP</option>
                <option value="Salesforce">Salesforce</option>
              </CFormSelect>
            </CCol>
          </CRow>
          {formData.connection_type === 'SFTP' && (
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormInput
                  name="sftp_host"
                  value={formData.sftp_host}
                  onChange={handleInputChange}
                  label="SFTP Host"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="number"
                  name="sftp_port"
                  value={formData.sftp_port}
                  onChange={handleInputChange}
                  label="SFTP Port"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  name="sftp_username"
                  value={formData.sftp_username}
                  onChange={handleInputChange}
                  label="SFTP Username"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="password"
                  name="sftp_password"
                  value={formData.sftp_password}
                  onChange={handleInputChange}
                  label="SFTP Password"
                  required
                />
              </CCol>
            </CRow>
          )}
          {formData.connection_type === 'Salesforce' && (
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormInput
                  name="salesforce_username"
                  value={formData.salesforce_username}
                  onChange={handleInputChange}
                  label="Salesforce Username"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="password"
                  name="salesforce_password"
                  value={formData.salesforce_password}
                  onChange={handleInputChange}
                  label="Salesforce Password"
                  required
                />
              </CCol>
              <CCol md={12}>
                <CFormInput
                  name="salesforce_security_token"
                  value={formData.salesforce_security_token}
                  onChange={handleInputChange}
                  label="Salesforce Security Token"
                  required
                />
              </CCol>
            </CRow>
          )}
          <CRow className="mt-3">
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Connection'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CreateConnection
