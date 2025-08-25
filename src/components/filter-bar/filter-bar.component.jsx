import { Component } from "react";
import "./filter-bar.style.css";

const TYPE_ORDER = [
    "normal","grass","fire","water","bug","electric","rock","ghost",
    "poison","psychic","fighting","ground","dragon","ice","flying",
    "fairy","steel","dark"
];

const TYPE_COLORS = {
    normal:  "#C5BFB6",
    grass:   "#78C850",
    fire:    "#FF4500",
    water:   "#3c6ddf",
    bug:     "#8F9D11",
    electric:"#FBB815",
    rock:    "#B8A158",
    ghost:   "#5B5CA5",
    poison:  "#8C3D8C",
    psychic: "#EA4680",
    fighting:"#7D331F",
    ground:  "#CDAE50",
    dragon:  "#715BDC",
    ice:     "#9EE5FC",
    flying:  "#90A4F1",
    fairy:   "#EEB1F1",
    steel:   "#B4B4C2",
    dark:    "#503B2E"
};
const TYPE_TEXT_COLOR = {
    ice:    "#000000",
    normal: "#000000",
    steel:  "#000000"
};

// Options for the new "Filter" dropdown
const FORM_FILTER_OPTIONS = [
    { value: "", label: "Any" },
    { value: "mega", label: "Has Mega" },
    { value: "alolan", label: "Has Alolan" },
    { value: "galarian", label: "Has Galarian" },
    { value: "hisuian", label: "Has Hisuian" },
];

class FilterBar extends Component {
    componentDidMount() {
        this.props.loadDictionaries?.();
    }

    handleTypeClick = (t) => {
        const { filters, onFilterChange } = this.props;
        onFilterChange({ type: filters.type === t ? null : t }); // toggle
    };

    render() {
        const { types = [], generations = [], filters, onFilterChange, onReset } = this.props;
        const available = TYPE_ORDER.filter(t => types.find(x => x.name === t));

        return (
            <div className="filterbar-wrap">
                {/* LEFT: Label above buttons (UNCHANGED) */}
                <div className="filter-column">
                    <h3 className="fb-title">Filter by type:</h3>
                    <div className="chip-grid">
                        {available.map((t) => {
                            const active = filters.type === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    className={`type-chip${active ? " active" : ""}`}
                                    style={{ backgroundColor: TYPE_COLORS[t], color: TYPE_TEXT_COLOR[t] || "#ffffff" }}
                                    onClick={() => this.handleTypeClick(t)}
                                    aria-pressed={active}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            );
                        })}
                        <button type="button" className="type-chip reset" onClick={onReset}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* NEW: Filter dropdown (forms) — placed to the LEFT of Region */}
                <div className="filter-column">
                    <h3 className="fb-title">Filter:</h3>
                    <div className="select-wrap">
                        <select
                            className="region-select"
                            value={filters.form || ""}
                            onChange={(e) => onFilterChange({ form: e.target.value || null })}
                        >
                            {FORM_FILTER_OPTIONS.map(opt => (
                                <option key={opt.value || "any"} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="select-caret">▾</span>
                    </div>
                </div>

                {/* RIGHT: Region dropdown (UNCHANGED) */}
                <div className="filter-column">
                    <h3 className="fb-title">Region:</h3>
                    <div className="select-wrap">
                        <select
                            className="region-select"
                            value={filters.region || ""}
                            onChange={(e) => onFilterChange({ region: e.target.value || null })}
                        >
                            <option value="">Any</option>
                            {generations.map((g) => (
                                <option key={g.name} value={g.name}>{g.displayName}</option>
                            ))}
                        </select>
                        <span className="select-caret">▾</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default FilterBar;
