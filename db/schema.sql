-- Guestbook notes. Run once in the Neon SQL editor, on both the main and dev branches.
-- See docs/superpowers/specs/2026-11-11-guestbook-design.md

create table notes (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 40),
  college_id   text,                       -- null = "Outside the US" / "Didn't go"
  college_none text check (college_none in ('outside_us', 'not_listed')),
  reason       text not null check (reason in
                 ('recruiter','classmate','friend_family','engineer','wandering')),
  reason_note  text check (char_length(reason_note) <= 120),
  feedback     text check (char_length(feedback) <= 1000),
  ip_hash      text not null,
  check ((college_id is null) <> (college_none is null))
);
create index notes_created_at on notes (created_at desc);
create index notes_ip_recent  on notes (ip_hash, created_at desc);
