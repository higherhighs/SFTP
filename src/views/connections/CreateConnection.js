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
    salesforce_consumer_key: '',
    salesforce_consumer_secret: '',
    salesforce_authentication_URL: 'https://login.salesforce.com/',
  })
  const [sfEnvironment, setSfEnvironment] = useState('Production')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSfEnvironmentChange = (e) => {
    const environment = e.target.value
    setSfEnvironment(environment)
    let url = 'https://login.salesforce.com/'
    if (environment === 'Sandbox') {
      url = 'https://test.salesforce.com/'
    } else if (environment === 'Custom Domain') {
      url = ''
    }
    setFormData((prev) => ({ ...prev, salesforce_authentication_URL: url }))
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
      alert('Failed to create connection. Please try again.')
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
                  name="salesforce_consumer_key"
                  value={formData.salesforce_consumer_key}
                  onChange={handleInputChange}
                  label="Salesforce Consumer Key (Client ID)"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="password"
                  name="salesforce_consumer_secret"
                  value={formData.salesforce_consumer_secret}
                  onChange={handleInputChange}
                  label="Salesforce Consumer Secret (Client Secret)"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  name="salesforce_authentication_URL"
                  value={formData.salesforce_authentication_URL}
                  onChange={handleInputChange}
                  label="Salesforce Authentication URL"
                  required
                  disabled={sfEnvironment !== 'Custom Domain'}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  name="sf_environment"
                  value={sfEnvironment}
                  onChange={handleSfEnvironmentChange}
                  label="Salesforce Environment"
                  required
                >
                  <option value="Production">Production</option>
                  <option value="Sandbox">Sandbox</option>
                  <option value="Custom Domain">Custom Domain</option>
                </CFormSelect>
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
