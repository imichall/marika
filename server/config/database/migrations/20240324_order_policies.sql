-- Drop existing policies
drop policy if exists "Admins can view all orders" on ticket_orders;
drop policy if exists "Admins can update orders" on ticket_orders;

-- Create new policies for ticket_orders table
create policy "Orders are viewable by users with view permission"
  on ticket_orders for select
  using (
    exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'orders'
      and p.action = 'view'
    )
  );

create policy "Orders are editable by users with edit permission"
  on ticket_orders for update
  using (
    exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'orders'
      and p.action in ('edit', 'complete', 'cancel')
    )
  );