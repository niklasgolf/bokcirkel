import "./style-admin.css";

import { api } from "../convex/_generated/api";
import { convex } from "./convexClient";

export function showAdminSite() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="admin-shell">

      <header class="admin-header">

        <div>
          <div class="admin-small-title">
            Bokcirkeln
          </div>

          <h1>
            Admin
          </h1>
        </div>

        <a
          class="admin-public-link"
          href="/"
        >
          Visa vanliga sidan
        </a>

      </header>


      <main class="admin-main">

        <section class="admin-panel">

          <h2>
            Sidor
          </h2>

          <p class="admin-help">
            Skapa en sida eller välj en sida
            för att ändra innehållet.
          </p>


          <form id="create-page-form">

            <label for="new-page-title">
              Namn på ny sida
            </label>

            <div class="admin-form-row">

              <input
                id="new-page-title"
                type="text"
                placeholder="Till exempel Kommande böcker"
                autocomplete="off"
              >

              <button
                type="submit"
                class="admin-primary-button"
              >
                + Skapa sida
              </button>

            </div>

          </form>


          <div
            id="admin-pages"
            class="admin-page-list"
          ></div>

        </section>


        <section class="admin-panel">

          <h2 id="admin-content-title">
            Innehåll
          </h2>

          <p
            id="admin-content-help"
            class="admin-help"
          >
            Välj en sida till vänster.
          </p>


          <div
            id="admin-content-area"
            class="admin-content-area"
          ></div>

        </section>

      </main>

    </div>
  `;


  const pagesContainer =
    document.querySelector<HTMLDivElement>(
      "#admin-pages"
    )!;

  const contentTitle =
    document.querySelector<HTMLHeadingElement>(
      "#admin-content-title"
    )!;

  const contentHelp =
    document.querySelector<HTMLParagraphElement>(
      "#admin-content-help"
    )!;

  const contentArea =
    document.querySelector<HTMLDivElement>(
      "#admin-content-area"
    )!;

  const createPageForm =
    document.querySelector<HTMLFormElement>(
      "#create-page-form"
    )!;

  const newPageTitle =
    document.querySelector<HTMLInputElement>(
      "#new-page-title"
    )!;


  let currentPages: any[] = [];

  let selectedPageId:
    string | null = null;

  let stopContentSubscription:
    (() => void) | undefined;


  createPageForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const title =
        newPageTitle.value.trim();

      if (!title) {
        alert("Skriv ett namn på sidan.");
        return;
      }


      const slug =
        createSlug(title);


      const slugAlreadyExists =
        currentPages.some(
          (page) =>
            page.slug === slug
        );

      if (slugAlreadyExists) {
        alert(
          "Det finns redan en sida med det namnet."
        );

        return;
      }


      const highestOrder =
        currentPages.reduce(
          (highest, page) =>
            Math.max(
              highest,
              page.order
            ),
          0
        );


      await convex.mutation(
        api.pages.createPage,
        {
          title,
          slug,
          order: highestOrder + 1,
        }
      );


      newPageTitle.value = "";
    }
  );


  convex.onUpdate(
    api.pages.getPages,
    {},
    (pages) => {
      currentPages =
        [...pages].sort(
          (a, b) =>
            a.order - b.order
        );

      renderAdminPages();
    }
  );


  function renderAdminPages() {
    pagesContainer.innerHTML = "";

    if (currentPages.length === 0) {
      pagesContainer.innerHTML = `
        <p>
          Det finns inga sidor ännu.
        </p>
      `;

      return;
    }


    currentPages.forEach((page) => {
      const row =
        document.createElement("div");

      row.className =
        "admin-page-row";


      if (page._id === selectedPageId) {
        row.classList.add(
          "selected"
        );
      }


      const openButton =
        document.createElement("button");

      openButton.className =
        "admin-page-open";

      openButton.textContent =
        page.title;


      openButton.addEventListener(
        "click",
        () => {
          selectPage(page);
        }
      );


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "admin-delete-button";

      deleteButton.textContent =
        "Ta bort";


      deleteButton.addEventListener(
        "click",
        async () => {
          const shouldDelete =
            confirm(
              `Vill du verkligen ta bort sidan "${page.title}"?\n\nAlla paragrafer på sidan tas också bort.`
            );

          if (!shouldDelete) {
            return;
          }


          await convex.mutation(
            api.pages.deletePage,
            {
              pageId: page._id,
            }
          );


          if (
            selectedPageId ===
            page._id
          ) {
            selectedPageId =
              null;

            if (
              stopContentSubscription
            ) {
              stopContentSubscription();

              stopContentSubscription =
                undefined;
            }

            contentTitle.textContent =
              "Innehåll";

            contentHelp.textContent =
              "Välj en sida till vänster.";

            contentArea.innerHTML =
              "";
          }
        }
      );


      row.appendChild(
        openButton
      );

      row.appendChild(
        deleteButton
      );

      pagesContainer.appendChild(
        row
      );
    });
  }


  function selectPage(page: any) {
    selectedPageId =
      page._id;

    renderAdminPages();


    contentTitle.textContent =
      page.title;

    contentHelp.textContent =
      "Här kan du lägga till och ta bort paragrafer.";


    if (stopContentSubscription) {
      stopContentSubscription();
    }


    stopContentSubscription =
      convex.onUpdate(
        api.contentBlocks.getContentBlocks,
        {
          pageId: page._id,
        },
        (blocks) => {
          renderContentBlocks(
            page,
            blocks
          );
        }
      );
  }


  function renderContentBlocks(
    page: any,
    blocks: any[]
  ) {
    const sortedBlocks =
      [...blocks].sort(
        (a, b) =>
          a.order - b.order
      );


    contentArea.innerHTML = "";


    const blockList =
      document.createElement("div");

    blockList.className =
      "admin-block-list";


    if (sortedBlocks.length === 0) {
      const emptyMessage =
        document.createElement("p");

      emptyMessage.className =
        "admin-empty-message";

      emptyMessage.textContent =
        "Den här sidan har inga paragrafer ännu.";

      blockList.appendChild(
        emptyMessage
      );
    }


    sortedBlocks.forEach(
      (block) => {
        const row =
          document.createElement("div");

        row.className =
          "admin-block-row";


        const text =
          document.createElement("p");

        text.textContent =
          block.text;


        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "admin-delete-button";

        deleteButton.textContent =
          "Ta bort";


        deleteButton.addEventListener(
          "click",
          async () => {
            const shouldDelete =
              confirm(
                "Vill du ta bort den här paragrafen?"
              );

            if (!shouldDelete) {
              return;
            }


            await convex.mutation(
              api.contentBlocks
                .deleteContentBlock,
              {
                contentBlockId:
                  block._id,
              }
            );
          }
        );


        row.appendChild(text);

        row.appendChild(
          deleteButton
        );

        blockList.appendChild(
          row
        );
      }
    );


    contentArea.appendChild(
      blockList
    );


    const form =
      document.createElement("form");

    form.className =
      "admin-paragraph-form";


    const label =
      document.createElement("label");

    label.textContent =
      "Ny paragraf";


    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.rows = 5;

    textarea.placeholder =
      "Skriv texten här...";


    const addButton =
      document.createElement(
        "button"
      );

    addButton.type =
      "submit";

    addButton.className =
      "admin-primary-button";

    addButton.textContent =
      "+ Lägg till paragraf";


    form.appendChild(label);

    form.appendChild(textarea);

    form.appendChild(
      addButton
    );


    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();


        const text =
          textarea.value.trim();


        if (!text) {
          alert(
            "Skriv något i paragrafen."
          );

          return;
        }


        const highestOrder =
          sortedBlocks.reduce(
            (highest, block) =>
              Math.max(
                highest,
                block.order
              ),
            0
          );


        await convex.mutation(
          api.contentBlocks
            .createContentBlock,
          {
            pageId: page._id,
            text,
            order:
              highestOrder + 1,
          }
        );


        textarea.value = "";
      }
    );


    contentArea.appendChild(
      form
    );
  }
}


function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}