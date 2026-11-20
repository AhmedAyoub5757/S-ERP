'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { enrollApplication } from '@/app/dashboard/admissions/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GraduationCap } from 'lucide-react'

export type EnrollmentSection = {
  id: number
  name: string
  class_id: number
  classes?: { name: string } | null
}

export function EnrollApplicationDialog({
  applicationId,
  applicantName,
  guardianName,
  guardianPhone,
  guardianEmail,
  applyingForClassId,
  sections,
}: {
  applicationId: number
  applicantName: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string | null
  applyingForClassId: number
  sections: EnrollmentSection[]
}) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [admissionNumber, setAdmissionNumber] = useState(
    `ADM-${new Date().getFullYear()}-${String(applicationId).padStart(4, '0')}`
  )
  const [sectionId, setSectionId] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [parentEmail, setParentEmail] = useState(guardianEmail ?? '')
  const [bloodGroup, setBloodGroup] = useState('')
  const [address, setAddress] = useState('')
  const router = useRouter()

  const availableSections = sections.filter((section) => section.class_id === applyingForClassId)

  async function handleEnroll() {
    if (!admissionNumber.trim()) {
      toast.error('Admission number is required')
      return
    }
    if (!sectionId) {
      toast.error('Select a section')
      return
    }
    if (!studentEmail.trim()) {
      toast.error('Student email is required')
      return
    }
    if (!parentEmail.trim()) {
      toast.error('Guardian email is required to create the parent account')
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.set('applicationId', String(applicationId))
    formData.set('admissionNumber', admissionNumber)
    formData.set('sectionId', sectionId)
    formData.set('studentEmail', studentEmail)
    formData.set('parentEmail', parentEmail)
    formData.set('parentPhone', guardianPhone)
    formData.set('bloodGroup', bloodGroup)
    formData.set('address', address)

    const result = await enrollApplication(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    if (result && 'reusedParentAccount' in result) {
      toast.success(
        result.reusedParentAccount
          ? `${applicantName} enrolled successfully`
          : `${applicantName} enrolled. Student login: ${result.studentPassword}; guardian login: ${result.parentPassword}`
      )
    } else {
      toast.success(`${applicantName} enrolled successfully`)
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <GraduationCap className="mr-1 h-3.5 w-3.5" />
        Enroll
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll {applicantName}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`admission-${applicationId}`}>Admission number</Label>
            <Input
              id={`admission-${applicationId}`}
              value={admissionNumber}
              onChange={(event) => setAdmissionNumber(event.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`section-${applicationId}`}>Section</Label>
            {availableSections.length ? (
              <select
                id={`section-${applicationId}`}
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                <option value="">Select a section</option>
                {availableSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.classes?.name ?? 'Class'} - Section {section.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                No section exists for the applied-for class.
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`student-email-${applicationId}`}>Student login email</Label>
            <Input
              id={`student-email-${applicationId}`}
              type="email"
              placeholder="student@school.com"
              value={studentEmail}
              onChange={(event) => setStudentEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">Default password: Student@123</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`parent-email-${applicationId}`}>Guardian login email</Label>
            <Input
              id={`parent-email-${applicationId}`}
              type="email"
              placeholder="guardian@email.com"
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Guardian: {guardianName} · {guardianPhone}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`blood-${applicationId}`}>Blood group</Label>
            <Input
              id={`blood-${applicationId}`}
              placeholder="e.g. O+"
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`address-${applicationId}`}>Address</Label>
            <Textarea
              id={`address-${applicationId}`}
              rows={3}
              placeholder="Optional address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" loading={submitting} onClick={handleEnroll} disabled={!availableSections.length}>
            {submitting ? 'Enrolling...' : 'Create student & parent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
