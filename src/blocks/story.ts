import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'

import { validateSafeHref } from '@/lib/safeHref'
import { validateVideoUrl } from '@/lib/video'

/**
 * Story blocks (Build Spec › Story blocks): six blocks shared unchanged by projects (P1) and
 * posts (P2). Admin labels are the block names only: Payload numbers each row itself, so the
 * Studio reads "01 · Chapter heading" as in capture 23 (P6; the number was doubled before). Image blocks
 * never ask for alt text: it comes from the media doc.
 */

const chapter: Block = {
  slug: 'chapter',
  interfaceName: 'ChapterBlock',
  labels: { singular: 'Chapter heading', plural: 'Chapter headings' },
  fields: [{ name: 'heading', type: 'text', required: true }],
}

/**
 * Rich text with paragraphs, bold, italic, links and lists only: the Text block's body, reused by
 * About's sections (P4). Render it with the safe link converters in StoryBlocks.
 */
export const safeRichTextEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({
      // Custom URLs only, no internal document links.
      enabledCollections: [],
      // Lexical's own check accepts javascript: links; only http(s), mailto: and "/" paths
      // may be saved (invariant 13). Link validations also run on every document save.
      fields: ({ defaultFields }) => {
        for (const field of defaultFields) {
          if (field.type === 'text' && field.name === 'url' && !field.hasMany) {
            field.validate = validateSafeHref
          }
        }
        return defaultFields
      },
    }),
    InlineToolbarFeature(),
  ],
})

const text: Block = {
  slug: 'text',
  interfaceName: 'TextBlock',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [{ name: 'body', type: 'richText', required: true, editor: safeRichTextEditor }],
}

const image: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'width',
      type: 'select',
      required: true,
      defaultValue: 'contained',
      options: [
        { label: 'Contained', value: 'contained' },
        { label: 'Full-bleed', value: 'full-bleed' },
      ],
    },
    {
      name: 'aspect',
      type: 'select',
      required: true,
      defaultValue: 'original',
      options: ['4:5', '3:2', '16:9', '21:9', 'original'].map((value) => ({
        label: value === 'original' ? 'Original' : value,
        value,
      })),
    },
    { name: 'caption', type: 'text' },
  ],
}

const gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      minRows: 2,
      required: true,
    },
    {
      name: 'aspect',
      type: 'select',
      required: true,
      defaultValue: '4:5',
      options: ['4:5', '3:2', '1:1'].map((value) => ({ label: value, value })),
    },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'strip',
      options: [
        { label: 'Strip', value: 'strip' },
        { label: 'Pair', value: 'pair' },
      ],
    },
  ],
}

const video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: validateVideoUrl,
      admin: { description: 'A Vimeo or YouTube link. Nothing loads from them until the visitor presses play.' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional still shown before play. Without one, the frame shows a plain dark tint.',
      },
    },
    { name: 'caption', type: 'text' },
  ],
}

const quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
  ],
}

export const storyBlocks: Block[] = [chapter, text, image, gallery, video, quote]

/** The `story` blocks field used by projects and posts. */
export const storyField: Field = {
  name: 'story',
  type: 'blocks',
  blocks: storyBlocks,
}
