-- =========================================
-- HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS internally,
-- used BY policies, never called directly by client code)
-- =========================================

create or replace function current_user_has_role(p_role_name text)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = p_role_name
  );
$$;

create or replace function is_class_teacher(p_section_id int)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from sections where id = p_section_id and class_teacher_id = auth.uid()
  );
$$;

create or replace function is_assigned_to_section(p_section_id int)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from teacher_assignments
    where teacher_id = auth.uid() and section_id = p_section_id
  );
$$;

create or replace function is_parent_of(p_student_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from parent_students where parent_id = auth.uid() and student_id = p_student_id
  );
$$;

create or replace function can_manage_marks(p_exam_subject_id bigint, p_student_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1
    from exam_subjects es
    join students st on st.id = p_student_id
    join sections se on se.id = st.section_id and se.class_id = es.class_id
    join teacher_assignments ta on ta.subject_id = es.subject_id
      and ta.section_id = se.id
      and ta.teacher_id = auth.uid()
    where es.id = p_exam_subject_id
  );
$$;

-- =========================================
-- PROFILES
-- =========================================
create policy profiles_select on profiles for select
using (
  auth.uid() = id
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('teacher')
  or current_user_has_role('accountant')
  or current_user_has_role('receptionist')
  or exists (select 1 from parent_students ps where ps.parent_id = auth.uid() and ps.student_id = profiles.id)
);

create policy profiles_update on profiles for update
using (auth.uid() = id or current_user_has_role('school_admin'))
with check (auth.uid() = id or current_user_has_role('school_admin'));

create policy profiles_insert on profiles for insert
with check (current_user_has_role('school_admin') or current_user_has_role('receptionist'));

-- =========================================
-- ROLES / USER_ROLES
-- =========================================
create policy roles_select on roles for select using (auth.role() = 'authenticated');

create policy user_roles_select on user_roles for select
using (user_id = auth.uid() or current_user_has_role('school_admin') or current_user_has_role('principal'));

create policy user_roles_admin_write on user_roles for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

-- =========================================
-- ACADEMIC STRUCTURE (read: all authenticated, write: school_admin)
-- =========================================
create policy academic_years_select on academic_years for select using (auth.role() = 'authenticated');
create policy academic_years_write on academic_years for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy classes_select on classes for select using (auth.role() = 'authenticated');
create policy classes_write on classes for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy sections_select on sections for select using (auth.role() = 'authenticated');
create policy sections_write on sections for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy subjects_select on subjects for select using (auth.role() = 'authenticated');
create policy subjects_write on subjects for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy class_subjects_select on class_subjects for select using (auth.role() = 'authenticated');
create policy class_subjects_write on class_subjects for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy teacher_assignments_select on teacher_assignments for select
using (teacher_id = auth.uid() or current_user_has_role('school_admin') or current_user_has_role('principal'));
create policy teacher_assignments_write on teacher_assignments for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

-- =========================================
-- PEOPLE
-- =========================================
create policy teachers_select on teachers for select
using (
  id = auth.uid()
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('receptionist')
);
create policy teachers_write on teachers for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy students_select on students for select
using (
  id = auth.uid()
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('receptionist')
  or current_user_has_role('accountant')
  or is_class_teacher(section_id)
  or is_assigned_to_section(section_id)
  or is_parent_of(id)
);
create policy students_insert on students for insert
with check (current_user_has_role('school_admin') or current_user_has_role('receptionist'));
create policy students_update on students for update
using (current_user_has_role('school_admin') or current_user_has_role('receptionist'))
with check (current_user_has_role('school_admin') or current_user_has_role('receptionist'));

create policy parents_select on parents for select
using (
  id = auth.uid()
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('receptionist')
);
create policy parents_write on parents for all
using (current_user_has_role('school_admin') or current_user_has_role('receptionist'))
with check (current_user_has_role('school_admin') or current_user_has_role('receptionist'));

create policy parent_students_select on parent_students for select
using (
  parent_id = auth.uid()
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('receptionist')
);
create policy parent_students_write on parent_students for all
using (current_user_has_role('school_admin') or current_user_has_role('receptionist'))
with check (current_user_has_role('school_admin') or current_user_has_role('receptionist'));

