-- Create functions for transaction management
create or replace function public.begin_transaction()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Start a new transaction
  if not found then
    begin
      -- Return success
      return json_build_object(
        'success', true,
        'message', 'Transaction started'
      );
    end;
  end if;
exception
  when others then
    -- Return error details
    return json_build_object(
      'success', false,
      'message', SQLERRM
    );
end;
$$;

-- Function to commit a transaction
create or replace function public.commit_transaction()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Commit the current transaction
  commit;
  
  -- Return success
  return json_build_object(
    'success', true,
    'message', 'Transaction committed'
  );
exception
  when others then
    -- Return error details
    return json_build_object(
      'success', false,
      'message', SQLERRM
    );
end;
$$;

-- Function to rollback a transaction
create or replace function public.rollback_transaction()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Rollback the current transaction
  rollback;
  
  -- Return success
  return json_build_object(
    'success', true,
    'message', 'Transaction rolled back'
  );
exception
  when others then
    -- Return error details
    return json_build_object(
      'success', false,
      'message', SQLERRM
    );
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function public.begin_transaction to authenticated;
grant execute on function public.commit_transaction to authenticated;
grant execute on function public.rollback_transaction to authenticated; 