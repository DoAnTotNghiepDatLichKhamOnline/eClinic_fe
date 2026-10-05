import { useActiveHub } from "@/shared/context/ActiveHubContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { cx } from "@/utils/cx";
import { hubs } from "./centers.data";
import styles from "./HubTabs.module.css";

export function HubTabs() {
  const { activeHub, setActiveHub } = useActiveHub();
  const { t } = useLanguage();

  return (
    <div className={styles.tabs} role="tablist" aria-label="Select a city">
      {hubs.map((hub) => (
        <button
          key={hub.id}
          type="button"
          role="tab"
          aria-selected={activeHub === hub.id}
          aria-controls={`hub-panel-${hub.id}`}
          id={`hub-tab-${hub.id}`}
          className={cx(styles.tab, activeHub === hub.id && styles.isActive)}
          onClick={() => setActiveHub(hub.id)}
        >
          {t(hub.cityLabel)}
        </button>
      ))}
    </div>
  );
}
