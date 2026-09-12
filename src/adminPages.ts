import { api } from "../convex/_generated/api";
import { convex } from "./convexClient";
import { createSlug } from "./adminUtils";

export function createAdminPages(
  pagesContainer: HTMLDivElement,
  createPageForm: HTMLFormElement,
  newPageTitle: HTMLInputElement,
  onSelectPage: (page: any) => void,
  onClearContent: () => void
) {
  let currentPages: any[] = [];

  let selectedPageId:
    string | null = null;


  createPageForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const title =
        newPageTitle.value.trim();

      if (!title) {
        alert(
          "Skriv ett namn på sidan."
        );

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
          order:
            highestOrder + 1,
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

      renderPages();
    }
  );


  function renderPages() {
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
        document.createElement(
          "div"
        );

      row.className =
        "admin-page-row";


      if (
        page._id ===
        selectedPageId
      ) {
        row.classList.add(
          "selected"
        );
      }


      const openButton =
        document.createElement(
          "button"
        );

      openButton.className =
        "admin-page-open";

      openButton.textContent =
        page.title;


      openButton.addEventListener(
        "click",
        () => {
          selectedPageId =
            page._id;

          renderPages();

          onSelectPage(page);
        }
      );


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
              `Vill du verkligen ta bort sidan "${page.title}"?\n\nAlla paragrafer på sidan tas också bort.`
            );

          if (!shouldDelete) {
            return;
          }


          await convex.mutation(
            api.pages.deletePage,
            {
              pageId:
                page._id,
            }
          );


          if (
            selectedPageId ===
            page._id
          ) {
            selectedPageId =
              null;

            onClearContent();
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
}