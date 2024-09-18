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
  CRow,
  CSpinner,
} from '@coreui/react'

const EditConnection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sfEnvironment, setSfEnvironment] = useState('Production')
  const [connectionStatus, setConnectionStatus] = useState(null)

  useEffect(() => {
    fetchConnection()
  }, [id])

  const fetchConnection = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('connections').select('*').eq('id', id).single()

      if (error) throw error

      setFormData(data)
      setConnectionStatus(data.status)
      if (data.connection_type === 'Salesforce') {
        setSfEnvironment(getSfEnvironment(data.salesforce_authentication_URL))
      }
    } catch (error) {
      console.error('Error fetching connection:', error)
      setError('Failed to fetch connection data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSfEnvironment = (url) => {
    if (url === 'https://login.salesforce.com/') return 'Production'
    if (url === 'https://test.salesforce.com/') return 'Sandbox'
    return 'Custom Domain'
  }

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
      url = formData.salesforce_authentication_URL || ''
    }
    setFormData((prev) => ({ ...prev, salesforce_authentication_URL: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('connections').update(formData).eq('id', id)

      if (error) throw error

      alert('Connection updated successfully!')
      navigate('/connections')
    } catch (error) {
      console.error('Error updating connection:', error)
      setError('Failed to update connection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('test-connection', {
        body: {
          id: formData.id, // Make sure this is included for existing connections
          connection_type: formData.connection_type,
          sftp_host: formData.sftp_host,
          sftp_port: formData.sftp_port,
          sftp_username: formData.sftp_username,
          sftp_password: formData.sftp_password,
          salesforce_authentication_URL: formData.salesforce_authentication_URL,
          salesforce_consumer_key: formData.salesforce_consumer_key,
          salesforce_consumer_secret: formData.salesforce_consumer_secret,
        },
      })

      if (error) throw error

      setConnectionStatus(data.status)
      setFormData((prev) => ({ ...prev, status: data.status }))

      // Update the connection status in the database
      const { error: updateError } = await supabase
        .from('connections')
        .update({ status: data.status })
        .eq('id', id)

      if (updateError) throw updateError

      alert(data.message)
    } catch (error) {
      console.error('Error testing connection:', error)
      setConnectionStatus('Error')
      setFormData((prev) => ({ ...prev, status: 'Error' }))
      alert(`Failed to test connection: ${error.message}`)
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
    return <div>No connection data found.</div>
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Edit Connection</strong>
      </CCardHeader>
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
                disabled
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
                  placeholder="Leave blank to keep current password"
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
                  placeholder="Leave blank to keep current password"
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
                  placeholder="Leave blank to keep current secret"
                  required
                />
              </CCol>
            </CRow>
          )}
          <CRow className="mt-3">
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Connection'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
        <CButton color="secondary" onClick={testConnection} disabled={loading} className="mt-3">
          Test Connection
        </CButton>
      </CCardBody>
    </CCard>
  )
}

export default EditConnection
