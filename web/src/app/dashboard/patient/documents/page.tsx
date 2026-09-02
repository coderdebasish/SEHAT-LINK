'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, History, FileText, Calendar, ClipboardList, GitBranch, FolderOpen, Settings, Upload, Eye, Loader2, Package, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: History, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: FileText, section: 'Health Records' },
  { href: '/dashboard/patient/diagnostics', label: 'Diagnostics & Reports', icon: ClipboardList, section: 'Health Records' },
  { href: '/dashboard/patient/referrals', label: 'Referrals', icon: GitBranch, section: 'Health Records' },
  { href: '/dashboard/patient/documents', label: 'Documents', icon: FolderOpen, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type DocumentRow = {
  id: string
  title: string
  document_type: string
  file_url: string
  mime_type: string | null
  created_at: string
}

export default function PatientDocumentsPage() {
  const auth = useRequireAuth('patient')
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('Scanned Record')
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!auth.patient?.id) return

    async function loadDocs() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('clinical_documents')
        .select('id, title, document_type, file_url, mime_type, created_at')
        .eq('patient_id', auth.patient!.id)
        .order('created_at', { ascending: false })

      setDocuments((data as any) || [])
      setLoading(false)
    }

    loadDocs()

    const supabase = createClient()
    const channel = supabase.channel(`patient-docs-${auth.patient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinical_documents' }, () => loadDocs())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.patient?.id])

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.patient?.id) return
    setSubmitting(true)

    const supabase = createClient()
    await supabase.from('clinical_documents').insert({
      patient_id: auth.patient.id,
      uploaded_by: auth.profile?.id,
      title,
      document_type: docType,
      file_url: fileUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      mime_type: 'application/pdf'
    })

    setSubmitting(false)
    setShowModal(false)
    setTitle('')
    setFileUrl('')
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="My Health Documents Vault" subtitle="Personal Medical Scans &amp; Government Health Cards" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Personal Vault</h3>
              <p className="text-xs text-gray-500">Secure cloud storage for your medical records and ABHA health cards</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="card flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-300" />
              </div>
            ) : documents.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No documents uploaded yet</p>
                <p className="text-xs mt-1">Click "Upload Document" to add lab scans, ABHA card, or insurance papers</p>
              </div>
            ) : (
              documents.map(d => (
                <div key={d.id} className="card flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{d.title}</h4>
                    <p className="text-xs text-violet-700 font-semibold">{d.document_type}</p>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">Uploaded on {formatDate(d.created_at)}</p>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Upload Medical Document</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3 text-xs">
              <div className="form-group">
                <label className="label font-bold">Document Title</label>
                <input className="input" placeholder="e.g. ABHA PM-JAY Card" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label font-bold">Document Type</label>
                <select className="input font-semibold" value={docType} onChange={e => setDocType(e.target.value)}>
                  <option value="Health Insurance Card">Health Insurance Card</option>
                  <option value="Scanned Prescription">Scanned Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Lab Scan">Lab Scan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label font-bold">File URL / Attachment Link</label>
                <input className="input font-mono" placeholder="https://..." value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
