---
title: "pg_repack — full vacuum without table lock"
description: "How to use pg_repack to perform a full vacuum on PostgreSQL tables without locking them."
pubDate: "2017-07-05"
originalUrl: "https://pasmichal.medium.com/pg-repack-full-vacuum-without-table-lock-ca2cbfa1ca1e"
source: "Medium"
tags: ["postgresql", "sql", "database", "maintenance"]
---

In **PostgreSQL**, an UPDATE or DELETE of a row does not immediately remove the old version of the row. If you have application that performs a lot of UPDATE/DELETE operations your database can **grow in size pretty quickly**.

At [IS Engineering](https://isengineering.com/) we develop plant performance monitoring applications which collect hundreds (sometimes thousands) of data points every minute. This "minute-by-minute" data is later compressed into hourly slots. This process involves quite a few DELETE operations every hour.

To reclaim disk space used by deleted records you need **FULL VACUUM** which **locks tables**, huge "no no" in 24–7–365 industry monitoring applications.

[**pg_repack**](https://github.com/reorg/pg_repack) is a PostgreSQL extension tool that can do pretty much what FULL VACUUM does **without locking** (minimum locking to be precise).

## Installation

You can install from [source](https://pgxn.org/dist/pg_repack/) or through pgxn.

```bash
apt-get install pgxnclient postgresql-server-dev-all
pgxn install pg_repack
psql -c "CREATE EXTENSION pg_repack" -d YOUR_DB_NAME -U postgres
```

## Usage

```bash
/usr/lib/postgresql/9.x/bin/pg_repack -d YOUR_DB_NAME -U postgres
```

## Notes

You will need about the same amount of space available as the table being repacked. The reason is that pg_repack is actually creating a fresh copy of table without "dead" space and replacing old one with new (just as FULL VACUUM does)

## P.S.

Of course it does not mean that you should abandon your regularly scheduled vacuuming and reindexing!

## Sources

- [PostgreSQL routine vacuuming documentation](https://www.postgresql.org/docs/9.2/static/routine-vacuuming.html)
- [PostgreSQL vacuum documentation](https://www.postgresql.org/docs/9.1/static/sql-vacuum.html)
- [pg_repack github project](https://github.com/reorg/pg_repack)
- [pg_repack pgxn site](https://pgxn.org/dist/pg_repack/)
