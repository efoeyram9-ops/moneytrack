-- Keep profile preference columns aligned with the Settings form.
alter table public.profiles
  add column if not exists currency_symbol text not null default 'GH₵';

alter table public.profiles drop constraint if exists profiles_date_format_check;

update public.profiles
set currency_symbol = case currency
  when 'USD' then '$'
  when 'EUR' then '€'
  when 'GBP' then '£'
  when 'NGN' then '₦'
  else 'GH₵'
end;

update public.profiles
set date_format = case date_format
  when 'DD/MM/YYYY' then 'dd/MM/yyyy'
  when 'MM/DD/YYYY' then 'MM/dd/yyyy'
  when 'YYYY-MM-DD' then 'yyyy-MM-dd'
  else date_format
end;

alter table public.profiles
  add constraint profiles_date_format_check
  check (date_format in ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'));