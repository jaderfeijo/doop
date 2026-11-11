# iPad home-screen web app: top safe area

Notes on running Doop as a home-screen web app on iPadOS 26+ (windowed, with
the menu bar), what this fork changed, and what is still open. Investigation
paused on 2026-11-11.

## What works

Content no longer sits under the status/menu bar.

- `index.html`: the viewport meta has `viewport-fit=cover`, so
  `env(safe-area-inset-top)` is published to the page.
- `src/styles.css`: `--safe-top` is the inset plus up to 8px of breathing
  room. `--app-inset` defaults to it.
- The dashboard columns (`dash-sidebar`, `dash-main`) and the auth screen take
  `--safe-top` as a transparent top border. Content starts below the bar, and
  each column's background still runs to the top edge.
- `src/App.tsx`: the impersonation banner and the canvas chrome offsets
  (`--app-inset`) add `--safe-top`.

Commits: `02e89c8`, `e332a06`.

## Page zoom guard

When WebKit zooms the page itself, the visual viewport scrolls and every fixed
bar on the canvas slides up under the menu bar. It stays there until a reload.
In an iPad simulator, a 1.15× page zoom put the canvas layer at −50px.

The guard (commit `b30bd10`):

- the viewport meta caps `maximum-scale=1.0`
- `touch-action: pan-x pan-y` on `html`
- `src/lib/pageZoomGuard.ts` cancels WebKit `gesture*` events (trackpad
  pinch, and touch pinch that starts on the chrome)

The stage keeps its own touch-pinch zoom. With the guard in place, the
simulator could no longer zoom the page.

## Still open

1. **Home: dark band under the menu bar.** A dark strip sits under the bar,
   and the sidebar's grey fades in over about 45pt below it. Reloading does
   not change it. Doop's CSS does not draw this. The likely cause is the
   backdrop iPadOS paints behind the menu bar of a web app, using one colour
   sampled from the page. That can't match two columns of different colours.
2. **Canvas: offset until View → Reload.** On a real iPad the canvas sometimes
   opens wrong. Reloading with the keyboard does not fix it, but View → Reload
   from the menu bar does. Doop only binds ⌘⌥R, not plain ⌘R, so the code
   doesn't explain why the two reloads differ. The before and after
   screenshots looked the same at the resolution we had, so the exact symptom
   is not yet pinned down.

## Tried without effect

- **`apple-mobile-web-app-status-bar-style: black-translucent`** (plus
  `apple-mobile-web-app-capable`), with the web app removed and added to the
  Home Screen again. Behaviour was identical, so it was reverted. It would
  also have forced white status-bar text in the light theme.

## Testing limits

The simulator harness is a WKWebView app driven headlessly through `simctl`.
It reproduces page layout, safe-area insets and page zoom. It can't reproduce:

- a real home-screen web clip
- windowed mode and the iPadOS menu bar, including the backdrop it draws
- real taps and pinches

Both open issues need a real iPad to check.

## Next ideas, if picked up again

- For the band: give the strip under the menu bar one solid colour across the
  full width, so the system backdrop has a single colour to match.
- For the canvas: get a marked-up screenshot of the bad state. Then log
  `visualViewport` (`offsetTop`, `scale`) and `env(safe-area-inset-top)` on
  load and on resize, to see what differs before and after View → Reload.
