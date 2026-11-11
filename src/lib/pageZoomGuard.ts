/* The app is a fixed full-screen layout with a zoom of its own (the canvas).
   When WebKit zooms the page itself instead, the visual viewport scrolls and
   every fixed bar slides up under the iPadOS menu or status bar, where it
   stays until a reload. The stage already claims touch pinches that land on
   it; this covers the rest: a trackpad pinch on iPadOS arrives as WebKit
   gesture events, and so does a touch pinch that starts on the chrome.
   (touch-action in styles.css covers double tap and touch pinch, and the
   viewport meta caps the scale where WebKit honours it.) */
export function installPageZoomGuard() {
  const block = (e: Event) => e.preventDefault()
  for (const type of ['gesturestart', 'gesturechange', 'gestureend'])
    document.addEventListener(type, block, { passive: false })
}
