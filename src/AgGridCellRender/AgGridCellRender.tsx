
import { AgGridReact } from "ag-grid-react";

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { ICellEditor, ICellEditorParams } from "ag-grid-community";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { CustomCellComponet } from '../AgGridCustomRelationShipWidget/CustomCellComponet';
import axios from '../axiosConfig'
interface OptionType {
  id: number,
  key?: string
  label: string,
  email?: string,
}
interface ValueType {
  id?: number
  label?: string
  email?: string
}

interface AgGridCustomRelationShipWidget {
  appDefId: number
  contentInsId: number
  isMultipleRelation: boolean
}
export default function AgGridCellRender({ appDefId,contentInsId,isMultipleRelation }: AgGridCustomRelationShipWidget) {
  const rowData = [
    { make: "Toyota", model: "Celica", price: 3 },
   ];
  const [cellValues, setcellValues] = useState<ValueType[]>([]);
  const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
  console.log('referesh call=========================>')
 
  useEffect(()=>{
    console.log('useEffect call=========================>')
    const getData=async()=>{
      const query={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":0}
      const response=await axios.get(`/${appDefId}/contentinses/${contentInsId}/items?query=${JSON.stringify(query)}`)
      console.log({response})
      let options: OptionType[]=[]
      response.data.results.forEach((item: any)=>{
        item['2326546'].forEach((user: any)=>{
            //rightContentItem
            options.push({
                id: user['rightContentItem'].id || '',
               label: user['rightContentItem'].label || ''
              })
        })
       
      })
      setRelationOptions(options)
      console.log({options})
    }

    getData()
  },[])
  console.log('outside options:>===========================', relationOptions)

  return (
    <div className="App">
      <div className="ag-theme-alpine" style={{ height: 1000, width: '100%' }}>
        <AgGridReact
          // getRowHeight={onGridReady}
          rowData={rowData}
          defaultColDef={{
            flex: 1,
            sortable: true,
            resizable: true,
            cellClass: 'cell-wrap-text',
            autoHeight: true
          }}
          domLayout="autoHeight"
          columnDefs={[
            { field: 'make' },
            { field: 'model' },
            {
              field: 'price',
              sortable: true,
              cellRenderer: CustomCellComponet,
                  cellRendererParams: {
                options: relationOptions,
                isMultipleRelation
              },
            },
          ]}
          onCellEditingStopped={(event)=>{
            console.log('edit stopped')
          }}
        stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
}
