
-- Add status column to email_accounts if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'email_accounts' and column_name = 'status') then
        alter table public.email_accounts add column status text default 'active';
    end if;
end $$;
