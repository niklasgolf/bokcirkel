import { api } from "../convex/_generated/api";
import { convex } from "./convexClient";

export function createAdminContent(
  contentTitle: HTMLHeadingElement,
  contentHelp: HTMLParagraphElement,
  contentArea: HTMLDivElement
) {
  let stopContentSubscription:
    (() => void) | undefined;


  function showPage(page: any) {
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


  function clearContent() {
    if (stopContentSubscription) {
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


  return {
    showPage,
    clearContent,
  };
}