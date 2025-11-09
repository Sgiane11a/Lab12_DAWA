"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditBookPage(){
  const params = useParams() as { id?: string }
  const id = params?.id
  const router = useRouter()

  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })

  useEffect(()=>{ if (id) load() }, [id])

  async function load(){
    setLoading(true)
    try{
      const res = await fetch(`/api/books/${id}`)
      if (!res.ok) throw new Error('Libro no encontrado')
      const j = await res.json()
      setBook(j)
      setForm({ title: j.title||'', description: j.description||'', isbn: j.isbn||'', publishedYear: j.publishedYear ? String(j.publishedYear) : '', genre: j.genre||'', pages: j.pages ? String(j.pages) : '' })
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }

  async function submit(e: React.FormEvent){
    e.preventDefault()
    try{
      const payload = { ...form, publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined, pages: form.pages ? parseInt(form.pages) : undefined }
      const res = await fetch(`/api/books/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error actualizando')
      // go back to books list
      router.push('/books')
    }catch(err:any){ alert(err.message || 'Error actualizando libro') }
  }

  async function handleDelete(){
    if (!confirm('Eliminar libro?')) return
    try{
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Error eliminando')
      router.push('/books')
    }catch(err:any){ alert(err.message || 'Error eliminando libro') }
  }

  if (!id) return <div className="alert alert-warning">ID inválido</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4">Editar libro</h1>
        <div>
          <button className="btn btn-danger me-2" onClick={handleDelete}>Eliminar</button>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando...</div>}

      {book && (
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="mb-2"><label className="form-label">Título</label><input className="form-control" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required/></div>
              <div className="mb-2"><label className="form-label">ISBN</label><input className="form-control" value={form.isbn} onChange={e=>setForm({...form, isbn: e.target.value})} /></div>
              <div className="mb-2"><label className="form-label">Género</label><input className="form-control" value={form.genre} onChange={e=>setForm({...form, genre: e.target.value})} /></div>
              <div className="row g-2 mb-3"><div className="col-6"><label className="form-label">Año</label><input className="form-control" value={form.publishedYear} onChange={e=>setForm({...form, publishedYear: e.target.value})} type="number"/></div><div className="col-6"><label className="form-label">Páginas</label><input className="form-control" value={form.pages} onChange={e=>setForm({...form, pages: e.target.value})} type="number"/></div></div>
              <div className="mb-2"><label className="form-label">Descripción</label><textarea className="form-control" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} /></div>
              <div className="d-flex gap-2"><button className="btn btn-success">Guardar</button><button type="button" className="btn btn-secondary" onClick={()=>router.push('/books')}>Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
