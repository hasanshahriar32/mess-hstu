"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { useEffect } from "react"
export default function EditMessModal({ open, onClose, mess, onSave, loading }: any) {
  const [form, setForm] = useState({ ...mess })
  useEffect(() => {
    setForm({ ...mess })
  }, [mess, open])
  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }
  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSave(form)
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="scrollable max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mess Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea name="description" value={form.description || ""} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Single Seats</Label>
              <Input name="single_seats" type="number" value={form.single_seats || 0} onChange={handleChange} />
            </div>
            <div>
              <Label>Single Price</Label>
              <Input name="single_price" type="number" value={form.single_price || 0} onChange={handleChange} />
            </div>
            <div>
              <Label>Double Seats</Label>
              <Input name="double_seats" type="number" value={form.double_seats || 0} onChange={handleChange} />
            </div>
            <div>
              <Label>Double Price</Label>
              <Input name="double_price" type="number" value={form.double_price || 0} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input name="contact_phone" value={form.contact_phone || ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input name="contact_email" value={form.contact_email || ""} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
