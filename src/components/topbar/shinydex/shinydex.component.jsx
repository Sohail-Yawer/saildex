import React from "react";

const ShinyDexToggle = ({ showShiny, onToggle }) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={showShiny}
            title="ShinyDex"
            style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                zIndex: -1,
                background: showShiny ? "#111827" : "#ffffff",
                color: showShiny ? "#ffffff" : "#111827",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 0 rgba(0,0,0,.15)"
            }}
        >
            ShinyDex
        </button>
    );
};

export default ShinyDexToggle;
