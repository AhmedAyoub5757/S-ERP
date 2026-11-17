'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { studentFormSchema, type StudentFormValues } from '@/lib/validations/student'
import { createStudent } from '@/app/dashboard/students/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SectionOption {
  id: number
  label: string
}

export function StudentForm({ sections }: { sections: SectionOption[] }) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      admissionNumber: '',
      sectionId: 0 as any,
      dateOfBirth: '',
      gender: 'male',
      bloodGroup: '',
      address: '',
    },
  })

  const onSubmit: SubmitHandler<StudentFormValues> = async (values) => {
    setSubmitting(true)
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value))
    })

    const result = await createStudent(formData)
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
              <FormControl>
                <Input placeholder="e.g. Ahmed Raza" {...field} />
              </FormControl>
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
              <FormControl>
                <Input type="email" placeholder="student@example.com" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Optional" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admissionNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admission Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ADM-2026-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class / Section</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bloodGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Group</FormLabel>
              <FormControl>
                <Input placeholder="Optional, e.g. O+" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Student'}
        </Button>
      </form>
    </Form>
  )
}