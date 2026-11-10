# VideoEmbed

## Purpose

A YouTube or Vimeo video that loads only when the visitor clicks play. Until then, no request goes to YouTube, Vimeo or their image hosts (owner decision 2026-11-10). Source: capture 07 and the Build Spec section "Story blocks › video".

## Anatomy

`<figure>`, full width of the story column:

1. **Frame:** 16:9 (`aspect-ratio: 16 / 9`), positioned.
   - With a poster: MediaImage `16:9` of the poster.
   - Without one: the tinted surface `--color-surface-opener`. There is no provider thumbnail (owner decision 2026-11-10; this replaces the Build Spec's "poster or the provider's thumbnail").
2. **Play button**, centred on the frame:
   - `<button type="button">`, `--play-size` square, `--radius-pill`;
   - background `--color-play-scrim`, border `--border-hairline` `--color-outline-on-dark`;
   - icon colour `--color-on-dark-heading`; the icon is an inline SVG triangle, `--space-6` tall, `aria-hidden`.
3. **Caption** (optional): `<figcaption>` in `--fs-caption`, `--color-text-muted`, `--space-2` below.
4. **After the click:** an `<iframe>` replaces the frame and button, filling the 16:9 box.
   - `src`: the embed URL built server-side from the allowlist, plus `autoplay=1`.
   - `title`: the caption, else "Video" (`copy.ts`).
   - `allow="autoplay; fullscreen; picture-in-picture"`, `allowfullscreen`, `referrerpolicy="strict-origin-when-cross-origin"`.

Embed URLs: YouTube uses `https://www.youtube-nocookie.com/embed/<id>`; Vimeo uses `https://player.vimeo.com/video/<id>?dnt=1`. The editor's raw URL is never used as `src`.

## Variants

- With poster.
- Without poster (tinted frame).

## Sizes

One. The frame stays 16:9 at every width.

## States

- **Default:** frame, play button and caption.
- **Hover / active:** the button background changes to `--color-surface-finale` (opaque ink). Colour transition `--duration-fast`, none under `prefers-reduced-motion`.
- **Focus-visible:** the global dual focus ring; the bone halo shows on the dark frame and on light posters.
- **Loaded:** the iframe has replaced the frame, and focus moves to the iframe.
- Disabled and error do not apply. Playback errors are shown by the provider's player inside the iframe.

## Props/API

```ts
type VideoEmbedProps = {
  embedUrl: string // from parseVideoUrl (src/lib/video.ts), allowlisted
  poster?: Media | null
  caption?: string | null
}
```

Client component (`'use client'`), one of the only two on the public site.

## Accessibility

- Icon-only button, so `aria-label` is "Play video", or "Play video: {caption}" (`copy.ts`).
- Keyboard: Tab to the button; Enter or Space loads the video and moves focus into the player.
- Non-text contrast (3:1 required):
  - icon on the scrim: 3.2:1 over a bone poster, 3.0:1 over a white poster, 14.1:1 over the tinted frame;
  - the button edge stays visible against light posters through the scrim (3.4:1 against white) and against the tinted frame through the bone-70 border (7.6:1).
- Button target `--play-size` (88 px); `touch-action: manipulation`.

## Responsive

Fluid width, constant 16:9, no horizontal scroll.

## Usage

The story `video` block only. Never add a `<link rel="preconnect">` or a thumbnail fetch for the providers: that would break the privacy rule.

## Preview

[Open preview](../preview/index.html)
