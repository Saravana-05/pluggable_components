import { useLangStore } from "../store/languageStore";
import { useTranslation } from "../i18n/useTranslation";

const isRTL = (lang) => ["ar", "he"].includes(lang);

const MultiLangLabel = ({ labelKey, module = "common" }) => {
  const { langOrder } = useLangStore();
  const { t } = useTranslation(module);

  const values = [...t(labelKey)].sort(
    (a, b) => langOrder.indexOf(a.lang) - langOrder.indexOf(b.lang)
  );

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {values.map((item, index) => (
        <>
          <div
            key={item.lang}
            style={{
              direction: isRTL(item.lang) ? "rtl" : "ltr",
              textAlign: isRTL(item.lang) ? "right" : "left",
            }}
          >
            {item.value}
          </div>
          {index < values.length - 1 && (
            <span style={{ color: "#c8bfb0" }}>/</span>
          )}
        </>
      ))}
    </div>
  );
};

export default MultiLangLabel;