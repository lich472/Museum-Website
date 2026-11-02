import { useEffect } from "react";

/**
 * The site name, and the suffix appended to every page title. Kept in one place
 * so the suffix is identical on every route ("Exhibitions · Regional Museum").
 */
const SITE_NAME = "Regional Museum";
const SITE_SUFFIX = `· ${SITE_NAME}`;

/**
 * Sets `document.title` for the page that calls it.
 *
 * The title lives on the page rather than on the route because a detail page
 * is the only thing that knows which record it loaded: `/exhibitions/:id`
 * cannot be titled by the router without fetching the exhibition again.
 *
 * The effect re-runs whenever `title` changes, which is how the detail pages
 * go from a placeholder ("Exhibition") to the real name once their fetch
 * lands, and its cleanup restores the title that was in place before, so
 * leaving a page does not strand that page's title on the next one.
 */
export function usePageTitle(title: string | null | undefined): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} ${SITE_SUFFIX}` : SITE_NAME;

    return () => {
      document.title = previous;
    };
  }, [title]);
}

export default usePageTitle;
