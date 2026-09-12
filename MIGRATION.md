# Database Migration Guide: From Flat Table to Multi-Tenant Relational Schema

This document details the transition from the legacy single-tenant `reviews` flat table to the secure multi-tenant architecture introduced in Phase 1.

---

## 1. What Changed?

| Entity | Previous State (Phase 0) | New State (Phase 1) |
| :--- | :--- | :--- |
| **Tenancy** | Single shared database | Isolated `workspaces` and `projects` per `auth.users` |
| **Ownership** | No foreign keys | `workspaces.owner_id -> auth.users.id`, `projects.workspace_id -> workspaces.id` |
| **Testimonials** | Stored globally in flat `reviews` table | Linked to `projects.id` and optional `collection_forms.id` |
| **Collection** | In-app view tab (`/`) | Dedicated public route `/c/:collectionSlug` backed by `collection_forms` |
| **RLS Policies** | Broad `USING (true)` for all authenticated | Strict path back to `auth.uid() = workspace.owner_id` |

---

## 2. Safe Migration Script for Existing Data

If you have existing reviews in a PostgreSQL / Supabase database, run this migration sequence in your Supabase SQL Editor:

```sql
-- Step 1: Create workspaces, projects, and collection_forms tables
-- (Run lines 20-72 of schema.sql)

-- Step 2: Assign existing orphan reviews to a designated migration workspace
DO $$
DECLARE
    admin_user_id UUID;
    migrated_workspace_id UUID;
    migrated_project_id UUID;
    migrated_form_id UUID;
BEGIN
    -- Select the first admin user or replace with your target UUID:
    SELECT id INTO admin_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Create migration workspace
        INSERT INTO workspaces (owner_id, name, slug)
        VALUES (admin_user_id, 'Migrated Workspace', 'migrated-workspace')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO migrated_workspace_id;

        -- Create migration project
        INSERT INTO projects (workspace_id, name, slug)
        VALUES (migrated_workspace_id, 'Legacy Testimonials', 'legacy-testimonials')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO migrated_project_id;

        -- Create collection form
        INSERT INTO collection_forms (project_id, public_slug, title)
        VALUES (migrated_project_id, 'legacy-feedback', 'Feedback Form')
        ON CONFLICT (public_slug) DO UPDATE SET title = EXCLUDED.title
        RETURNING id INTO migrated_form_id;

        -- Step 3: Add project_id and collection_form_id columns if missing
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS collection_form_id UUID REFERENCES collection_forms(id) ON DELETE SET NULL;

        -- Step 4: Associate orphan reviews
        UPDATE reviews 
        SET project_id = migrated_project_id, collection_form_id = migrated_form_id
        WHERE project_id IS NULL;

        -- Step 5: Enforce NOT NULL constraint
        ALTER TABLE reviews ALTER COLUMN project_id SET NOT NULL;
    END IF;
END $$;
```

---

## 3. Demo Data vs Production Data Separation

In Phase 1, `INITIAL_REVIEWS` in `src/lib/seedData.ts` is strictly isolated for development/demo exploration. When a user creates an account, their project starts clean (0 testimonials). They can optionally click **"Seed Sample Reviews"** in their dashboard to test widgets without commingling mock reviews with production records.
