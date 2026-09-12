import "./style-admin.css";

import {
  initializeAdminAuth,
} from "./adminAuth";

import {
  createAdminPages,
} from "./adminPages";

import {
  createAdminContent,
} from "./adminContent";


export async function showAdminSite() {
  await initializeAdminAuth();


  document.querySelector<HTMLDivElement>(
    "#app"
  )!.innerHTML = `
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


  const createPageForm =
    document.querySelector<HTMLFormElement>(
      "#create-page-form"
    )!;


  const newPageTitle =
    document.querySelector<HTMLInputElement>(
      "#new-page-title"
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


  const adminContent =
    createAdminContent(
      contentTitle,
      contentHelp,
      contentArea
    );


  createAdminPages(
    pagesContainer,
    createPageForm,
    newPageTitle,

    (page) => {
      adminContent.showPage(page);
    },

    () => {
      adminContent.clearContent();
    }
  );
}