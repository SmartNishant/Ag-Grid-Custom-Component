
import { AgGridReact } from "ag-grid-react";

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { ICellEditor, ICellEditorParams } from "ag-grid-community";
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
import { ContentItemApiAxiosRequest } from '@emgage/observable-rest-api';
import { EmgageApiClientInstance } from '@emgage/observable-rest-api';
import { SingleRelationSelect} from '../AgGridCustomRelationShipWidget/SingleRelationSelect';
import {getInfo,updateContenntItem} from '../api/api'
import axios from '../axiosConfig'
interface OptionType {
  id: number,
  key?: string
  label: string,
  email?: string,
}
interface ValueType {
  id?: number
  name?: string
  uase?: string
}

interface AgGridCustomRelationShipWidget {
  appDefId: number
  relationContentInsId: number
  contentInsId: number
}
interface RelationType {
  LeftContentItemID?: number
  RightContentItemID?: number
  ContentInsRelationshipInsID?: number,

}
interface PayloadType {
  "ItemIDs": number[], // contentitemId
  "Publish": boolean,
  "Field": {
    ID?: number
    Value?: string
  }, // field with relation id and udated payload
  "AddRelationships": RelationType[],
  "ReplaceRelationships": RelationType[],
  "RemoveRelationships": RelationType[],
  "RemoveAllRelationships": {
    ContentInsRelationshipInsID?: number
  }[]
}
export default function AgGridOneToOneReation({ appDefId,contentInsId, relationContentInsId }: AgGridCustomRelationShipWidget) {
  const rowData = [
    { make: "Toyota", model: "Celica", price: 'smith' },
  ];
  const [payload, setPaylod] = useState<PayloadType>(
    {
      "ItemIDs": [], // contentitemId
      "Publish": true,
      "Field": {}, // field with relation id and udated payload
      "AddRelationships": [],
      "ReplaceRelationships": [],
      "RemoveRelationships": [],
      "RemoveAllRelationships": []
    }
  )
 const [rows, setRows] = useState<ValueType[]>([]);
 const [columnDef, setColumnDef] = useState<any>([]);
 const getRelationshipAttribute=(relationId: number)=>{
  return {
    sortable: true,
    cellEditorPopup: true,
    cellEditorParams:{
      appDefId,
      contentInsId,
      relationContentInsId: relationId,
      handleChangeEvent: (leftContentItemID: number,rightContentItemID: number,contentInsRelationshipInsID: number, data: any)=>{
        debugger
        console.log({rightContentItemID})
        console.log({data})
       let payloadData=payload
       if(data.userRelationIds[0]!==rightContentItemID){
        payloadData.AddRelationships=[{
          "LeftContentItemID": leftContentItemID, "RightContentItemID": rightContentItemID, "ContentInsRelationshipInsID": contentInsRelationshipInsID

        }]

        setPaylod(payload)
       }
      }
    },
    cellEditor: "SingleRelationSelect",
    editable: true,
   }
 }

//   console.log('referesh call=========================>')
  const getData=async(search?: any)=>{
    let changeTimeStamp: string;
    const infoResponse=await getInfo(appDefId,contentInsId)
    console.log({infoResponse})
    let columns: any=[]
    infoResponse?.data?.fields?.map((field: any)=>{
      
      if(!Object.keys(field).includes('fieldValueType')){
        if(field.fieldType.itemName.toLowerCase() ==="relationship"){
          columns.push({
            id: field.id,
            'field': field.name,
            ...getRelationshipAttribute(field?.right?.joinContentIns?.id)
          })
        }else if (Object.keys(field).includes('primitives')){
          columns.push({
            id: field?.primitives?.[0]?.id,
            'field': field.name
          })
        }else{
          columns.push({
            id: field.id,
            'field': field.name
          })
        }
      }
    })
    console.log({columns})
    const query={"sort":[{"label.keyword":{"order":"asc"}}],"size":10,"query":{"bool":{"must":[{"terms":{"entityState.itemID":[5]}},{"term":{"isCurrentVersion":true}},{"simple_query_string":{"query":search? search+"*": '*',"default_operator":"and","fields":["label"]}}],"must_not":[{"exists":{"field":"ownerContentDef"}}]}},"from":0}
    const response=await axios.get(`/${appDefId}/contentinses/${contentInsId}/items?query=${JSON.stringify(query)}`)
    console.log({response})
    let options: ValueType[]=[]
    let obj={}, user: string[]=[], relationIds: number[]=[] ;
    response.data.results.forEach((item: any)=>{

      obj={
        id: item.id
      }
      changeTimeStamp=item['changeTimestamp']
      columns.forEach((column: any)=>{
        console.log('column======================>', column)
        if(column?.cellEditorParams && Object.keys(column.cellEditorParams).includes('relationContentInsId') ){
          console.log('inside the relation===================', column)
     
          item?.[column.id]?.forEach((value: any)=>{
            user.push(value?.rightContentItem?.label)
            relationIds.push(value?.rightContentItem?.id)
          })
          console.log({user})
          Object.assign(obj,{[column.field]: user, [`${column.field}RelationIds`]: relationIds})
          user=[]
          relationIds=[]
        }else{
        Object.assign(obj, {
          [column.field]: item[column.id]
        })
        
      }
        
      })
      // obj={
      //   id: item['contentItemID'],
      //   name: item['6006803'],
      // }
      console.log('obj ==================================================>', obj)

      options.push(obj)

    })
    columns=columns.map((column: any)=>{
      return {
        ...column,
        changeTimestamp: changeTimeStamp
      }
    })
    console.log({columns})
    setColumnDef(columns)
    console.log({options})

    setRows(options)

    console.log({options})
  }
  useEffect(()=>{
    console.log('useEffect call=========================>')
 

    getData()
  },[])
//   console.log('outside options:>===========================', relationOptions)
// const onSearch=(val: any)=>{
//   console.log('value', val)
//   getData(val)
// }

  return (
    <div className="App">
      <div className="ag-theme-alpine" style={{ height: 1000, width: '100%' }}>
        <AgGridReact
          // getRowHeight={onGridReady}
          onCellKeyDown={(event: any)=>{
            debugger
            let key = event.which || event.keyCode;
            if (key === 13) {  // right
                event.stopPropagation();
            }
          }}
          rowData={rows}
          frameworkComponents={{
            SingleRelationSelect: SingleRelationSelect,
          }}
          defaultColDef={{
            flex: 1,
            sortable: true,
            resizable: true,
            cellClass: 'cell-wrap-text',
            autoHeight: true
          }}
          domLayout="autoHeight"
          columnDefs={columnDef}
          onCellEditingStopped={async (event: any) => {
            console.log({ event })
            if (payload.AddRelationships.length || payload.RemoveRelationships.length || payload.ReplaceRelationships.length) {
              payload.ItemIDs = [event?.data?.id]
              console.log('id===>', event?.columnApi?.columnModel?.columnDefs[event.rowIndex]?.id)
              console.log('name===>', event.data[event?.columnApi?.columnModel?.columnDefs?.field])

              payload.Field = { ID: event?.columnApi?.columnModel?.columnDefs?.[0]?.id, Value: event.data[event?.columnApi?.columnModel?.columnDefs?.[0]?.field] }
              console.log({payload})
              await updateContenntItem(appDefId, contentInsId, JSON.stringify(payload))
              getData()
            }
          }}
        // stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
}
