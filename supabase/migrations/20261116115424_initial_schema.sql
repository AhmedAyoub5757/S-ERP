-- =========================================
-- ENUMS
-- =========================================
create type user_status as enum ('active', 'inactive', 'suspended');
create type student_status as enum ('active', 'inactive', 'graduated', 'transferred');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type invoice_status as enum ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('cash', 'bank_transfer', 'card', 'cheque', 'online');
create type fee_frequency as enum ('monthly', 'term', 'annual', 'one_time');
create type application_status as enum ('pending', 'approved', 'rejected', 'enrolled');
create type announcement_audience as enum ('all', 'teachers', 'students', 'parents', 'specific_class', 'specific_section');
create type gender_type as enum ('male', 'female', 'other');

-- =========================================
-- SHARED: updated_at trigger function
-- =========================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================
-- IDENTITY & ROLES
-- =========================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create table roles (
  id smallserial primary key,
  name text not null unique,
  description text
);

insert into roles (name, description) values
  ('school_admin', 'Full school management'),
  ('principal', 'School-wide monitoring and reports'),
  ('teacher', 'Class/subject teaching staff'),
  ('accountant', 'Fee and financial management'),
  ('receptionist', 'Admissions and front-desk operations'),
  ('student', 'Enrolled student'),
  ('parent', 'Parent/guardian of enrolled student(s)');

create table user_roles (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  role_id smallint not null references roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);
create index idx_user_roles_user_id on user_roles(user_id);
create index idx_user_roles_role_id on user_roles(role_id);

