"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Book = { id: string; title: string; publishedYear?: number | null; genre?: string | null }

export default function AuthorDetailPage(){
  const params = useParams() as { id?: string }
  const id = params?.id
  const [author, setAuthor] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })

  const [creatingBook, setCreatingBook] = useState(false)
  const [bookForm, setBookForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })

  useEffect(()=>{ if (id) loadAll() }, [id])

  async function loadAll(){
    setLoading(true)
    try{
      const [r1, r2] = await Promise.all([fetch(`/api/authors/${id}`), fetch(`/api/authors/${id}/stats`)])
      const a = await r1.json()
      const s = await r2.json()
      setAuthor(a)
      setStats(s)
      setForm({ name: a.name||'', email: a.email||'', bio: a.bio||'', nationality: a.nationality||'', birthYear: a.birthYear ? String(a.birthYear) : '' })
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }

  async function submitEdit(e: React.FormEvent){
    e.preventDefault();
    try{
      const res = await fetch(`/api/authors/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      setEditMode(false)
      loadAll()
    }catch(err:any){ alert(err.message || 'Error al actualizar') }
  }

  async function submitBook(e: React.FormEvent){
    e.preventDefault();
    try{
      const payload = { ...bookForm, authorId: id, publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : undefined, pages: bookForm.pages ? parseInt(bookForm.pages) : undefined }
      const res = await fetch('/api/books', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      setBookForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '' })
      setCreatingBook(false)
      loadAll()
    }catch(err:any){ alert(err.message || 'Error creando libro') }
  }

  async function handleDeleteBook(bookId: string){
    if (!confirm('Eliminar este libro?')) return
    try{
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      // refresh author and stats
      loadAll()
    }catch(err:any){ alert(err.message || 'Error eliminando libro') }
  }

  if (!id) return <div className="alert alert-warning">ID de autor inválido</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Autor</h1>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={()=>setEditMode(m=>!m)}>{editMode? 'Cancelar':'Editar autor'}</button>
          <button className="btn btn-primary" onClick={()=>setCreatingBook(c=>!c)}>{creatingBook? 'Cancelar':'Agregar libro'}</button>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando...</div>}

      {author && (
        <div className="row">
          <div className="col-lg-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Información</h5>
                {!editMode ? (
                  <div>
                    <p><strong>Nombre:</strong> {author.name}</p>
                    <p><strong>Email:</strong> {author.email}</p>
                    <p><strong>Bio:</strong> {author.bio || '—'}</p>
                    <p><strong>Nacionalidad:</strong> {author.nationality || '—'}</p>
                    <p><strong>Año:</strong> {author.birthYear || '—'}</p>
                  </div>
                ) : (
                  <form onSubmit={submitEdit}>
                    <div className="mb-2"><label className="form-label">Nombre</label><input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div className="mb-2"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} type="email" required/></div>
                    <div className="mb-2"><label className="form-label">Bio</label><textarea className="form-control" value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} /></div>
                    <div className="row">
                      <div className="col-6 mb-2"><label className="form-label">Nacionalidad</label><input className="form-control" value={form.nationality} onChange={e=>setForm({...form, nationality:e.target.value})} /></div>
                      <div className="col-6 mb-2"><label className="form-label">Año</label><input className="form-control" value={form.birthYear} onChange={e=>setForm({...form, birthYear:e.target.value})} type="number"/></div>
                    </div>
                    <div className="d-grid"><button className="btn btn-success">Guardar</button></div>
                  </form>
                )}
              </div>
            </div>
            {creatingBook && (
              <div className="card mt-3">
                <div className="card-body">
                  <h5 className="card-title">Nuevo libro para {author.name}</h5>
                  <form onSubmit={submitBook}>
                    <div className="mb-2"><label className="form-label">Título</label><input className="form-control" value={bookForm.title} onChange={e=>setBookForm({...bookForm, title:e.target.value})} required/></div>
                    <div className="mb-2"><label className="form-label">Género</label><input className="form-control" value={bookForm.genre} onChange={e=>setBookForm({...bookForm, genre:e.target.value})} /></div>
                    <div className="mb-2"><label className="form-label">Año</label><input className="form-control" value={bookForm.publishedYear} onChange={e=>setBookForm({...bookForm, publishedYear:e.target.value})} type="number"/></div>
                    <div className="d-grid"><button className="btn btn-primary">Crear libro</button></div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Estadísticas</h5>
                {stats ? (
                  <div>
                    <p><strong>Total libros:</strong> {stats.totalBooks}</p>
                    <p><strong>Promedio páginas:</strong> {stats.averagePages}</p>
                    <p><strong>Géneros:</strong> {stats.genres && stats.genres.length ? stats.genres.join(', ') : '—'}</p>
                    {stats.firstBook && <p><strong>Primer libro:</strong> {stats.firstBook.title} ({stats.firstBook.year})</p>}
                    {stats.latestBook && <p><strong>Último libro:</strong> {stats.latestBook.title} ({stats.latestBook.year})</p>}
                  </div>
                ) : (
                  <div className="text-muted">No hay estadísticas disponibles</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Libros ({author.books?.length ?? 0})</h5>
                <ul className="list-group list-group-flush">
                  {author.books?.map((b: Book) => (
                    <li key={b.id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">{b.title}</div>
                        <div className="text-muted small">{b.genre ?? '—'} • {b.publishedYear ?? '—'}</div>
                      </div>
                      <div>
                        <a className="btn btn-sm btn-outline-secondary me-2" href={`/books/${b.id}`}>Editar</a>
                        <a className="btn btn-sm btn-outline-danger" href="#">Eliminar</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
