
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import {Dropdown} from 'engage-ui'
import './CommanAgGridComponent.scss'
import {GridApi,IRowNode} from 'ag-grid-community'
import React, {
  useEffect,
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
interface FieldValueType {
  ID?: number
  Value?: string
}

interface PayloadType {
  "ItemIDs": number[], // contentitemId
  "Publish": boolean,
  "Fields": FieldValueType[], // field with relation id and udated payload
  "AddRelationships": RelationType[],
  "ReplaceRelationships": RelationType[],
  "RemoveRelationships": RelationType[],
  "RemoveAllRelationships": {
    ContentInsRelationshipInsID?: number
  }[]
}
let count=0
export default function CommanAgGridRelation({ appDefId, contentInsId, relationContentInsId, maxCardinality }: AgGridCustomRelationShipWidget) {
  const gridRef: any = useRef(null)
  const [rows, setRows] = useState<ValueType[]>([]);
  const [gridApi,setGridApi]=useState<any>()
  const getDefaultPayloadData=()=>{
    return   {
      "ItemIDs": [], // contentitemId
      "Publish": true,
      "Fields": [], // field with relation id and udated payload
      "AddRelationships": [],
      "ReplaceRelationships": [],
      "RemoveRelationships": [],
      "RemoveAllRelationships": []
    }
  }
  const [payload, setPaylod] = useState<PayloadType>(getDefaultPayloadData())

  const [multiSelectValue,setMultiSelectValue]=useState([])
  const [singleSelectValue,setSingleSelectValue]=useState('')

  const [columnDef, setColumnDef] = useState<any>([]);
  
  console.log('column outside=======================>', columnDef)
  const getRelationshipAttribute = (relationId: number, primitiveId: number,maxCardinality: number,minCardinality: number) => {
    console.log({maxCardinality})
    console.log({minCardinality})
   
    if((maxCardinality===1)){
        return {
            sortable: true,
            cellEditorPopup: true,
            cellEditorParams:{
              appDefId,
              contentInsId,
              primitiveId,
              relationContentInsId: relationId,
              handleChangeEvent: (leftContentItemID: number,rightContentItemID: number,contentInsRelationshipInsID: number, data: any, key: string,option: any,rowIndex: number)=>{
                let payloadData: any= getDefaultPayloadData()
                
                console.log('update===================================================================>', key,option)
                console.log({data})
                console.log({rightContentItemID})
                console.log('data id:>', data[`${key}RelationIds`])
                if (data[key] !== option.label) {

                  let relationId = data?.[`${key}RelationIds`]?.[0]
                    console.log('inside the condition======================>')
                    payloadData.AddRelationships = [{
                      "LeftContentItemID": leftContentItemID, "RightContentItemID": rightContentItemID, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                    }]
                    if(relationId){
                    payloadData.RemoveRelationships = [{
                      "LeftContentItemID": leftContentItemID, "RightContentItemID": relationId, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                    }]
                   
                  }
                }
                console.log({payloadData})
                // updateOneRecord(option.label,key,rowIndex)
                setSingleSelectValue(option.label)
                setPaylod(payloadData)
               
              }
            },
            suppressKeyboardEvent: (e: any) => {
              if (e.event.keyCode===13) {
                return true
              } else {
                return false
              }
            },
            cellEditor: SingleRelationSelect,
            editable: true,
           }
    }else if(maxCardinality>1 || maxCardinality===-1){
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
            handleChangeEvent: (options: any, contentInsRelationshipInsID: number,key: string,currentData: any,rowIndex: number,isParent: boolean) => {
              console.log({currentData})
              console.log({key})
              console.log({options})
                let payloadData: any= getDefaultPayloadData()
                let optionsID: number[]=[]
                 options.forEach((item: any) => {
                  if(currentData[key]){
                    optionsID.push(item.id)
                  }
                    if(!currentData[key] ||!currentData?.[`${key}RelationIds`]?.includes(item.id)){
                      payloadData.AddRelationships.push({
                      "LeftContentItemID": currentData.id, "RightContentItemID": item.id, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                      })
                    }
                });
                if((optionsID.length || options.length===0) && currentData?.[key]?.length){
                currentData?.[key]?.forEach((item: any) => {
                    if(!optionsID?.includes(item.id) || options.length===0){
                      payloadData.RemoveRelationships.push({
                      "LeftContentItemID": currentData.id, "RightContentItemID": item.id, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                      })
                    }
                });
              }
              console.log('payload data==============================>', payloadData)
              setMultiSelectValue(options)
              setPaylod(payloadData)
            }
          },
          cellEditor: ClinCellEditor,
          editable: true,
          suppressKeyboardEvent: (e: any) => {
            let totalOptions: any=document.querySelector('#chipWrapperDiv')?.childNodes.length;
            console.log({totalOptions})
            if(e.event.keyCode === 9 && e.event.shiftKey){
              console.log('inside count==========================>')
              count=count + 1
            } 
            console.log('count=======================>',count)
            if ((document.querySelectorAll('.ativeChip').length && e.event.keyCode === 9) || (count<=totalOptions && e.event.keyCode === 9 && e.event.shiftKey) || e.event.keyCode===13) {
              return true
            } else {
              return false
            }
            
          },
        }
    }
  
  }
  const getData = async (search?: any) => {
    const infoResponse = await getInfo(appDefId, contentInsId)
    let columns: any = []
    infoResponse?.data?.fields?.map(async (field: any) => {
      console.log({infoResponse})
      if (!Object.keys(field).includes('fieldValueType')) {
        if(field.entityState.itemName!=="Deleted"){
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
      }
    })
    const query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": [{ "exists": { "field": "ownerContentDef" } }] } }, "from": 0 }
    const response = await axios.get(`/${appDefId}/contentinses/${contentInsId}/items?query=${JSON.stringify(query)}`)
    let options: ValueType[] = []
    let obj = {}, user: any[] = [], singleValue='',relationIds: number[] = [];
    response.data.results.forEach((item: any) => {

      obj = {
        id: item.id
      }
      columns.forEach((column: any) => {
        if (column?.cellEditorParams && Object.keys(column.cellEditorParams).includes('relationContentInsId')) {

          item?.[column.id]?.forEach((value: any) => {
            console.log("ismultiple:>",column?.cellRendererParams?.isMultipleRelation)
            if(Boolean(column?.cellRendererParams?.isMultipleRelation))
              user.push({ label: value?.rightContentItem?.label, id: value?.rightContentItem?.id })
            else 
            singleValue=value?.rightContentItem?.label

            relationIds.push(value?.rightContentItem?.id)
          })
          Object.assign(obj, { [column.field]: user.length>0?user:singleValue, [`${column.field}RelationIds`]: relationIds })
          user = []
          relationIds = []
          singleValue = ''
        } else {
          Object.assign(obj, {
            [column.field]: item[column.id]
          })

        }

      })

      options.push(obj)

    })
    console.log({options})
    setColumnDef(columns)
    setRows(options)
  }

  useEffect(() => {
    getData()
  }, [])
  const pickExistingRowNodeAtRandom=(gridApi: GridApi, rowIndex: number)=> {
    var allItems: IRowNode[] = [];
    console.log('pick existing row================>',gridApi)
    gridApi.forEachLeafNode(function (rowNode) {
      allItems.push(rowNode);
    });
  
    if (allItems.length === 0) {
      return;
    }
    var result = allItems[rowIndex];
  
    return result;
  }
  
  const updateOneRecord=(value: any, field: string, rowIndex: number)=>{
    var rowNodeToUpdate = pickExistingRowNodeAtRandom(gridRef.current.api!, rowIndex);
    console.log('row update=============================>',rowNodeToUpdate)
    if (!rowNodeToUpdate) return;
  
    rowNodeToUpdate.setDataValue(field, value);
  }
  const onGridReady=(params: any)=>{
    setGridApi(params)
  }
  return (
    <div className="App">
      <div className={`agGridRootWrapper ag-theme-alpine`} style={{ height: 1000, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          onGridReady={onGridReady}
          defaultColDef={{
            flex: 1,
            sortable: true,
            resizable: true,
            cellClass: 'cell-wrap-text',
            autoHeight: true
          }}
          domLayout="autoHeight"
          columnDefs={columnDef}
          onCellKeyDown={(params: any)=>{
            if(params.event.keyCode === 13) {
              var currentCell = params.api.getFocusedCell();
              var finalRowIndex = params.api.paginationGetRowCount()-1;
              if (currentCell.rowIndex === finalRowIndex) {
                  return;
              }
              params.api.stopEditing();
              params.api.clearFocusedCell();
        
              params.api.startEditingCell({
                rowIndex: Number.parseInt(currentCell.rowIndex),
                colKey:currentCell.column.colId
              });
          }
          }}
          onCellEditingStarted={()=>{
            count=0
          }}
          onCellEditingStopped={async (event: any) => {
            try {
            if (payload.AddRelationships.length || payload.RemoveRelationships.length || payload.ReplaceRelationships.length) {
              payload.ItemIDs = [event?.data?.id]
              console.log('column:>',event?.columnApi?.columnModel?.columnDefs)
              payload.Fields = []
             
              console.log("inside cell editor :>",payload)
              event.api.showLoadingOverlay();
              let updatedResponse=await updateContenntItem(appDefId, contentInsId, payload)
              event.api.hideOverlay();
              if(updatedResponse.status===202){
                 updateOneRecord(event?.colDef?.cellRendererParams?.isMultipleRelation ?multiSelectValue:singleSelectValue,event.colDef.field,event.rowIndex)
              }
              setPaylod(getDefaultPayloadData())

            }
          } catch (error) {
            console.log({error})
            event.api.hideOverlay();
            setPaylod(getDefaultPayloadData())
          }
          }}
          singleClickEdit
        stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
}