create policy admission_apps_select on admission_applications for select
using (current_user_has_role('receptionist') or current_user_has_role('school_admin') or current_user_has_role('principal'));
create policy admission_apps_insert on admission_applications for insert
with check (current_user_has_role('receptionist') or current_user_has_role('school_admin'));
create policy admission_apps_update on admission_applications for update
using (current_user_has_role('receptionist') or current_user_has_role('school_admin'))
with check (current_user_has_role('receptionist') or current_user_has_role('school_admin'));

-- =========================================
-- ATTENDANCE
-- =========================================
create policy attendance_select on attendance for select
using (
  student_id = auth.uid()
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or is_parent_of(student_id)
  or is_class_teacher(section_id)
  or is_assigned_to_section(section_id)
);
create policy attendance_insert on attendance for insert
with check (
  current_user_has_role('school_admin')
  or is_class_teacher(section_id)
  or is_assigned_to_section(section_id)
);
create policy attendance_update on attendance for update
using (
  current_user_has_role('school_admin')
  or is_class_teacher(section_id)
  or is_assigned_to_section(section_id)
)
with check (
  current_user_has_role('school_admin')
  or is_class_teacher(section_id)
  or is_assigned_to_section(section_id)
);

-- =========================================
-- EXAMINATIONS / MARKS
-- =========================================
create policy examinations_select on examinations for select using (auth.role() = 'authenticated');
create policy examinations_write on examinations for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy exam_subjects_select on exam_subjects for select using (auth.role() = 'authenticated');
create policy exam_subjects_write on exam_subjects for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy marks_select on marks for select
using (
  student_id = auth.uid()
  or is_parent_of(student_id)
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or can_manage_marks(exam_subject_id, student_id)
);
create policy marks_insert on marks for insert
with check (current_user_has_role('school_admin') or can_manage_marks(exam_subject_id, student_id));
create policy marks_update on marks for update
using (current_user_has_role('school_admin') or can_manage_marks(exam_subject_id, student_id))
with check (current_user_has_role('school_admin') or can_manage_marks(exam_subject_id, student_id));

-- =========================================
-- FEES & FINANCE
-- =========================================
create policy fee_structures_select on fee_structures for select using (auth.role() = 'authenticated');
create policy fee_structures_write on fee_structures for all
using (current_user_has_role('school_admin') or current_user_has_role('accountant'))
with check (current_user_has_role('school_admin') or current_user_has_role('accountant'));

create policy invoices_select on invoices for select
using (
  student_id = auth.uid()
  or is_parent_of(student_id)
  or current_user_has_role('school_admin')
  or current_user_has_role('principal')
  or current_user_has_role('accountant')
);
create policy invoices_write on invoices for all
using (current_user_has_role('school_admin') or current_user_has_role('accountant'))
with check (current_user_has_role('school_admin') or current_user_has_role('accountant'));

create policy invoice_items_select on invoice_items for select
using (
  exists (
    select 1 from invoices i
    where i.id = invoice_items.invoice_id
      and (
        i.student_id = auth.uid()
        or is_parent_of(i.student_id)
        or current_user_has_role('school_admin')
        or current_user_has_role('principal')
        or current_user_has_role('accountant')
      )
  )
);
create policy invoice_items_write on invoice_items for all
using (current_user_has_role('school_admin') or current_user_has_role('accountant'))
with check (current_user_has_role('school_admin') or current_user_has_role('accountant'));

create policy payments_select on payments for select
using (
  exists (
    select 1 from invoices i
    where i.id = payments.invoice_id
      and (
        i.student_id = auth.uid()
        or is_parent_of(i.student_id)
        or current_user_has_role('school_admin')
        or current_user_has_role('principal')
        or current_user_has_role('accountant')
      )
  )
);
create policy payments_write on payments for all
using (current_user_has_role('school_admin') or current_user_has_role('accountant'))
with check (current_user_has_role('school_admin') or current_user_has_role('accountant'));

-- =========================================
-- TIMETABLE / ANNOUNCEMENTS / SETTINGS
-- =========================================
create policy timetable_select on timetable_slots for select using (auth.role() = 'authenticated');
create policy timetable_write on timetable_slots for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));

create policy announcements_select on announcements for select using (auth.role() = 'authenticated');
create policy announcements_write on announcements for all
using (current_user_has_role('school_admin') or current_user_has_role('principal'))
with check (current_user_has_role('school_admin') or current_user_has_role('principal'));

create policy school_settings_select on school_settings for select using (auth.role() = 'authenticated');
create policy school_settings_write on school_settings for all
using (current_user_has_role('school_admin')) with check (current_user_has_role('school_admin'));