import React from "react";
import "./darkmode.style.css";

// Icons from your prompt
// const ICONS = {
//     dark:  "https://marriland.com/wp-content/plugins/marriland-core/images/pokemon/icons/big/lunatone.png",
//     light: "https://marriland.com/wp-content/plugins/marriland-core/images/pokemon/icons/big/solrock.png",
// };

const DarkModeToggle = ({ darkMode, onToggle }) => {
    return (
        <button
            type="button"
            className={`dm-toggle ${darkMode ? "on" : "off"}`}
            onClick={onToggle}
            aria-pressed={darkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="dm-thumb" />
        </button>
    );
};

export default DarkModeToggle;
