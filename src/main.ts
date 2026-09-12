import "./style.css";

import { showPublicSite } from "./publicSite";
import { showAdminSite } from "./adminSite";

if (window.location.pathname === "/admin") {
  showAdminSite();
} else {
  showPublicSite();
}