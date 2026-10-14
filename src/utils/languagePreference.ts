export type AccountLanguage = "VI" | "EN";

export function applyAccountLanguage(language?: AccountLanguage | null) {
  if (!language || localStorage.getItem("eclinic_language_manual") === "true") return;
  const next = language === "VI" ? "vi" : "en";
  localStorage.setItem("eclinic_language", next);
  window.dispatchEvent(new Event("eclinic:language-change"));
}
