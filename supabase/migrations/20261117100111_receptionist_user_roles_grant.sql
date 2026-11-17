create policy user_roles_receptionist_write on user_roles for insert
with check (
  current_user_has_role('receptionist')
  and exists (
    select 1 from roles r
    where r.id = role_id and r.name in ('student', 'parent')
  )
);