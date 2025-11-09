"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Author = {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  nationality?: string | null;
  birthYear?: number | null;
  _count?: { books: number };
}

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })

  useEffect(() => {
    fetchAuthors()
  }, [])

  async function fetchAuthors(){
    setLoading(true)
    try{
      const res = await fetch('/api/authors')
      const data = await res.json()
      setAuthors(data)
    }catch(err:any){
      setError('Error al cargar autores')
    }finally{setLoading(false)}
  }

  async function handleCreate(e: React.FormEvent){
    e.preventDefault()
    try{
      const res = await fetch('/api/authors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      setForm({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
      fetchAuthors()
    }catch(err:any){
      alert(err.message || 'Error creando autor')
    }
  }

  function startEdit(a: Author){
    setEditingId(a.id)
    setEditForm({ name: a.name||'', email: a.email||'', bio: a.bio||'', nationality: a.nationality||'', birthYear: a.birthYear ? String(a.birthYear) : '' })
  }

  async function submitEdit(e: React.FormEvent){
    e.preventDefault()
    if (!editingId) return
    try{
      const res = await fetch(`/api/authors/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      setEditingId(null)
      fetchAuthors()
    }catch(err:any){
      alert(err.message || 'Error actualizando autor')
    }
  }

  async function handleDelete(id: string){
    if (!confirm('Eliminar autor? Esto también eliminará sus libros.')) return
    try{
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      fetchAuthors()
    }catch(err:any){
      alert(err.message || 'Error eliminando autor')
    }
  }

  const totalAuthors = authors.length
  const totalBooks = authors.reduce((s,a) => s + (a._count?.books || 0), 0)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <div className="text-end">
          <div>Total autores: <strong>{totalAuthors}</strong></div>
          <div>Total libros: <strong>{totalBooks}</strong></div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Crear autor</h5>
              <form onSubmit={handleCreate}>
                <div className="mb-2">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Biografía</label>
                  <textarea className="form-control" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label">Nacionalidad</label>
                    <input className="form-control" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label">Año de nacimiento</label>
                    <input className="form-control" value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} type="number" />
                  </div>
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary">Crear autor</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Autores</h5>

              {loading && <div className="alert alert-info">Cargando autores...</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Libros</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map(a => (
                      <tr key={a.id}>
                        <td>{a.name}</td>
                        <td><a href={`mailto:${a.email}`}>{a.email}</a></td>
                        <td>{a._count?.books ?? 0}</td>
                        <td className="text-end">
                          <Link href={`/authors/${a.id}`} className="btn btn-sm btn-outline-primary me-2">Ver libros</Link>
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => startEdit(a)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {editingId && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Editar autor</h5>
                <form onSubmit={submitEdit}>
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} type="email" required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Biografía</label>
                    <textarea className="form-control" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Nacionalidad</label>
                      <input className="form-control" value={editForm.nationality} onChange={e => setEditForm({...editForm, nationality: e.target.value})} />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Año de nacimiento</label>
                      <input className="form-control" value={editForm.birthYear} onChange={e => setEditForm({...editForm, birthYear: e.target.value})} type="number" />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success">Guardar</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
