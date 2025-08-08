import { Component } from "react";
import "./filter-bar.style.css";

class FilterBar extends Component {
    componentDidMount() {
        this.props.loadDictionaries?.();
    }

    render() {
        const { types, generations, filters, onFilterChange, onReset } = this.props;

        return (
            <div className="filter-bar">
                <div className="row">
                    {/* Type dropdown */}
                    <div className="field">
                        <label>Type</label>
                        <select
                            value={filters.type || ""}
                            onChange={(e) => onFilterChange({ type: e.target.value || null })}
                        >
                            <option value="">Any</option>
                            {types.map((t) => (
                                <option key={t.name} value={t.name}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Region dropdown */}
                    <div className="field">
                        <label>Region</label>
                        <select
                            value={filters.region || ""}
                            onChange={(e) => onFilterChange({ region: e.target.value || null })}
                        >
                            <option value="">Any</option>
                            {generations.map((g) => (
                                <option key={g.name} value={g.name}>
                                    {g.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="reset-btn" onClick={onReset}>
                        Reset
                    </button>
                </div>
            </div>
        );
    }
}

export default FilterBar;
