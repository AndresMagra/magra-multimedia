import { track } from './tracking';

/**
 * Scroll-triggered reveals. One observer, unobserve after firing.
 *
 * Fails open by design: the `js-reveal` class (which is what actually hides
 * anything) is only added once IntersectionObserver is confirmed present, and
 * a watchdog reveals everything if the observer somehow never fires. A
 * conversion page must never end up with invisible copy.
 */
export function initReveal(): void {
  const root = document.documentElement;
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (!els.length) return;

  const revealAll = () => els.forEach((el) => el.classList.add('is-in'));

  if (!('IntersectionObserver' in window)) return; // stays visible, never hidden

  root.classList.add('js-reveal');

  let fired = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        fired = true;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  els.forEach((el) => io.observe(el));

  // Watchdog: if nothing has intersected shortly after load, something is
  // wrong with the observer — show everything rather than risk a blank page.
  window.setTimeout(() => {
    if (!fired) revealAll();
  }, 1600);
}

/**
 * Scroll depth. Tells us how far cold ad traffic actually gets before leaving,
 * which is how we learn whether the page is too long or the hook is too weak.
 */
export function initScrollDepth(): void {
  const marks = [25, 50, 75, 90];
  const fired = new Set<number>();

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = (window.scrollY / scrollable) * 100;

    for (const mark of marks) {
      if (pct >= mark && !fired.has(mark)) {
        fired.add(mark);
        track('scroll_depth', { depth: mark });
      }
    }
    if (fired.size === marks.length) window.removeEventListener('scroll', onScroll);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Which FAQ people open is a free read on which objection dominates —
 * and objections are what the next copy revision should target.
 */
export function initFaqTracking(): void {
  document.querySelectorAll<HTMLDetailsElement>('details[data-faq]').forEach((el) => {
    el.addEventListener('toggle', () => {
      if (el.open) track('faq_open', { question: el.dataset.faq });
    });
  });
}
