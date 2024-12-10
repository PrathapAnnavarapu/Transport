import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";





const GridExample = React.forwardRef((props) => {   
  const {rowData, colDefs, pagination, groupIncludeTotalFooter, groupIncludeFooter, getRowStyle, ref} = props

  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      // editable: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      enableValue: true,
      width:'125',
    };
  }, []);  
  
  

  

  return (
    <div ref={ref} className="ag-theme-quartz" style={{ height: '100%', width: '100%' }} >      
      <AgGridReact   
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={pagination}
        groupIncludeFooter= {groupIncludeFooter}
        groupIncludeTotalFooter={groupIncludeTotalFooter}
        getRowStyle={getRowStyle}             
      />
    </div>
  )
})

export default React.memo(GridExample)