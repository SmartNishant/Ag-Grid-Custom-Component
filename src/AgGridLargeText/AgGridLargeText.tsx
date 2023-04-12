import React, { Component } from 'react'
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import {ColDef} from 'ag-grid-community'
import './AgGridLargeText.scss'
interface IState{
    columns: ColDef[]
    rows: any[]
}

export default class AgGridLargeText extends Component<any,IState> {
    constructor(props: any){
        super(props)
        this.state={
            columns: [
                {
                    field: 'name',
                    headerName: 'Name',
                },
                {
                  field: 'age',
                  headerName: 'Age',
              },
                {
                    field: 'description',
                    headerName: 'Description',
                    // cellRenderer: AgGridLargeTextRender,
                    cellEditorParams: {
                        maxLength: 500,
                        rows: 10,
                        cols: 50,
                       
                    },
                    cellEditorPopup: true,
                   
                    // cellEditorPopupPosition: 'under',
                    editable: true,

                    autoHeight: true,
                    cellEditor: 'agLargeTextCellEditor',
                },
                {
                  field: 'gender',
                  headerName: 'Gender',
              },
                
            ],
            rows: [{
                name: 'test control',
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                age: 10,
                gender: 'male'
              },
            {
              name: 'test control',
              description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
              age: 10,
              gender: 'male'
          },
          {
            name: 'test control',
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            age: 10,
            gender: 'male'

        }
          ],
        }
    }
    // autoSizeAll(skipHeader: boolean) {
    //   const allColumnIds: string[] = [];
    //   console.log('api===============================>', this.state.gridApi)
    //   this.state.gridApi.columnApi!.getColumns()!.forEach((column: any) => {
    //     allColumnIds.push(column.getId());
    //   });
    
    //   this.state.gridApi.columnApi!.autoSizeAll(allColumnIds, skipHeader);   
    // }
    // onGridReady = async(params: any) => {
    //   this.setState({gridApi: params})
   
    // };
   componentDidMount(): void {
   
   } 
  render() {
    return (
        <div className="agGridRootWrapper ag-theme-alpine" style={{ height: 1000, width: '100%', padding: '25px' }}>
          <AgGridReact
              rowData={this.state.rows}
              onCellClicked={()=>{
                setTimeout(()=>{
                  console.log('cell edit============================')
                  let element: any=document.getElementsByClassName('ag-large-text-input')
                  console.log('before =========================>', element)
                  if(element?.length){
                    console.log('after=========================>', element)
                    element[0].style.padding='0px';
                  }
                },1000)
              }}
              defaultColDef={{
                flex: 1,
                sortable: true,
                resizable: true,
                cellClass: 'cell-wrap-text',
                autoHeight: true
              }}
              singleClickEdit
              domLayout="autoHeight"
              columnDefs={this.state.columns}
            />
      </div>
    )
  }
}
  