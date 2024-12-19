"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";


const GridMultiSelection = ({rowData, columnDefs, onGridReady}) => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
    };
  }, []);
  const rowSelection = useMemo(() => {
    return {
      mode: "multiRow",
      selectAll: "all",
    };
  }, []);

  
  const onQuickFilterChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      "quickFilterText",
      document.querySelector("#quickFilter")?.value,
    );
  }, []);

  const updateSelectAllMode = useCallback(() => {
    const selectAll =
      document.querySelector("#select-all-mode")?.value ?? "all";
    gridRef.current.api.setGridOption("rowSelection", {
      mode: "multiRow",
      selectAll: selectAll,
    });
  }, []);

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "10px" }}>
            <span>Select All Mode: </span>
            <select id="select-all-mode" onChange={updateSelectAllMode}>
              <option value="all">all</option>
              <option value="filtered">filtered</option>
              <option value="currentPage">currentPage</option>
            </select>
          </label>
          <label>
            <span>Filter: </span>
            <input
              type="text"
              onInput={onQuickFilterChanged}
              id="quickFilter"
              placeholder="quick filter..."
            />
          </label>
        </div>

        <div style={gridStyle}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationAutoPageSize={true}
            rowSelection={rowSelection}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  );
};

export default GridMultiSelection