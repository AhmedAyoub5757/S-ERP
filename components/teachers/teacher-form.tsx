'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { teacherFormSchema, type TeacherFormValues } from '@/lib/validations/teacher'
import { createTeacher } from '@/app/dashboard/teachers/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function TeacherForm() {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      employeeNumber: '',
      qualification: '',
      joiningDate: '',
    },
  })

  async function onSubmit(values: TeacherFormValues) {
    setSubmitting(true)
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value))
    })

    const result = await createTeacher(formData)
    setSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="e.g. Sana Malik" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (used as login)</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input placeholder="Optional" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Number</FormLabel>
              <FormControl><Input placeholder="e.g. EMP-1016" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <FormControl><Input placeholder="Optional, e.g. M.Ed" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="joiningDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joining Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Teacher'}
        </Button>
      </form>
    </Form>
  )
}