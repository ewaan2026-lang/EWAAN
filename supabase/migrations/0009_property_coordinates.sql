-- إحداثيات العقار (خط العرض/الطول) لعرضها على الخريطة.
alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
