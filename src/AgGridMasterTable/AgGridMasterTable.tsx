'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  ColDef,
  ColGroupDef,
  FirstDataRenderedEvent,
  Grid,
  GridOptions,
  GridReadyEvent,
  IDetailCellRendererParams,
} from 'ag-grid-community';
import { IAccount,ICallRecord } from './interfaces';

export const AgGridMasterTable = () => {
  const gridRef = useRef<AgGridReact<IAccount>>(null);
  const containerStyle = useMemo(() => ({ width: '1000px', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '1000px', width: '100%' }), []);
  const [rowData, setRowData] = useState<IAccount[]>();
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account', editable: true, },
    { field: 'calls' ,editable: true},
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      sortable: true
    };
  }, []);
  const detailCellRendererParams = useMemo<any>(() => {
    return {
      detailGridOptions: {
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        enableRangeSelection: true,
        pagination: true,
        paginationAutoPageSize: true,
        columnDefs: [
          { field: 'callId', checkboxSelection: true  },
          { field: 'direction', editable: true,cellEditor: 'agSelectCellEditor',
          // cellEditorPopup: true,
          // cellEditorPopupPosition:'under',
          cellEditorParams: {
            values: ['Red', 'Green', 'Blue','green','yellow','pink','black','white'],
            cellHeight: 20,
            searchDebounceDelay: 500
          }  },
          { field: 'number', minWidth: 150,editable: true  },
          { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
          { field: 'switchCode', minWidth: 150 },
        ],
        defaultColDef: {
          sortable: true,
          flex: 1,
        },
      },
      getDetailRowData: (params: any) => {
        console.log('params==============>',params.data)
        params.successCallback(params.data.callRecords);
      },
    };
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
      .then((resp) => resp.json())
      .then((data: IAccount[]) => {
        data.forEach((data: any,index)=>{
          data.name=data.name+'-'+(index+1)+':'
        })
        console.log({data})
        setRowData(data);
      });
  }, []);

  const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
    // arbitrarily expand a row for presentational purposes
    setTimeout(function () {
      gridRef.current!.api.getDisplayedRowAtIndex(1)!.setExpanded(true);
    }, 0);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={gridStyle} className="ag-theme-alpine">
        <AgGridReact<IAccount>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          masterDetail={true}
          detailCellRendererParams={detailCellRendererParams}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
        ></AgGridReact>
      </div>
    </div>
  );
};
