
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { CustomCellComponet } from './CustomCellComponet';
import { ClinCellEditor } from './BasicCellEditior';
import { SingleRelationSelect } from './SingleRelationSelect';
import { getInfo, updateContenntItem } from '../api/api'
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
  maxCardinality?: number
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
export default function CommanAgGridRelation({ appDefId, contentInsId, relationContentInsId, maxCardinality }: AgGridCustomRelationShipWidget) {
  const rowData = [
    { make: "Toyota", model: "Celica", price: 'smith' },
  ];
  const gridRef: any = useRef(null)
  const [rows, setRows] = useState<ValueType[]>([]);
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
  const [columnDef, setColumnDef] = useState<any>([]);
  const getRelationshipAttribute = (relationId: number, primitiveId: number,maxCardinality: number,minCardinality: number) => {
    if(maxCardinality ===-1 && minCardinality ===0){
        return {
            sortable: true,
            cellRenderer: CustomCellComponet,
            cellRendererParams: {
              isMultipleRelation: true
            },
            cellEditorPopup: true,
            cellEditorParams: {
              appDefId,
              contentInsId,
              relationContentInsId: relationId,
              primitiveId,
              maxCardinality,
              handleChangeEvent: (key: string, leftContentItemID: number, rightContentItemID: number, contentInsRelationshipInsID: number) => {
                //  hadnleChange(key,leftContentItemID,rightContentItemID,contentInsRelationshipInsID)
                let payloadData: any = payload
                let isAlreadyAvailable = false
                let filterPayload
                debugger
                if (key === 'RemoveRelationships') {
                  filterPayload = payloadData.AddRelationships.filter((item: any) => item.RightContentItemID !== rightContentItemID)
                  if (filterPayload.length !== payloadData.AddRelationships.length) {
                    isAlreadyAvailable = true
      
                    payloadData.AddRelationships = filterPayload
                  }
                }
                else if (key === 'AddRelationships') {
                  filterPayload = payloadData.RemoveRelationships.filter((item: any) => item.RightContentItemID !== rightContentItemID)
                  if (filterPayload.length !== payloadData.RemoveRelationships.length) {
      
                    isAlreadyAvailable = true
                    payloadData.RemoveRelationships = filterPayload
                  }
                }
                if (!isAlreadyAvailable) {
                  payloadData?.[key]?.push({
                    "LeftContentItemID": leftContentItemID, "RightContentItemID": rightContentItemID, "ContentInsRelationshipInsID": contentInsRelationshipInsID
      
                  })
                }
                setPaylod(payloadData)
              }
            },
            cellEditor: ClinCellEditor,
            editable: true,
            suppressKeyboardEvent: (e: any) => {
              console.log('current key ========>', e)
              console.log('shift key ========>', e.event.shiftKey)
              console.log('tab key ========>', e.event.keyCode)
              console.log('grid ref ========>', gridRef.current)
      
      
              // console.log('active element', document.activeElement)
              //document.activeElement?.tagName.toLocaleLowerCase()!=="input"
              if (e.event.keyCode === 9 || e.event.shiftKey) {
                console.log('inside condi--------------------------------------')
                gridRef?.current?.api?.stopEditing()
                return true
              } else {
                console.log('else condi--------------------------------------')
      
                return false
              }
            },
          }
      }else if(maxCardinality ===1 && minCardinality===1){
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
                if(data?.userRelationIds){
                payloadData.RemoveRelationships=[{
                  "LeftContentItemID": leftContentItemID, "RightContentItemID": data?.userRelationIds?.[0], "ContentInsRelationshipInsID": contentInsRelationshipInsID
        
                }]
              }
                setPaylod(payload)
               }
              }
            },
            cellEditor: SingleRelationSelect,
            editable: true,
           }
      }
  
  }
  const getData = async (search?: any) => {
    const infoResponse = await getInfo(appDefId, contentInsId)
    let columns: any = []
    infoResponse?.data?.fields?.map((field: any) => {

      if (!Object.keys(field).includes('fieldValueType')) {
        if (field.fieldType.itemName.toLowerCase() === "relationship") {
          columns.push({
            id: field.id,
            'field': field.name,
            ...getRelationshipAttribute(field?.right?.joinContentIns?.id, JSON.parse(field?.right?.joinContentIns?.contentItemLabelFormula)?.[0],field?.right.maxCardinality,field?.right.minCardinality)
          })
        } else if (Object.keys(field).includes('primitives')) {
          columns.push({
            id: field?.primitives?.[0]?.id,
            'field': field.name
          })
        } else {
          columns.push({
            id: field.id,
            'field': field.name
          })
        }
      }
    })
    const query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": [{ "exists": { "field": "ownerContentDef" } }] } }, "from": 0 }
    const response = await axios.get(`/${appDefId}/contentinses/${contentInsId}/items?query=${JSON.stringify(query)}`)
    let options: ValueType[] = []
    let obj = {}, user: any[] = [], relationIds: number[] = [];
    response.data.results.forEach((item: any) => {

      obj = {
        id: item.id
      }
      columns.forEach((column: any) => {
        if (column?.cellEditorParams && Object.keys(column.cellEditorParams).includes('relationContentInsId')) {

          item?.[column.id]?.forEach((value: any) => {
            if(Boolean(column?.cellRendererParams?.isMultipleRelation))
              user.push({ label: value?.rightContentItem?.label, id: value?.rightContentItem?.id })
            else 
              user.push(value?.rightContentItem?.label)

            relationIds.push(value?.rightContentItem?.id)
          })
          Object.assign(obj, { [column.field]: user, [`${column.field}RelationIds`]: relationIds })
          user = []
          relationIds = []
        } else {
          Object.assign(obj, {
            [column.field]: item[column.id]
          })

        }

      })

      options.push(obj)

    })
    console.log({columns})

    setColumnDef(columns)
    console.log({options})
    setRows(options)
  }

  useEffect(() => {


    getData()
  }, [])

  return (
    <div className="App">
      <div className="ag-theme-alpine" style={{ height: 1000, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          // getRowHeight={onGridReady}
          rowData={rows}
          // frameworkComponents={[{
          //   clinCellEditor: ClinCellEditor,
          //   SingleRelationSelect: SingleRelationSelect
          // }]}
          defaultColDef={{
            flex: 1,
            sortable: true,
            resizable: true,
            cellClass: 'cell-wrap-text',
            autoHeight: true
          }}
          domLayout="autoHeight"
          // tabToNextCell={tabToNextCell}
          columnDefs={columnDef}
          onCellEditingStopped={async (event: any) => {
            console.log({ event })
            if (payload.AddRelationships.length || payload.RemoveRelationships.length || payload.ReplaceRelationships.length) {
              payload.ItemIDs = [event?.data?.id]
           
              payload.Field = { ID: event?.columnApi?.columnModel?.columnDefs?.[0]?.id, Value: event.data[event?.columnApi?.columnModel?.columnDefs?.[0]?.field] }

              await updateContenntItem(appDefId, contentInsId, JSON.stringify(payload))
              getData()
            }
          }}
        stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
}
