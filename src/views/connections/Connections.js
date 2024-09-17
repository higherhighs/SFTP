import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
} from '@coreui/react'

const Connections = () => {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('connections').select('*')

      if (error) throw error

      setConnections(data)
    } catch (error) {
      console.error('Error fetching connections:', error)
      setError('Failed to fetch connections. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/connections/edit/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        const { error } = await supabase.from('connections').delete().eq('id', id)

        if (error) throw error

        setConnections(connections.filter((conn) => conn.id !== id))
      } catch (error) {
        console.error('Error deleting connection:', error)
        alert('Failed to delete connection. Please try again.')
      }
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
            <strong>Connections</strong>
            <Link to="/connections/create" className="btn btn-primary float-end">
              Create New Connection
            </Link>
          </CCardHeader>
          <CCardBody>
            {connections.length === 0 ? (
              <div>No connections found. Create a new one to get started!</div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Host/Username</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {connections.map((connection) => (
                    <CTableRow key={connection.id}>
                      <CTableDataCell>{connection.connection_type}</CTableDataCell>
                      <CTableDataCell>
                        {connection.connection_type === 'SFTP'
                          ? connection.sftp_host
                          : connection.salesforce_username}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(connection.created_at).toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handleEdit(connection.id)}
                          className="me-2"
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(connection.id)}
                        >
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

export default Connections
