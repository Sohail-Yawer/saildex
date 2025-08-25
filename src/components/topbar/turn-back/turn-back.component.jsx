import React from "react";

const TurnBackToggle = ({ showBack, onToggle }) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={showBack}
            title="Turn Back"
            style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: showBack ? "#111827" : "#ffffff",
                color: showBack ? "#ffffff" : "#111827",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 0 rgba(0,0,0,.15)"
            }}
        >
            Turn Back
        </button>
    );
};

export default TurnBackToggle;
