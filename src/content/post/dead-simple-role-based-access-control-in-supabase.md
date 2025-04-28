---
layout: ../../layouts/post.astro
title: "Dead simple Role-based access control in supabase"
description: "So it looks like my simple solution to RBAC in supabase got some traction on twitter and was featured in Supabase community highlights. Here's a more detailed explanation."
dateFormatted: "August 22, 2023"
heroImage: "/assets/images/posts/supabase-rbac.png"
---

*So it looks like my simple solution to RBAC in supabase got some traction on twitter and was featured in Supabase community highlights. Here's a more detailed explanation.*

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🌠 Community Highlights <br><br>Dead simple Role-based access control in Supabase.<br><br>By @notMichal_.<a href="https://t.co/i4ekvk2pDu">https://t.co/i4ekvk2pDu</a> <a href="https://t.co/yiIIP4x1ae">pic.twitter.com/yiIIP4x1ae</a></p>&mdash; Supabase (@supabase) <a href="https://twitter.com/supabase/status/1713963289544188065?ref_src=twsrc%5Etfw">October 16, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 1. Defining Roles

For a more human-friendly approach to referencing roles, you can create a custom enum type:

```sql
CREATE TYPE user_role AS ENUM ('spots_moderator', 'admin');
```

## 2. Setting Up the “user_roles” Table

The user_roles table allows us to link roles with users. To ensure the security of user_roles, enable Row-Level Security (RLS) and implement the policy:

![](/assets/images/posts/supa_1.webp)

To secure user_roles enable RLS (Row-level security) and add following policy auth.uid() = user_id

![](/assets/images/posts/supa_2.webp)

This policy grants authenticated users access to read the roles they possess.

**Key points:**

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

![](/assets/images/posts/supa_3.webp)

**Key points:**

- `user_roles` has an RLS policy, allowing authenticated users to read their roles
- The RLS policy on `spot_proposals` restricts access to specific roles, such as `spots_moderator`

This setup ensures a straightforward yet effective role-based access control mechanism in Supabase.
