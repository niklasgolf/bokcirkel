import "./style.css";

import { ConvexClient } from "convex/browser";

import { api } from "../convex/_generated/api";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="site-shell">

    <aside class="sidebar">

      <div class="site-title">
        Bokcirkeln
      </div>

      <nav class="menu" id="menu"></nav>

    </aside>

    <main class="page-area">

      <section class="page-card">

        <h1 id="page-title">
          Laddar...
        </h1>

        <div id="content"></div>

      </section>

    </main>

  </div>
`;

const pageTitle =
  document.querySelector<HTMLHeadingElement>("#page-title")!;

const content =
  document.querySelector<HTMLDivElement>("#content")!;

const menu =
  document.querySelector<HTMLElement>("#menu")!;

convex.onUpdate(
  api.pages.getPages,
  {},
  (pages) => {

    const sortedPages =
      [...pages].sort((a, b) => a.order - b.order);

    menu.innerHTML = "";

    sortedPages.forEach((page) => {

      const button =
        document.createElement("button");

      button.className = "menu-link";

      button.dataset.slug =
        page.slug;

      button.textContent =
        page.title;

      if (page.slug === "hem") {
        button.classList.add("active");
      }

      menu.appendChild(button);

    });

    const homePage =
      sortedPages.find(
        (page) => page.slug === "hem"
      );

    if (!homePage) {

      pageTitle.textContent =
        "Sidan Hem finns inte";

      return;

    }

    pageTitle.textContent =
      homePage.title;

    convex.onUpdate(
      api.contentBlocks.getContentBlocks,
      {
        pageId: homePage._id
      },
      (blocks) => {

        const sortedBlocks =
          [...blocks].sort(
            (a, b) => a.order - b.order
          );

        content.innerHTML = "";

        sortedBlocks.forEach((block) => {

          const paragraph =
            document.createElement("p");

          paragraph.textContent =
            block.text;

          content.appendChild(paragraph);

        });

      }
    );

  }
);