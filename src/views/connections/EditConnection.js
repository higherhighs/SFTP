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
  console.log('EditConnection rendered, id:', id)
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConnection()
  }, [id])

  const fetchConnection = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('connections').select('*').eq('id', id).single()

      console.log('Fetched connection data:', data)

      if (error) throw error

      setFormData(data)
    } catch (error) {
      console.error('Error fetching connection:', error)
      setError('Failed to fetch connection data. Please try again.')
    } finally {
      setLoading(false)
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
      <CCardHeader>Edit Connection</CCardHeader>
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
                {loading ? 'Updating...' : 'Update Connection'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default EditConnection
