import buildLoadingIndicator from "./loadingIndicator";

export default function (
  cache,
  containerSelector,
  defaultAnimation,
  loadingIndicator,
  primaryLIColor,
  secondaryLIColor,
  secondaryLoadingIndicator
) {
  const buildPage = `${
    containerSelector
      ? `d.querySelector("${containerSelector}").replaceWith(doc.querySelector("${containerSelector}"));
      d.head.replaceWith(doc.head);`
      : "d.documentElement.replaceWith(doc.documentElement);"
  }
  [
    ...d.${
      containerSelector
        ? `querySelectorAll("head script, ${containerSelector} script")`
        : "scripts"
    }
  ].forEach((script) => {
    const newScript = d.createElement("script");
    newScript.textContent = script.textContent;
    for (const attr of script.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    script.replaceWith(newScript);
  });
  w.onMount && onMount();
  ${
    defaultAnimation
      ? `d.documentElement.animate(
      {
      opacity: [0, 1],
      },
      1000
  );`
      : ""
  }`;
  return `const constructPage = async () => {
    w.onNavigate && onNavigate();

    ${buildLoadingIndicator(
      loadingIndicator,
      primaryLIColor,
      secondaryLIColor,
      secondaryLoadingIndicator
    )}

    const cachedPage = ${
      cache
        ? `(await cache.match(l.href)) ||
            (await (cachePage(l.href))) ||
            (await cache.match(l.href));`
        : "(await fetch(l.href));"
    }

    const html = await cachedPage.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    ${
      loadingIndicator
        ? `clearInterval(intervalID);
        progressBar.animate({ width: [pbw + "vw", "100vw"] }, 100).onfinish =
        () => {
            ${buildPage}
        };`
        : secondaryLoadingIndicator
        ? `clearInterval(intervalID);
          ${buildPage};`
        : buildPage
    }
    };`;
}
