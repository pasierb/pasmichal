---
title: "Dead simple Role-based access control in Supabase"
description: "So it looks like my simple solution to RBAC in supabase got some traction on twitter and was featured in Supabase community highlights. Here's a more detailed explanation."
pubDate: "2023-08-22"
originalUrl: "https://medium.com/@pasmichal/dead-simple-role-based-access-control-in-supabase-aa6e1c5c9b0"
source: "Medium"
tags: ["supabase", "postgresql", "database", "webdev"]
---

_I posted this as a Twitter thread and it got more attention than I expected (considering my usual standards 😅). Here's a breakdown of how everything comes together._

## 1. Defining Roles

For a more human-friendly approach to referencing roles, you can create a custom enum type:

```sql
CREATE TYPE user_role AS ENUM ('spots_moderator', 'admin');
```

## 2. Setting Up the "user_roles" Table

The `user_roles` table allows us to link roles with users.

![The user_roles table with id, created_at, user_id and role columns, its user_id related to auth.users.id](../../assets/images/posts/supabase-rbac-schema.png)

To secure `user_roles` enable RLS (Row-level security) and add following policy `auth.uid() = user_id`

![Supabase policy editor showing a policy named "Enable read access for user owned roles" on public.user_roles with the USING expression auth.uid() = user_id](../../assets/images/posts/supabase-rbac-user-roles-policy.png)

This policy grants authenticated users access to read the roles they possess.

Key points:

- `user_id` references `auth.users.id`
- The role is based on the `user_role` type (the enum type from step 1.)
- RLS enables reading of roles owned by the user

## 3. Implementing Row-Level Security for Role-Specific Access

You can now control access to specific rows within a table, such as `spot_proposals` in this case, by users with particular roles. This is done by specifying the following RLS condition:

```sql
(auth.uid() IN ( SELECT user_roles.user_id
   FROM user_roles
  WHERE (user_roles.role = 'spots_moderator'::user_role)))
```

![Supabase policy editor showing a policy named "Select for spot moderators" on public.spot_proposals with a USING expression matching auth.uid() against user_roles rows where role is spots_moderator](../../assets/images/posts/supabase-rbac-spot-proposals-policy.png)

Key points:

- `user_roles` has an RLS policy, allowing authenticated users to read their roles
- The RLS policy on `spot_proposals` restricts access to specific roles, such as `spots_moderator`

This setup ensures a straightforward yet effective role-based access control mechanism in Supabase.
