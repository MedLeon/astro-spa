export default function (
  prefetch,
  prefetchUpgradation,
  highPriorityPrefetch,
  cache
) {
  return `w.observe = async (anchor) => {
    const { href } = anchor;
    const navigateCallback = (e) => {
      if (!e.ctrlKey) {
        e.preventDefault();
        navigate(href);
      }
    };

    anchor.onclick = (e) => {navigateCallback(e)};
    anchor.onkeydown = (e) => {navigateCallback(e)}
  
    ${
      prefetch
        ? `if (!anchor.hasAttribute("data-spa-no-prefetch")) {
          if (!(await detectDataSaverAndCache(href))) {
            ${
              highPriorityPrefetch
                ? cache
                  ? "cachePage(href)"
                  : "fetch(href)"
                : `anchor.hasAttribute("data-spa-high-priority-prefetch")
                ? ${cache ? "cachePage(href)" : "fetch(href)"}
                : observer.observe(anchor)`
            }
          }
        
          const callback = async () => {
            if (!(await detectDataSaverAndCache(href))) {
              ${
                prefetchUpgradation
                  ? `anchor.hasAttribute("data-spa-no-prefetch-upgradation")
                      ? prefetch(href)
                      : ${cache ? "cachePage(href);" : "fetch(href)"}`
                  : "prefetch(href)"
              }
            }
          };
        
          anchor.onmouseover = callback;
          anchor.ontouchstart = callback;
        }`
        : ""
    }
  };`;
}