-- =========================================
-- ACADEMIC STRUCTURE
-- =========================================
create table academic_years (
  id serial primary key,
  name text not null unique,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create unique index idx_one_current_academic_year
  on academic_years (is_current)
  where is_current = true;

create table classes (
  id serial primary key,
  academic_year_id int not null references academic_years(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  unique (academic_year_id, name)
);

create table sections (
  id serial primary key,
  class_id int not null references classes(id) on delete cascade,
  name text not null,
  capacity int,
  class_teacher_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (class_id, name)
);
create index idx_sections_class_id on sections(class_id);

create table subjects (
  id serial primary key,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table class_subjects (
  id serial primary key,
  class_id int not null references classes(id) on delete cascade,
  subject_id int not null references subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id)
);
create index idx_class_subjects_class_id on class_subjects(class_id);

create table teacher_assignments (
  id bigserial primary key,
  teacher_id uuid not null references profiles(id) on delete cascade,
  subject_id int not null references subjects(id) on delete cascade,
  section_id int not null references sections(id) on delete cascade,
  academic_year_id int not null references academic_years(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, subject_id, section_id, academic_year_id)
);
create index idx_teacher_assignments_teacher on teacher_assignments(teacher_id);
create index idx_teacher_assignments_section on teacher_assignments(section_id);

-- =========================================
-- PEOPLE
-- =========================================
create table teachers (
  id uuid primary key references profiles(id) on delete cascade,
  employee_number text not null unique,
  qualification text,
  joining_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key references profiles(id) on delete cascade,
  admission_number text not null unique,
  section_id int not null references sections(id) on delete restrict,
  admission_date date not null default current_date,
  date_of_birth date not null,
  gender gender_type not null,
  blood_group text,
  address text,
  status student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_students_updated_at before update on students
  for each row execute function set_updated_at();
create index idx_students_section_id on students(section_id);

create table parents (
  id uuid primary key references profiles(id) on delete cascade,
  occupation text,
  created_at timestamptz not null default now()
);

create table parent_students (
  id bigserial primary key,
  parent_id uuid not null references parents(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  relationship text not null,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id)
);
create index idx_parent_students_parent on parent_students(parent_id);
create index idx_parent_students_student on parent_students(student_id);

create table admission_applications (
  id bigserial primary key,
  applicant_name text not null,
  date_of_birth date not null,
  gender gender_type not null,
  guardian_name text not null,
  guardian_phone text not null,
  guardian_email text,
  applying_for_class_id int not null references classes(id) on delete restrict,
  status application_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_admission_applications_status on admission_applications(status);

-- =========================================
-- ATTENDANCE & EXAMINATIONS
-- =========================================
create table attendance (
  id bigserial primary key,
  student_id uuid not null references students(id) on delete cascade,
  section_id int not null references sections(id) on delete cascade,
  date date not null,
  status attendance_status not null,
  marked_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);
create index idx_attendance_section_date on attendance(section_id, date);
create index idx_attendance_student on attendance(student_id);

create table examinations (
  id serial primary key,
  academic_year_id int not null references academic_years(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table exam_subjects (
  id bigserial primary key,
  examination_id int not null references examinations(id) on delete cascade,
  subject_id int not null references subjects(id) on delete cascade,
  class_id int not null references classes(id) on delete cascade,
  exam_date date not null,
  max_marks numeric(6,2) not null check (max_marks > 0),
  passing_marks numeric(6,2) not null check (passing_marks >= 0),
  created_at timestamptz not null default now(),
  unique (examination_id, subject_id, class_id),
  check (passing_marks <= max_marks)
);

create table marks (
  id bigserial primary key,
  exam_subject_id bigint not null references exam_subjects(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  marks_obtained numeric(6,2) not null check (marks_obtained >= 0),
  remarks text,
  entered_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_subject_id, student_id)
);
create trigger trg_marks_updated_at before update on marks
  for each row execute function set_updated_at();
create index idx_marks_student on marks(student_id);

create or replace function validate_marks_within_max()
returns trigger as $$
declare
  v_max numeric(6,2);
begin
  select max_marks into v_max from exam_subjects where id = new.exam_subject_id;
  if new.marks_obtained > v_max then
    raise exception 'marks_obtained (%) cannot exceed max_marks (%) for this exam subject', new.marks_obtained, v_max;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_validate_marks
  before insert or update on marks
  for each row execute function validate_marks_within_max();

-- =========================================
-- FEES & FINANCE
-- =========================================
create table fee_structures (
  id serial primary key,
  academic_year_id int not null references academic_years(id) on delete cascade,
  class_id int not null references classes(id) on delete cascade,
  name text not null,
  amount numeric(10,2) not null check (amount > 0),
  frequency fee_frequency not null,
  created_at timestamptz not null default now()
);
create index idx_fee_structures_class on fee_structures(class_id);

create table invoices (
  id bigserial primary key,
  student_id uuid not null references students(id) on delete cascade,
  invoice_number text not null unique,
  issue_date date not null default current_date,
  due_date date not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  status invoice_status not null default 'unpaid',
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= issue_date)
);
create trigger trg_invoices_updated_at before update on invoices
  for each row execute function set_updated_at();
create index idx_invoices_student on invoices(student_id);
create index idx_invoices_status on invoices(status);

create table invoice_items (
  id bigserial primary key,
  invoice_id bigint not null references invoices(id) on delete cascade,
  fee_structure_id int not null references fee_structures(id) on delete restrict,
  description text,
  amount numeric(10,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);
create index idx_invoice_items_invoice on invoice_items(invoice_id);

create table payments (
  id bigserial primary key,
  invoice_id bigint not null references invoices(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  payment_date date not null default current_date,
  payment_method payment_method not null,
  reference_number text,
  received_by uuid not null references profiles(id) on delete restrict,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_payments_invoice on payments(invoice_id);

-- =========================================
-- SCHEDULING & COMMUNICATION
-- =========================================
create table timetable_slots (
  id bigserial primary key,
  academic_year_id int not null references academic_years(id) on delete cascade,
  section_id int not null references sections(id) on delete cascade,
  subject_id int not null references subjects(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete restrict,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (section_id, day_of_week, start_time),
  unique (teacher_id, day_of_week, start_time)
);
create index idx_timetable_section on timetable_slots(section_id);
create index idx_timetable_teacher on timetable_slots(teacher_id);

create table announcements (
  id bigserial primary key,
  title text not null,
  content text not null,
  created_by uuid not null references profiles(id) on delete restrict,
  audience announcement_audience not null default 'all',
  target_class_id int references classes(id) on delete cascade,
  target_section_id int references sections(id) on delete cascade,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_announcements_audience on announcements(audience);
create index idx_announcements_published on announcements(published_at);

-- =========================================
-- SETTINGS
-- =========================================
create table school_settings (
  id smallint primary key default 1,
  school_name text not null,
  address text,
  phone text,
  email text,
  logo_url text,
  current_academic_year_id int references academic_years(id),
  updated_at timestamptz not null default now(),
  check (id = 1)
);
create trigger trg_school_settings_updated_at before update on school_settings
  for each row execute function set_updated_at();

-- =========================================
-- ENABLE RLS ON EVERYTHING (no policies yet — locks all tables down)
-- =========================================
alter table profiles enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table academic_years enable row level security;
alter table classes enable row level security;
alter table sections enable row level security;
alter table subjects enable row level security;
alter table class_subjects enable row level security;
alter table teacher_assignments enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
alter table parents enable row level security;
alter table parent_students enable row level security;
alter table admission_applications enable row level security;
alter table attendance enable row level security;
alter table examinations enable row level security;
alter table exam_subjects enable row level security;
alter table marks enable row level security;
alter table fee_structures enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table timetable_slots enable row level security;
alter table announcements enable row level security;
alter table school_settings enable row level security;