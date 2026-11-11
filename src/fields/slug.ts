import { slugField, type Field, type FieldHook } from 'payload'

import { toSlug, validateSlug } from '@/lib/slug'

/**
 * Payload's slugField generates the slug in a beforeChange hook, but field validation runs
 * alongside those hooks, so a published create without a slug fails "required" (P1 traps).
 * Filling it during beforeValidate gives the same slug Payload would generate, just in time.
 */
const fillSlugOnCreate =
  (useAsSlug: string): FieldHook =>
  ({ data, operation, value }) => {
    if (operation !== 'create' || (typeof value === 'string' && value !== '')) return value
    return toSlug(data?.[useAsSlug]) || value
  }

/**
 * The URL slug (generated from `useAsSlug` on first save, editable, unique, sidebar) plus the
 * hidden `previousSlugs` list that old URLs 308-redirect from (P1 owner decision, 2026-11-10).
 * Shared by disciplines, projects and posts. Collections without pages of their own (categories)
 * pass `previousSlugs: false`: nothing redirects from their old slugs.
 */
export const slugFields = (
  useAsSlug: string,
  { previousSlugs = true }: { previousSlugs?: boolean } = {},
): Field[] => [
  slugField({
    useAsSlug,
    slugify: ({ valueToSlugify }) => toSlug(valueToSlugify) || undefined,
    // slugField builds a fresh row on every call, so changing its slug field in place is safe.
    overrides: (row) => {
      for (const field of row.fields) {
        if (field.type === 'text' && field.name === 'slug' && !field.hasMany) {
          field.validate = validateSlug
          field.hooks = {
            ...field.hooks,
            beforeValidate: [...(field.hooks?.beforeValidate ?? []), fillSlugOnCreate(useAsSlug)],
          }
        }
      }
      return row
    },
  }),
  ...(previousSlugs
    ? [
        {
          name: 'previousSlugs',
          type: 'text',
          hasMany: true,
          // Written by the publish hooks only; never edited by hand.
          admin: { hidden: true },
        } satisfies Field,
      ]
    : []),
]
