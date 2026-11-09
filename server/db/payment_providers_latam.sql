-- Retire providers whose connector is removed, including any stored credentials.
delete from public.saas_metrics_cache
where saas_id in (
  select id from public.saas_entries
  where provider_id in (
    select id from public.payment_providers where slug in ('culqi', 'flow')
  )
);

update public.saas_entries
set provider_id = null, provider_key_encrypted = null, mrr = null, revenue = null
where provider_id in (
  select id from public.payment_providers where slug in ('culqi', 'flow')
);

delete from public.payment_providers where slug in ('culqi', 'flow');

-- Idempotent catalogue seed.
insert into public.payment_providers (slug, name)
values
  ('conekta', 'Conekta'),
  ('epayco', 'ePayco'),
  ('polar', 'Polar'),
  ('dodo', 'Dodo Payments'),
  ('paddle', 'Paddle'),
  ('revenuecat', 'RevenueCat')
on conflict (slug) do nothing;
