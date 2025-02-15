-- Drop existing policies
drop policy if exists "Orders are editable by users with edit permission" on ticket_orders;

-- Create new policies for ticket_orders table
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
      and (
        -- Pokud má uživatel oprávnění 'edit', může upravovat vše
        p.action = 'edit'
        -- Pokud má uživatel oprávnění 'complete', může označit jako dokončené
        or (p.action = 'complete' and new.payment_status = 'completed')
        -- Pokud má uživatel oprávnění 'cancel', může zrušit objednávku
        or (p.action = 'cancel' and new.payment_status = 'cancelled')
      )
    )
  );