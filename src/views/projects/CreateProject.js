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
  CFormTextarea,
  CRow,
} from '@coreui/react'

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.from('projects').insert([formData])

      if (error) throw error

      alert('Project created successfully!')
      navigate('/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader>Create New Project</CCardHeader>
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
          </CRow>
          <CRow className="mt-3">
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CreateProject
