import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import type { Charity } from "../../types"

// We use basic state toggles instead of shadcn Dialog to keep dependencies simple
export default function AdminCharities() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<Charity | 'new' | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCharities()
  }, [])

  const fetchCharities = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("charities").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setCharities(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (c?: Charity) => {
    if (c) {
      setIsEditing(c)
      setName(c.name)
      setDescription(c.description || "")
      setIsFeatured(c.is_featured)
    } else {
      setIsEditing('new')
      setName("")
      setDescription("")
      setIsFeatured(false)
    }
    setUploadFile(null)
  }

  const handleSave = async () => {
    if (!name) return toast.error("Name is required")

    setSaving(true)
    try {
      let imageUrl = isEditing && isEditing !== 'new' && typeof isEditing !== 'string' ? (isEditing as Charity).image_url : null

      if (uploadFile) {
        const fileExt = uploadFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        // Supabase bucket should be named "charity-images"
        const { error: uploadError } = await supabase.storage
          .from('charity-images')
          .upload(fileName, uploadFile)

        if (uploadError) {
          toast.error("Image upload failed, ensure 'charity-images' bucket exists in DB.")
        } else {
           const { data } = supabase.storage.from('charity-images').getPublicUrl(fileName)
           imageUrl = data.publicUrl
        }
      }

      const payload = {
        name,
        description,
        is_featured: isFeatured,
        image_url: imageUrl
      }

      if (isEditing === 'new') {
        const { error } = await supabase.from("charities").insert(payload)
        if (error) throw error
        toast.success("Charity created")
      } else if (isEditing && typeof isEditing !== 'string') {
        const { error } = await supabase.from("charities").update(payload).eq('id', (isEditing as Charity).id)
        if (error) throw error
        toast.success("Charity updated")
      }

      setIsEditing(null)
      fetchCharities()

    } catch (err: any) {
      toast.error(err.message || "Failed to save charity")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    try {
      const { error } = await supabase.from("charities").delete().eq("id", id)
      if (error) throw error
      toast.success("Charity deleted")
      fetchCharities()
    } catch (err: any) {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Charities</h1>
          <p className="text-slate-400 mt-1">Manage beneficiary organizations and their details</p>
        </div>
        <Button onClick={() => handleOpenEdit()} className="bg-[#00FF87] text-[#080B14] hover:bg-[#00FF87]/80 font-bold">
          + Add Charity
        </Button>
      </div>

      <div className="bg-[#0A0E1A] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading charities...</div>
        ) : (
          <Table>
            <TableHeader className="bg-[#080B14]">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Description</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charities.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center p-8 text-slate-500">No charities found</TableCell>
                 </TableRow>
              )}
              {charities.map((c) => (
                <TableRow key={c.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium flex items-center gap-3">
                    {c.image_url && <img src={c.image_url} alt="" className="w-8 h-8 rounded-full border border-white/20 object-cover bg-black" />}
                    {c.name}
                  </TableCell>
                  <TableCell className="text-slate-400 max-w-xs truncate">{c.description}</TableCell>
                  <TableCell>
                    {c.is_featured ? (
                      <span className="bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded-full text-xs font-bold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-slate-600">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(c.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">{isEditing === 'new' ? 'New Charity' : 'Edit Charity'}</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Charity Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-[#080B14] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-[#080B14] border-white/10" />
              </div>
              <div className="space-y-2 mt-4">
                <Label>Image Upload (Optional)</Label>
                <Input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="bg-[#080B14] border-white/10 text-slate-400" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                <Label>Mark as Featured</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" className="border-white/10" onClick={() => setIsEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button className="bg-[#00FF87] text-black hover:bg-[#00FF87]/80 font-bold" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Charity'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
