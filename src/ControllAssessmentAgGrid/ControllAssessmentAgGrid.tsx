import React, { Component, createRef } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Pagination,TextField,Icon } from 'engage-ui';
import {ColDef,TabToNextCellParams,CellPosition,RowPinnedType,GridApi,IRowNode,IDetailCellRendererParams,ValueFormatterParams} from 'ag-grid-community'
import { getInfo, updateContenntItem, getContentItems,AddContentItem,getContentStoresURI } from '../api/api'
import type { PayloadType } from '../api/api'
import { CustomCellComponet } from '../AgGridCustomRelationShipWidget/CustomCellComponet';
import ChipRenderer from '../AgGridCustomRelationShipWidget/ChipRenderer';
import { ClinCellEditor } from '../AgGridCustomRelationShipWidget/BasicCellEditior';
import { SingleRelationSelect } from '../AgGridCustomRelationShipWidget/SingleRelationSelect';
import './ControllAssessmentAgGrid.scss';
import {RiskCellRenderer} from '../AgGridRiskComponent/RiskCellRenderer';
import PlusIcon from '../images/plusIcon.png'
interface ControllAssessmentAgGridProps{
  appDefId: number
}
interface OptionType {
  id: number,
  key?: string
  label: string,
  email?: string,
}
interface RiskRankType {
  id?: number
  Satisfactory?: boolean
 'Min Value'?: number
 'Max Value'?: number
 Name?: number
 Color?: string
}
interface ValueType {
  id?: number
  name?: string
  uase?: string
}
interface ObjectType {
  [key: string]: any
}
interface ControllAssessmentAgGridState{
    controlAssessmentColumns: ColDef[]
    rows: any[]
    payload: PayloadType,
    gridApi: any
    controlDeficiencyColumns: [],
    assessmentRiskRankAndScoreId:{
      'Risk Rank':Number,
      'Risk Score': Number,
    },
    deficiencyRiskRankAndScoreId:{
      'Highest Risk Rank':Number,
      'Highest Risk Score': Number,
    }
    riskRankCriteriaObj:{
      impact: number[],
      likelihood: number[],
      riskRankData: RiskRankType[]
    }
   
    controlDeficencyPrimaryFieldIds:{
      'Control': Number,'Control Assessment': Number, 'Program': Number,'Status': Number,'Assessment': Number,'Description': Number
    }
    multiSelectValue:OptionType[],
    singleSelectValue: OptionType,
    statusData:{
      controlAssessment: ObjectType,
      controlDeficiency: ObjectType
    },
    paginationConfig:{
      pageSize: number,
      currentPage: number,
      total: number
    }
    controlDeficiencyAssessmentPrimitiveId: number
    searchText: string
    assessmentId: number
    assessmentPrimitiveId: number
}

  function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
const editableColumns=['Maturity Score','Likelihood','Impact','Status']
const editableControlDeficiencyColumns=['Highest Risk','Highest Threat',"Description",'Highest Likelihood','Highest Impact','Other Threats','Other Risks','Status']
const displayControlDeficiencyColumns=['Highest Risk Rank',...editableControlDeficiencyColumns]
const primaryControlDeficiencyFields=['Control','Control Assessment', 'Program','Status','Assessment']
let displayColumns=['Control','Assessment',...editableColumns,'Risk Rank',"Evidence"]
const controlDeficencyColumnNames: any={
  'Maturity Score': 'Maturity Score',
  'Highest Risk':'Highest Risk',
  'Highest Likelihood': 'Likelihood',
  Status:'Status',
  'Highest Risk Rank': 'Risk',
  'Highest Impact':'Impact',
  'Other Threats':'Other Threats',
  'Other Risks': 'Other Risks',
  Description:"Description",
  'Highest Threat':'Highest Threat'

}
const columnObj: any={
  'Maturity Score': 'Maturity Score',
  Likelihood:'Likelihood',
  Impact: 'Impact',
  Status:'Status',
  Control:'Control',
  'Risk Rank':'Risk',
  'Evidence': 'Evidence',
  Assessment:'Assessment Answer'

}
function extractContent(str: string) {
  var span = document.createElement('span');
  span.innerHTML = str;
  return span.textContent || span.innerText;
};
function setValueFormatter(params: any) {
  return params?.value?.label || '';
}
let count=0;
const setStatusData=(responseData: any,primitiveId: number,statusObj: any)=>{
  responseData.forEach((response: any)=>{
    console.log('key===============>',response[primitiveId], primitiveId)
    Object.assign(statusObj,{[response[primitiveId].toString()]: response.id})
  })
}
const autoSizeAll=(params: any) => {
  setTimeout(()=>{
    let allColumnIds: any = [];
    params?.columnApi?.getColumns?.()?.forEach(function(column: any) {
      console.log('column::>', column)  
        console.log('inside if col', column)
      allColumnIds.push(column.colId);
  });
  console.log('set timeout colunm',allColumnIds)
  params?.columnApi?.autoSizeColumns?.(allColumnIds,false);
  
  },1000)
}
export default class ControllAssessmentAgGrid extends Component<ControllAssessmentAgGridProps,ControllAssessmentAgGridState> {
    // appDefId=187393;
    // controlAssessmentId=741392;
    // controlDeficencyId=747536;
    gridRef: any=createRef()
    detailGridRef: any=createRef()
    contentInsIdFromURI: any={
      controlAssessment: {
        uri: 'controlassessments',
        id: 0,
        appDefId:0
      },
      controlDeficiency: {
        uri: 'deficiencies',
        id: 0,
        appDefId:0
      },
      controlAssessmentAnswer:{
        uri: 'controlassessmentanswers',
        id: 0,
        appDefId:0
      },
      controlEvidence:{
        uri: 'controlevidence',
        id: 0,
        appDefId:0
      },assessments:{
        uri: 'assessments',
        id: 0,
        appDefId:0
      }
    }
     primitiveId: any={
      'Maturity Score' :0,
      'Likelihood' :0,
      'Impact' :0,
      'Status' :0,
      'Control':0,
      'Risk Rank': 0,
     }
  constructor(props: any){
    super(props);
    this.state={
        controlAssessmentColumns:[],
        rows:[],
        payload: this.getDefaultPayloadData(),
        gridApi: null,
        controlDeficiencyColumns: [],
        // riskRankData: [],
        riskRankCriteriaObj:{
          impact: [],
          likelihood: [],
          riskRankData: []
        },
        assessmentRiskRankAndScoreId:{
          'Risk Rank':0,
          'Risk Score':0,

        },
        deficiencyRiskRankAndScoreId:{
          'Highest Risk Rank':0,
          'Highest Risk Score':0,

        },
        controlDeficencyPrimaryFieldIds:{
          'Control': 0,'Control Assessment': 0, 'Program': 0,'Status': 0,'Assessment': 0,'Description': 0
        },
        multiSelectValue: [],
        singleSelectValue: {
          id: 0,
          label: ''
        },
        statusData:{
          controlAssessment: {},
          controlDeficiency: {}
        },
        paginationConfig:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        controlDeficiencyAssessmentPrimitiveId: 0,
        searchText: '',
        assessmentId: 0,
        assessmentPrimitiveId: 0
    }
  }
  getDefaultPayloadData=()=>{
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
  getRiskCriteriaValues=async(propgramContentInsId: number,propgramId: number)=>{
    console.log('risk criteria values------------------------------>')
    console.log({propgramContentInsId})
    console.log({propgramId})
    const programInfo=await getInfo(this.props.appDefId,propgramContentInsId)
    console.log({programInfo})
    let riskCriteriaPrimitiveId: number=0;
    programInfo.data?.fields?.map((field: any)=>{
      if (field.fieldType.itemName.toLowerCase() === "relationship" && field.name==="Risk Criteria") {
        console.log('risk criteria field====================>',field)
        riskCriteriaPrimitiveId=field.id
      }
    })
    console.log({programInfo})
    let query: any={"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": [propgramId]}}],"should":[]}},"from":0}
   
    const programResponse=await getContentItems(this.props.appDefId,propgramContentInsId,JSON.stringify(query))
    //3500050
    let riskCriteria={
      id: 0,
      contentInsId: 0
    };
    let rankCriteriIdObj: any={
      rank:{
        ids: [],
        contentInsId: 0
      },
      impact:{
        ids: [],
        contentInsId: 0
      },
      likelihood:{
        ids: [],
        contentInsId: 0
      }
    }
    let riskRanks: any={
      ids: [],
      contentInsId: 0
    }
    console.log({programResponse})
    programResponse.data?.results?.map((response: any)=>{
      riskCriteria.id= response?.[riskCriteriaPrimitiveId]?.[0]?.rightContentItem?.id
      riskCriteria.contentInsId= response?.[riskCriteriaPrimitiveId]?.[0]?.rightContentIns?.id

    })
    console.log({riskCriteria})
    let riskRankId: number;
    let riskRankIds: any={
      impact: 0,
      likelihood: 0,
      rank: 0,

    }
    const riskCriterianfo=await getInfo(this.props.appDefId,riskCriteria.contentInsId)
    riskCriterianfo.data?.fields?.map((field: any)=>{
      if (field.fieldType.itemName.toLowerCase() === "relationship" && field.name==="Risk Ranks") {
        riskRankIds.rank=field.id
      }
      else if (field.fieldType.itemName.toLowerCase() === "relationship" && field.name==="Impact Levels") {
        riskRankIds.impact=field.id
      }
      else if (field.fieldType.itemName.toLowerCase() === "relationship" && field.name==="Likelihood Levels") {
        riskRankIds.likelihood=field.id
      }
    })
    query={"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": [riskCriteria.id]}}],"should":[]}},"from":0}
    
    const riskCriteriaResponse=await getContentItems(this.props.appDefId,riskCriteria.contentInsId,JSON.stringify(query))
    console.log('risk idx=============================================>', riskRankIds)
    console.log('risk crietria response', riskCriteriaResponse)
    riskCriteriaResponse.data.results.map((response: any)=>{
        console.log('risk ranks:>',response[riskRankId])
        Object.keys(riskRankIds).map((riskId: any)=>{
          console.log('risk rank ids:>',riskRankIds[riskId])
          response?.[riskRankIds[riskId]]?.map((rank: any, index: number)=>{
            if(index===0){
              rankCriteriIdObj[riskId].contentInsId=rank.rightContentIns.id
            }
            rankCriteriIdObj[riskId].ids.push(rank.rightContentItem.id)
          })
        })
        // response?.[riskRankId]?.map((rank: any, index: number)=>{
        //   if(index===0){
        //     riskRanks.contentInsId=rank.rightContentIns.id
        //   }
        //     riskRanks.ids.push(rank.rightContentItem.id)
        // })
    })
    console.log('risk obj=============================================>', rankCriteriIdObj)
    

    console.log({riskCriteriaResponse})
    console.log({riskRanks})
    query={"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": rankCriteriIdObj.rank.ids}}],"should":[]}},"from":0}
    const riskRankInfo=await getInfo(this.props.appDefId,rankCriteriIdObj.rank.contentInsId)
    console.log({riskRankInfo})
    let riskFields: any=[]
    riskRankInfo.data.fields.forEach((field: any)=>{
      if(field?.primitives?.length){
        riskFields.push({id: field.primitives?.[0]?.id, key: field.name})

      }
    })
    
    const riskRankResponse=await getContentItems(this.props.appDefId,rankCriteriIdObj.rank.contentInsId,JSON.stringify(query))
    let riskRankData: RiskRankType[]=[];
    let riskRankObj: RiskRankType={};

    console.log({riskRankResponse})
    riskRankResponse.data?.results?.forEach((response: any)=>{
      riskFields.forEach((field: any)=>{
        riskRankObj={
          ...riskRankObj,
          id: response.id,
          [field.key]: response[field.id]
        }
      })
      riskRankData.push(riskRankObj)
      riskRankObj={}
    })
  console.log({riskRankData})
    return {
      impact: rankCriteriIdObj.impact.ids,
      likelihood: rankCriteriIdObj.likelihood.ids,
      riskRankData
    }
  }
  getPrimitivIds=(primitiveId: any)=>{
    console.log({primitiveId})
    if(isJsonString(primitiveId)){
        return JSON.parse(primitiveId)[0]
    }else{
        let ids: string[]=[]
        let match: any;
        let primitiveIds=primitiveId.trim().split("+")
        
        console.log({primitiveIds})
        primitiveIds?.forEach((id: string)=>{
            console.log('id==========================>', id)
            match =  id.match(/\[(.*?)\]/);
            console.log('match==============================>', match)
            if(match?.length>1){
                ids.push(match[1])
            }
        })
        console.log('ids', ids)
        return ids

    }
  }
  getRelationshipAttribute = (relationId: number, primitiveId: number | number[],maxCardinality: number,minCardinality: number,isParent: boolean, contentInsAppDefId: number,appDefId: number) => {
    console.log({maxCardinality})
    console.log({primitiveId})
    console.log({minCardinality})
   
    if(maxCardinality>1 || maxCardinality===-1){
        console.log('inside single relation=========================================================>', primitiveId)
        return {
            cellEditorPopup: true,
            valueFormatter:setValueFormatter,
            comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: any) => {
              if (valueA?.label === valueB?.label) return 0;
              return (valueA?.label > valueB?.label) ? 1 : -1;
            },
            cellEditorParams:{
            multiple:false,
            appDefId: appDefId,
            'isParent': isParent,
              primitiveId,
              relationContentInsId: relationId,
              handleChangeEvent: (leftContentItemID: number,rightContentItemID: number,contentInsRelationshipInsID: number, data: any, key: string,option: any,rowIndex: number,isParent: boolean)=>{
               let payloadData: any= this.getDefaultPayloadData()

                console.log('handle click data=====================>', data,option)
                if(isParent && key==="Status" && (!data['Impact']?.id || !data['Likelihood']?.id || !data['Maturity Score']?.id) && option.label.toLowerCase()==="completed"){
                  alert(`Cannot be marked 'Completed' until risk 'Impact' and 'Likelihood' are specified.`)
                  console.log('inside the completed conditio')
                  this.setState({payload: payloadData}) 
                  
                }else{
                console.log('update===================================================================>', key,option)
                console.log({data})
                console.log({rightContentItemID})
                console.log('data id:>', data[`${key}RelationIds`])
                if (data[key]?.id !== option?.id) {

                    console.log('inside the condition======================>')
                    payloadData.AddRelationships = [{
                      "LeftContentItemID": leftContentItemID, "RightContentItemID": rightContentItemID, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                    }]
                    if(data[key]?.id){
                    payloadData.RemoveRelationships = [{
                      "LeftContentItemID": leftContentItemID, "RightContentItemID": data[key]?.id, "ContentInsRelationshipInsID": contentInsRelationshipInsID

                    }]
                   
                  }
                }
                console.log({ payloadData })
                this.setState({payload: payloadData, singleSelectValue: option})
              }

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
      }else if((maxCardinality===1)){
        return {
            cellRenderer: ChipRenderer,
            cellRendererParams: {
              isMultipleRelation: true
            },
            comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: any) => {
              if (valueA === valueB) return 0;
              return (valueA > valueB) ? 1 : -1;
          },
            cellEditorPopup: true,
            cellEditorParams: {
              multiple:true,
            'isParent': isParent,
              appDefId: appDefId,
              relationContentInsId: relationId,
              primitiveId,
              contentInsAppDefId,
              maxCardinality,
              handleChangeEvent: (options: any, contentInsRelationshipInsID: number,key: string,currentData: any,rowIndex: number,isParent: boolean) => {
                console.log({currentData})
                console.log({key})
                console.log({options})
                  let payloadData: any= this.getDefaultPayloadData()
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
                this.setState({payload: payloadData, multiSelectValue: options})
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
  getEvidenceAndAssessmentAnswerValues=async(evidenceContentInsId: number,assesementAnswerContentInsId: number,assessmentId: number, evidenceAssessmentPrimitiveId: number,assessmentAnswerPrimitiveId: number)=>{
    console.log('evidenceContentInsId==============>',evidenceContentInsId, assessmentId)
  
    let query: any = { "sort": [{ "label.keyword": { "order": "asc" } }], "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query":  '*', "default_operator": "and", "fields": ["label"] } },{'term':{[`${assessmentAnswerPrimitiveId}.rightContentItem.id`]: assessmentId}}], "must_not": [{ "exists": { "field": "ownerContentDef" } }] } }, "from": 0 }
    let controlAssessmentAnswerResponse= await getContentItems(this.props.appDefId,assesementAnswerContentInsId,JSON.stringify(query))
    console.log({controlAssessmentAnswerResponse})
 //    let assessmentIds: number[]=[]
 
 let assessmentAnswers:OptionType[]=[]
    controlAssessmentAnswerResponse?.data?.results.map((controlAssessmentAnswer: any)=>{
     assessmentAnswers.push({id: controlAssessmentAnswer.id,label: controlAssessmentAnswer?.label})
 })


 query = { "sort": [{ "label.keyword": { "order": "asc" } }], "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query":  '*', "default_operator": "and", "fields": ["label"] } },{'term':{[`${evidenceAssessmentPrimitiveId}.rightContentItem.id`]: assessmentId}}], "must_not": [{ "exists": { "field": "ownerContentDef" } }] } }, "from": 0 }

//  query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query":  '*', "default_operator": "and", "fields": ["label"] } },{'term':{"4316178.rightContentItem.id": assessmentId}}], "must_not": [{ "exists": { "field": "ownerContentDef" } }] } }, "from": 0 }
 let evidences: OptionType[]=[];
 let evidenceResponse= await getContentItems(this.props.appDefId,evidenceContentInsId,JSON.stringify(query))
 console.log({evidenceResponse})
 evidenceResponse?.data?.results.map((evidence: any)=>{
  evidences.push({id: evidence.id,label: evidence?.label})
 })
 console.log({assessmentAnswers})
 console.log({evidences})
 return{
  assessmentAnswers,
  evidences,
  id: assessmentId
 }

 
  }
  setColumnAndRows=async(pageNo: number,pageSize: number,assessmentId?: number ,search='')=>{
    console.log('state----------------------->', this.state)
    this.gridRef?.current?.api?.showLoadingOverlay()
    const {controlAssessmentColumns,controlDeficiencyColumns,controlDeficiencyAssessmentPrimitiveId, assessmentPrimitiveId,searchText}=this.state


    let columns: any = [], detailsColumns: any =[]
    let program={
      contentInsId: 0,
      id: 0,
      primitiveId: 0
    }
    let assesmentObj={
      primitiveId: 0,
      id: 0,
    };
    let riskCriteriaObj:any={}
    let assesementRiskRankAndScorePrimitveId={...this.state.assessmentRiskRankAndScoreId}
    let deficiencyRiskRankAndScorePrimitveId={...this.state.deficiencyRiskRankAndScoreId}
    let controlDeficencyPrimaryFieldIds: any={...this.state.controlDeficencyPrimaryFieldIds}
    let controlDeficiencyAssessmentId=controlDeficiencyAssessmentPrimitiveId;
    let statusIds={
      controlAssessment: {
        primitiveId: 0,
        contentInsId: 0,

      },
      controlDeficiency: {
        primitiveId: 0,
        contentInsId: 0,

      },

    }
    let statusData={
      controlAssessment: {},
      controlDeficiency: {},
   }
   let contentURIList=Object.keys(this.contentInsIdFromURI).map((itemURI: string)=>{
    return this.contentInsIdFromURI?.[itemURI]?.uri
   })
   console.log({contentURIList})
   let query: any = {"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":0}
    if (controlDeficiencyColumns.length === 0) {
   
      const contentStoreURIResponse = await getContentStoresURI(this.props.appDefId,contentURIList);
      console.log({ contentStoreURIResponse })
      //controlassessments
      contentStoreURIResponse.data.results?.forEach((data: any) => {
        console.log('uri-------------->', data?.contentDef?.uri, this.contentInsIdFromURI.controlAssessment.uri)
        if (data?.uri === this.contentInsIdFromURI.controlAssessment.uri) {
          this.contentInsIdFromURI.controlAssessment.id = data?.id
          this.contentInsIdFromURI.controlAssessment.appDefId = data?.appDef?.id

        } else if (data?.uri === this.contentInsIdFromURI.controlDeficiency.uri) {
          this.contentInsIdFromURI.controlDeficiency.id = data?.id
          this.contentInsIdFromURI.controlDeficiency.appDefId = data?.appDef?.id
        } else if (data?.uri === this.contentInsIdFromURI.controlAssessmentAnswer.uri) {
          this.contentInsIdFromURI.controlAssessmentAnswer.id = data?.id
          this.contentInsIdFromURI.controlAssessmentAnswer.appDefId = data?.appDef?.id
        } else if (data?.uri === this.contentInsIdFromURI.controlEvidence.uri) {
          this.contentInsIdFromURI.controlEvidence.id = data?.id
          this.contentInsIdFromURI.controlEvidence.appDefId = data?.appDef?.id

        }else if (data?.uri === this.contentInsIdFromURI.assessments.uri) {
          this.contentInsIdFromURI.assessments.id = data?.id
          this.contentInsIdFromURI.assessments.appDefId =data?.appDef?.id
        }

      })
      // query= {"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"term":{"id": assessmentId}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":0}

      // const assessmentResponse = await getContentItems(this.props.appDefId,this.contentInsIdFromURI.assessments.id, JSON.stringify(query))
      // console.log({assessmentResponse})
      console.log('contentins ids:>', this.contentInsIdFromURI)
      const controlDeficiencyInfoResponse = await getInfo(this.props.appDefId, this.contentInsIdFromURI.controlDeficiency.id);
      console.log({ controlDeficiencyInfoResponse })

      controlDeficiencyInfoResponse?.data?.fields?.map(async (field: any) => {
        if (field.name === "Control Assessment") {
          controlDeficiencyAssessmentId = field.id;
        }
        if (primaryControlDeficiencyFields.includes(field.name)) {
          controlDeficencyPrimaryFieldIds[field.name] = field.id
        }

        if (field.name.toLowerCase() === 'highest risk score' && field?.primitives?.length) {
          console.log('field', field)
          deficiencyRiskRankAndScorePrimitveId['Highest Risk Score'] = field.primitives[0].id
        }
        if (!Object.keys(field).includes('fieldValueType') && displayControlDeficiencyColumns.includes(field.name)) {
          console.log('inside col=======================>', field.name)
          if (field.entityState.itemName !== "Deleted") {
            if (field.fieldType.itemName.toLowerCase() === "relationship" && editableControlDeficiencyColumns.includes(field.name)) {
              console.log('field:::::>', field)
              console.log('field:::::>', field?.right?.joinContentIns?.contentItemLabelFormula)
              let calculatedPrimitiveId = this.getPrimitivIds(field?.right?.joinContentIns?.contentItemLabelFormula)
              if (field.name.toLowerCase() === "status") {
                statusIds.controlDeficiency.contentInsId = field.right.joinContentIns.id
                statusIds.controlDeficiency.primitiveId = calculatedPrimitiveId

              }
              let otherColumnParams = this.getRelationshipAttribute(field?.right?.joinContentIns?.id, calculatedPrimitiveId, field?.right.maxCardinality, field?.right.minCardinality, false, controlDeficiencyInfoResponse?.data?.appDef?.id,this.contentInsIdFromURI.controlDeficiency.appDefId)
              console.log({ otherColumnParams })

              detailsColumns.push({
                id: field.id,
                'field': controlDeficencyColumnNames[field.name],
                // cellStyle: {display: 'flex', width: '100%'} ,
                autoHeaderHeight: true,
                cellClass: controlDeficencyColumnNames[field.name].split(' ').join('-'),
                autoHeight: true,
                ...otherColumnParams
              })

            } else if (Object.keys(field).includes('primitives')) {
              console.log('primitve column', field.name)
              if (field.name.toLowerCase() === 'description') {
                controlDeficencyPrimaryFieldIds[field.name] = field.primitives[0].id

                detailsColumns.push({
                  id: field?.primitives?.[0]?.id,
                  'field': controlDeficencyColumnNames[field.name],
                  cellEditorParams: {
                    maxLength: 1024,
                    rows: 10,
                    cols: 50,

                  },
                  cellEditorPopup: true,
                  editable: true,
                  autoHeight: true,

                  cellEditor: 'agLargeTextCellEditor',
                })
              } else
                detailsColumns.push({
                  id: field?.primitives?.[0]?.id,
                  'field': controlDeficencyColumnNames[field.name]
                })
            } else {
              console.log(' else column=================>', field.name)
              if (field.name.toLowerCase() === 'highest risk rank') {
                deficiencyRiskRankAndScorePrimitveId['Highest Risk Rank'] = field.id

                detailsColumns.push({
                  id: field.id,
                  'field': controlDeficencyColumnNames[field.name],
                  cellRenderer: RiskCellRenderer,
                  valueGetter: `{rankScore: data['Likelihood'], rankName: data['Impact']}`,
                  autoHeaderHeight: true,
                  comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: any) => {
                    console.log({valueA})
                    if (valueA === valueB) return 0;
                    return (valueA > valueB) ? 1 : -1;
                },
                  autoHeight: true,
                  cellRendererParams: {

                  },
                })
              } else {
                detailsColumns.push({
                  id: field.id,
                  'field': controlDeficencyColumnNames[field.name]
                })
              }
            }
          }
        }
      })
      const deficiencyStatusResponse = await getContentItems(this.props.appDefId, statusIds.controlDeficiency.contentInsId, JSON.stringify(query))
      console.log('control deficiency status res==>', deficiencyStatusResponse)
      setStatusData(deficiencyStatusResponse.data.results, statusIds.controlDeficiency.primitiveId, statusData.controlDeficiency)

    }
    if (controlAssessmentColumns.length === 0) {
      const infoResponse = await getInfo(this.props.appDefId, this.contentInsIdFromURI.controlAssessment.id);
      console.log({ infoResponse })

      infoResponse?.data?.fields?.map(async (field: any) => {
        if (field.name.toLowerCase() === 'program') {
          console.log('field', field)
          program.contentInsId = field.right.joinContentIns.id;
          program.primitiveId = field.id;

        }
        else if (field.name.toLowerCase() === 'risk rank') {
          console.log('field', field)
          assesementRiskRankAndScorePrimitveId['Risk Rank'] = field.id
        }
        else if (field.name.toLowerCase() === 'risk score' && field?.primitives?.length) {
          console.log('field', field)
          assesementRiskRankAndScorePrimitveId['Risk Score'] = field.primitives[0].id
        }
        if (!Object.keys(field).includes('fieldValueType') && displayColumns.includes(field.name)) {
          if (field.entityState.itemName !== "Deleted") {
            if (field.fieldType.itemName.toLowerCase() === "relationship" && editableColumns.includes(field.name)) {
              console.log('control assessment field:::::>', field)
              console.log('control assessment field:::::>', field?.right?.joinContentIns?.contentItemLabelFormula)

              let calculatedPrimitiveId = this.getPrimitivIds(field?.right?.joinContentIns?.contentItemLabelFormula)
              this.primitiveId[field.name]= field.id

              if (field.name.toLowerCase() === "status") {
                statusIds.controlAssessment.contentInsId = field.right.joinContentIns.id
                statusIds.controlAssessment.primitiveId = calculatedPrimitiveId
              }
              let otherColumnParams = this.getRelationshipAttribute(field?.right?.joinContentIns?.id, calculatedPrimitiveId, field?.right.maxCardinality, field?.right.minCardinality, true, infoResponse?.data?.appDef?.id,this.contentInsIdFromURI.controlAssessment.appDefId)
              console.log({ otherColumnParams })

              columns.push({
                id: field.id,
                'field': columnObj[field.name],
                autoHeaderHeight: true,
                autoHeight: true,
                ...otherColumnParams
              })

            } else if (Object.keys(field).includes('primitives')) {
              console.log('control assessment primitve field ======================>', field)

              columns.push({
                id: field?.primitives?.[0]?.id,
                'field': columnObj[field.name],
                autoHeaderHeight: true,
                autoHeight: true,
                
              })
            } else {
              console.log('control assessment field else======================>', field)
              if (field.name.toLowerCase() === "evidence") {
              this.primitiveId[field.name]= field.id

                columns.push({
                  id: field.id,
                  'field': columnObj[field.name],
                  autoHeaderHeight: true,
                  autoHeight: true,
                  cellRenderer: ChipRenderer,
                  
                  cellEditorParams: {
                    appDefId: this.props.appDefId,
                    relationContentInsId: field?.right?.joinContentIns?.id,
                    contentInsAppDefId: infoResponse?.data?.appDef?.id
                  }
                })
              }
              else if (field.name.toLowerCase() === 'risk rank') {
              this.primitiveId[field.name]= field.id

                console.log('inside include====================================================')
                columns.push({
                  id: field.id,
                  'field': columnObj[field.name],
                  //cellStyle: {display: 'flex', width: '100%'} ,
                  cellRenderer: RiskCellRenderer,
                  valueGetter: `{rankScore: data.Likelihood, rankName: data.Impact}`,
                  autoHeaderHeight: true,
                //   comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: any) => {
                //     if (valueA === valueB) return 0;
                //     return (valueA > valueB) ? 1 : -1;
                // },
                  autoHeight: true,
                  cellRendererParams: {
                  },
                })
              } else if (field.name.toLowerCase().includes("assessment")) {
                assesmentObj.primitiveId = field.id
                console.log('inside assesment====================================================',field)
                columns.push({
                  id: field.id,
                  'field': columnObj[field.name],
                  autoHeaderHeight: true,
                  autoHeight: true,
                  cellRenderer: ChipRenderer,
                  cellEditorParams: {
                    appDefId: this.props.appDefId,
                    relationContentInsId: this.contentInsIdFromURI.controlAssessmentAnswer.id,
                    contentInsAppDefId: infoResponse?.data?.appDef?.id

                  },
                })
                columns.push({
                  id: field.id,
                  'field': field.name,
                  autoHeaderHeight: true,
                  autoHeight: true,
                })
              }
              else {
                console.log('assessment else coulumn:>',field)
              this.primitiveId[field.name]= field.id

                columns.push({
                  id: field.id,
                  'field': columnObj[field.name],
                  valueFormatter: setValueFormatter,
                  comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: any) => {
                    if (valueA === valueB) return 0;
                    return (valueA > valueB) ? 1 : -1;
                },
                  autoHeaderHeight: true,
                  autoHeight: true,
                })
              }
            }

          }
        }
      })
      console.log('this.primitiveId---------------================>',this.primitiveId)
      const assessmentStatusResponse = await getContentItems(this.props.appDefId, statusIds.controlAssessment.contentInsId, JSON.stringify(query))
      console.log('control deficiency status res==>', assessmentStatusResponse)
      setStatusData(assessmentStatusResponse.data.results, statusIds.controlAssessment.primitiveId, statusData.controlAssessment)

    }
    console.log('controlDeficencyPrimaryFieldIds====>',controlDeficencyPrimaryFieldIds)
    console.log('assesementRiskRankAndScorePrimitveId=============>',assesementRiskRankAndScorePrimitveId)
    console.log('deficiencyRiskRankAndScorePrimitveId=============>',deficiencyRiskRankAndScorePrimitveId)
    console.log('status content ins id:>',statusIds)
    
    console.log({program})
  
   
   
   console.log({statusData})
   query={"sort":[{"id":{"order":"desc"}}],"size":pageSize,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":((pageNo>0?pageNo-1:0) * pageSize)}
   if(search){
    query.query.bool.must.push({"simple_query_string":{"query": searchText+"*","default_operator":"and","fields":["entityState.itemName","label",`${this.primitiveId.Control}.rightContentItem.label.keyword`,`${this.primitiveId.Likelihood}.rightContentItem.label.keyword`,`${this.primitiveId.Impact}.rightContentItem.label.keyword`,`${this.primitiveId['Maturity Score']}.rightContentItem.label.keyword`,`${this.primitiveId.Status}.rightContentItem.label.keyword`,`${this.primitiveId['Risk']}.rightContentItem.label.keyword`]}})
 
  }
   if(assessmentId){
    query.query.bool.must.push({"term":{[`${assesmentObj.primitiveId || assessmentPrimitiveId}.rightContentItem.id`]:assessmentId}})
   }
   const response = await getContentItems(this.props.appDefId,this.contentInsIdFromURI.controlAssessment.id,JSON.stringify(query))
    let controlAssessmentItemIds: number[]=[]
    response.data.results.map((data: any)=>{
      controlAssessmentItemIds.push(data.id)
    })
    query={"sort":[{"id":{"order":"desc"}}],"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms":{[`${controlDeficiencyAssessmentId}.rightContentItem.id`]: controlAssessmentItemIds}}],"should":[]}},"from":0}
   
    const controlDeficencyResponse = await getContentItems(this.props.appDefId,this.contentInsIdFromURI.controlDeficiency.id,JSON.stringify(query))
    console.log('controlDeficiencyAssessmentPrimitiveId=================>',controlDeficiencyAssessmentId)
    console.log('resonse==============>', response)
    console.log('controlDeficencyResponse==============>', controlDeficencyResponse)
    
    let options: any[] = []
    let controlDeficencyRows: any[] = []

    let obj = {}, user: any[] = [],singleValue={id:0,label:''}, relationIds: number[] = [];
    if(detailsColumns.length===0){
      detailsColumns=controlDeficiencyColumns
    }
    console.log({detailsColumns})
    controlDeficencyResponse.data.results.forEach((controlDeficiency: any, index: number) => {
      if (controlDeficiency?.[controlDeficiencyAssessmentId]?.length > 0) {
        obj = {
          id: controlDeficiency.id,
          controlAssessmentId: controlDeficiency?.[controlDeficiencyAssessmentId]?.map((item: any) => item.rightContentItem.id),
        }
        console.log('record===->',controlDeficiency)
        detailsColumns.forEach((column: any) => {

          if (column?.cellEditorParams && Object.keys(column.cellEditorParams).includes('relationContentInsId')) {
            console.log("deficiency column :>", column)

            controlDeficiency?.[column.id]?.forEach((value: any) => {
              console.log("ismultiple:>", column?.cellRendererParams?.isMultipleRelation)
              if (Boolean(column?.cellRendererParams?.isMultipleRelation))
                user.push({ label: value?.rightContentItem?.label, id: value?.rightContentItem?.id })
              else
                singleValue = { label: value?.rightContentItem?.label, id: value?.rightContentItem?.id }

              relationIds.push(value?.rightContentItem?.id)
            })
            Object.assign(obj, { [column.field]: (user.length > 0 || !controlDeficiency?.[column.id])  ? user : singleValue, [`${column.field}RelationIds`]: relationIds })
            user = []
            relationIds = []
            singleValue = {
              id: 0,
              label: ''
            }
          } else if (Array.isArray(controlDeficiency[column.id])) {
            Object.assign(obj, {
              [column.field]: controlDeficiency[column.id][0]?.rightContentItem?.label
            })
          } else {
            console.log('defecency col=========================>', column)
            if (column.field === "Description") {
              Object.assign(obj, {
                [column.field]: extractContent(controlDeficiency[column.id])
              })
            } else {
              Object.assign(obj, {
                [column.field]: controlDeficiency[column.id]
              })
            }

          }

        })

        controlDeficencyRows.push(obj)
      }
    })
    console.log('controlDeficencyRows==============================>',controlDeficencyRows)
    let filterControlDeficencyRows: any={}
    controlDeficencyRows.forEach((row)=>{
      row['controlAssessmentId'].forEach((controlAssessmentId: any)=>{
        if(!filterControlDeficencyRows[controlAssessmentId]){
        Object.assign(filterControlDeficencyRows,{[controlAssessmentId]:[row]})
        }else{
          filterControlDeficencyRows[controlAssessmentId].push(row)
        }

      })
    })
    console.log({filterControlDeficencyRows})
    obj={}
    let evidenceAndAssessment: any={};
    let controlAssessmentIds={
      evidence: 0,
      assessmentAnswer: 0,
    }
    const evidenceInfoResponse = await getInfo(this.props.appDefId, this.contentInsIdFromURI.controlEvidence.id);
    evidenceInfoResponse.data?.fields?.map((field: any)=>{
     if(field.name.toLowerCase()==="control assessments"){
       controlAssessmentIds.evidence=field.id
     }
   
     })
      const assessmentAnswerInfoResponse = await getInfo(this.props.appDefId, this.contentInsIdFromURI.controlAssessmentAnswer.id);
    assessmentAnswerInfoResponse.data?.fields?.map((field: any)=>{
      if(field.name.toLowerCase()==="control assessments"){
        controlAssessmentIds.assessmentAnswer=field.id
      }
    })
    console.log({controlAssessmentIds})
    let promises=response.data.results.map(async(item: any) => this.getEvidenceAndAssessmentAnswerValues(this.contentInsIdFromURI.controlEvidence.id,this.contentInsIdFromURI.controlAssessmentAnswer.id,item.id,controlAssessmentIds.evidence,controlAssessmentIds.assessmentAnswer)
    );
   const data: any= await Promise.all(promises)
   console.log('async data====================>',data)
   
   data?.forEach((res: any)=>{
    console.log('res====>', res)
  Object.assign(evidenceAndAssessment,{[res.id]:res})
   })
   console.log("evidenceAndAssessment===========>",evidenceAndAssessment)
   if(columns.length===0){
    columns=controlAssessmentColumns
  }
  console.log({columns})
    response.data.results.forEach(async(item: any, index: number) => {
      console.log('inside item==============>',item)
      console.log('primitve val=================>',item[program.primitiveId])

      obj = {
        id: item.id,
        Program: {id: item[program.primitiveId]?.[0]?.rightContentItem.id, label:  item[program.primitiveId]?.[0]?.rightContentItem.label}
      }
      program.id=item[program.primitiveId]?.[0]?.rightContentItem?.id
      console.log('assesement===================>',item[assesmentObj.primitiveId])
      assesmentObj.id=item.id
      console.log('control assessment column------------>',columns)
      columns?.forEach((column: any) => {
       
        console.log('inside coumns assessment--------->', column,item)
        if (column.field!=="Evidence" && column.field!=='Assessment Answer'  && (column?.cellEditorParams && Object.keys(column.cellEditorParams).includes('relationContentInsId')) || (Object.keys(controlDeficencyPrimaryFieldIds).includes(column.field))) {
          item?.[column.id]?.forEach((value: any) => {
            console.log('column for control assessemnt============>', column)
            console.log("ismultiple:>",column?.cellRendererParams?.isMultipleRelation)
            console.log({value})
            if(Boolean(column?.cellRendererParams?.isMultipleRelation))
              user.push({ label: value?.rightContentItem?.label, id: value?.rightContentItem?.id })
            else 
            singleValue={label:value?.rightContentItem?.label,id: value?.rightContentItem?.id}

            relationIds.push(value?.rightContentItem?.id)
          })
          console.log('field inside assessment:>',column.field,relationIds)

          Object.assign(obj, { [column.field]: user.length?user:singleValue, [`${column.field}RelationIds`]: relationIds })
          user = []
          singleValue={
            id: 0,
            label: ''
          }
          relationIds = []
        } else if(Array.isArray(item[column.id])) {
          console.log('inside the array condiiton',column)
           if(column.field.toLowerCase()==='evidence'){
           
            console.log('evidence column',column)
            console.log({evidenceAndAssessment})
            Object.assign(obj, {
              [column.field]: evidenceAndAssessment[item.id.toString()].evidences
            })
          }else if(column.field.toLowerCase()==="assessment answer"){
            console.log('assessment column',column,item.id)
  
            console.log({evidenceAndAssessment})
            Object.assign(obj, {
              [column.field]: evidenceAndAssessment[item.id.toString()].assessmentAnswers
            })
          }
          else{
            console.log('else field=============>',column)
          Object.assign(obj, {
            [column.field]: item[column.id][0]?.rightContentItem?.label
          })
        }

        } else if(column.field.toLowerCase()==='evidence'){
           
          console.log('evidence column',column)
          console.log({evidenceAndAssessment})
          Object.assign(obj, {
            [column.field]: evidenceAndAssessment[item.id.toString()].evidences
          })
        }else{
          console.log('else column field=============>',column)
          Object.assign(obj, {
            [column.field]: item[column.id]
          })
        }

      })
      console.log('current row=============>', obj);
    
      Object.assign(obj, {
        children: filterControlDeficencyRows[item.id] || []
      })
      options.push(obj)

    })
    console.log({assesmentObj})

    console.log('after program', program)
    let cols: any = []
    let deficiencyCols: any=[]

    if (controlAssessmentColumns.length === 0) {
     riskCriteriaObj=await this.getRiskCriteriaValues(program.contentInsId,program.id)

      columns.forEach((column: any) => {
        console.log('condition col=======================>', column.field)
        console.log('condition risk data=======================>', riskCriteriaObj?.riskRankData?.length)
        //valueFormatter
        if (column.field.toLowerCase() === 'control') {
          cols[0] = { ...column, cellRenderer: 'agGroupCellRenderer',  }
        } else if (column.field.toLowerCase() === 'assessment answer') {
          cols[1] = column
        } else if (column.field.toLowerCase() === 'maturity score') {
          cols[2] = column
        } else if (column.field.toLowerCase() === 'likelihood') {
          column.cellEditorParams = {
            ...column.cellEditorParams,
            filterIds: riskCriteriaObj.likelihood
          }
          cols[3] = column
        } else if (column.field.toLowerCase() === 'impact') {
          column.cellEditorParams = {
            ...column.cellEditorParams,
            filterIds: riskCriteriaObj.impact
          }
          cols[4] = column
        } else if (column.field.toLowerCase() === 'risk') {
          column.cellRendererParams = { ...column.cellRendererParams, riskRankData: riskCriteriaObj.riskRankData, sortable: true }
          cols[5] = column
        } else if (column.field.toLowerCase() === 'status') {
          cols[6] = column
        } else if (column.field.toLowerCase() === 'evidence') {
          cols[7] = column
        }
      })
    }
    if (controlDeficiencyColumns.length === 0) {
    detailsColumns.forEach((column: any)=>{
      console.log('condition col=======================>',column.field.toLowerCase().includes('risk'))
      console.log('condition risk data=======================>',riskCriteriaObj?.riskRankData?.length)
      if(column.field.toLowerCase()==='description'){
        deficiencyCols[0]=column
      }else  if(column.field.toLowerCase()==='highest threat'){
        deficiencyCols[1]=column
      }else  if(column.field.toLowerCase()==='highest risk'){
        deficiencyCols[2]=column
      }else  if(column.field.toLowerCase()==='likelihood'){
        column.cellEditorParams={
          ...column.cellEditorParams,
          filterIds: riskCriteriaObj.likelihood
        }
        deficiencyCols[3]=column
      }else  if(column.field.toLowerCase()==='impact'){
        column.cellEditorParams={
          ...column.cellEditorParams,
          filterIds: riskCriteriaObj.impact
        }
        deficiencyCols[4]=column
      }else  if(column.field.toLowerCase()==='risk'){
        column.cellRendererParams={...column.cellRendererParams,riskRankData: riskCriteriaObj.riskRankData}
        deficiencyCols[5]=column
      }else  if(column.field.toLowerCase()==='other threats'){
        deficiencyCols[6]=column
      }else  if(column.field.toLowerCase()==='other risks'){
        deficiencyCols[7]=column
      }else  if(column.field.toLowerCase()==='status'){
        deficiencyCols[8]=column
      }
    })
  }
            
    console.log({riskCriteriaObj}) 
    console.log('rows================================================>',options)
    console.log('sort columns=================================>',cols)
    console.log('detailsColumns=================>', deficiencyCols)
    if(controlAssessmentColumns.length===0){
      this.setState({paginationConfig:{...this.state.paginationConfig, total: response?.data?.total || 0},controlAssessmentColumns:cols, rows: options,controlDeficiencyColumns: deficiencyCols,riskRankCriteriaObj:riskCriteriaObj,assessmentRiskRankAndScoreId:assesementRiskRankAndScorePrimitveId,deficiencyRiskRankAndScoreId:deficiencyRiskRankAndScorePrimitveId,controlDeficencyPrimaryFieldIds:controlDeficencyPrimaryFieldIds,statusData:statusData,controlDeficiencyAssessmentPrimitiveId:controlDeficiencyAssessmentId,assessmentPrimitiveId: assesmentObj.primitiveId})
    }else{
      this.setState({paginationConfig:{...this.state.paginationConfig, total: response?.data?.total || 0},rows: options})

    }
    this.gridRef?.current?.api?.hideOverlay()
    console.log('columns===============================>', columns)
  }
 
  componentWillMount(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const assessmentId=urlParams.get('asmtid')
  if(assessmentId){
  this.setState({assessmentId: Number.parseInt(assessmentId)})
  console.log({assessmentId})
  this.setColumnAndRows(this.state.paginationConfig.currentPage,this.state.paginationConfig.pageSize,Number.parseInt(assessmentId))

}else{
  this.setColumnAndRows(this.state.paginationConfig.currentPage,this.state.paginationConfig.pageSize)
}
   
  }
componentDidUpdate(prevProps: Readonly<ControllAssessmentAgGridProps>, prevState: Readonly<ControllAssessmentAgGridState>, snapshot?: any): void {
console.log('component didupdate======================================>', this.state.gridApi)
  }

onGridReady=async(params: any)=>{
  this.setState({gridApi: params})
}

 onFirstDataRendered(params: any) {
  params.api.sizeColumnsToFit();
  autoSizeAll(params)
  
}
pickExistingRowNodeAtRandom(gridApi: GridApi, rowIndex: number) {
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

updateOneRecord(value: any, field: string, gridApi: any, rowIndex: number) {
  console.log('update value==========>', value, field)
  var rowNodeToUpdate = this.pickExistingRowNodeAtRandom(gridApi.api!, rowIndex);
  console.log('row update=============================>',rowNodeToUpdate)
  if (!rowNodeToUpdate) return;

  rowNodeToUpdate.setDataValue(field, value);
}
async handleAddClick(){
  console.log('click is call---------------------================',this.state)
  console.log('sub on grid ready================>', )
    let bodyFormData = new FormData();
    bodyFormData.append('languageCulture',' en-US')
    bodyFormData.append('displayNameId','-1')

    let statusData: any = { ...this.state.statusData.controlDeficiency }
    let parentRow: any;
    this.gridRef.current.api.forEachLeafNode((row: any) => {
      if (row.expanded) {
        parentRow = row
        console.log('row--===-=>', row)

      }
    })
    if (parentRow) {
      try {
        let payload: any = {}
        for (let [key, val] of Object.entries(this.state.controlDeficencyPrimaryFieldIds)) {
          console.log('obj===>', key, val)
          if (key === 'Status' && statusData['Open']) {
            Object.assign(payload, { [key]: {label:'Open',id:statusData['Open']} })
            bodyFormData.append(val.toString(), statusData['Open'])
          }
          else if (parentRow.data[key]) {
            Object.assign(payload, { [key]: parentRow.data[key] })
            bodyFormData.append(val.toString(), typeof parentRow.data[key] === "object" ? parentRow.data[key].id : parentRow.data[key])

          } else if (key === "Control Assessment") {
            Object.assign(payload, { [key]: parentRow.data.id })
            bodyFormData.append(val.toString(), parentRow.data.id)

          }
          else if (key === "Description") {
            Object.assign(payload, { [key]: "test" })
            bodyFormData.append(val.toString(), 'test')

          }
        }
        console.log({ payload })
         console.log('this.detailGridRef.current ====>', this.gridRef.current)
        this?.detailGridRef?.current?.api.showLoadingOverlay();
              
        let addResponse: any = await AddContentItem(this.contentInsIdFromURI.controlDeficiency.appDefId, this.contentInsIdFromURI.controlDeficiency.id, bodyFormData)
        if(addResponse){
          console.log({addResponse})
          // this.detailGridRef.current.api.updateRowData({
          //   add: [newRowObj],
          //   addIndex: 0, // YOU CAN PASS THE INDEX AT WHICH THE NEW ROW IS TO BE ADDED
          // });
          this.state.controlDeficiencyColumns.forEach((col: any)=>{
            if(Object.keys(payload).length && !payload[col.field]){
             
             Object.assign(payload, { [col.field]: col?.cellRendererParams?.isMultipleRelation?[]:{}})
            } 

           })

           Object.assign(payload, { id: addResponse?.data?.entityID})
       
           let selectedRowData: any =[]
           this.gridRef.current.api.forEachNodeAfterFilterAndSort((row: any) => {
             if(row.data.id===parentRow.data.id){

             selectedRowData.push({
               ...row.data,
               children: [...row.data.children || [],...[payload]]
             })
           }else{
             selectedRowData.push(row.data)
           }
           }) 
           console.log({selectedRowData})
           const res=this.gridRef.current.api!.applyTransaction({update: selectedRowData})
           console.log({res})
           this.detailGridRef.current.api.hideOverlay();
        }
      
      } catch (error: any) {
        this.detailGridRef.current.api.hideOverlay();

        console.log({ error })
      }

    }
   
}
  detailCellRendererParams = () => {
    const tabToNextChildCell = (params: TabToNextCellParams): CellPosition | null => {
      console.log('tab next cell child params==============>',params)  
     console.log('this.gridRef.current=============>',this.gridRef.current)
     let selectedRow: any=params.api.getRenderedNodes()[0]['data'];
     let count = 0;
     let rows: any=[];
     
     
    this.gridRef.current.api.forEachNodeAfterFilter((row: any) =>{
     rows.push(row)
    });
     console.log('row count====================>',rows)
     
     console.log('current row data=========================------>',selectedRow)

      if(!params.nextCellPosition && params.previousCellPosition.rowIndex===0 && params.backwards){
        console.log('go to previouse row========================>',selectedRow.index)
        let previousRowIndex=0;
        rows.forEach((row: any)=>{
          if(row.data.id===selectedRow.controlAssessmentId[0]){
            console.log('matched row',row)
            previousRowIndex=row.rowIndex;
          }
        })
        console.log({previousRowIndex})
        setTimeout(()=>{
        this.onBtStartEditing(this.gridRef.current,'Status', previousRowIndex)

        },1000)
        return null

      }
      else if (!params.nextCellPosition &&  params.previousCellPosition.column.getColId()==="Status") {
        console.log('go to next row=================================>',selectedRow.index)
        // let nextRowIndex=rows[+selectedRow.index<(rows.length-1)?+selectedRow.index+1: selectedRow.index-1].rowIndex 
        let nextRowIndex=0
        rows.forEach((row: any, index: number)=>{
          if(row.data.id===selectedRow.controlAssessmentId[0]){
            console.log('matched row',row)

            nextRowIndex=(rows.length - 1)===index?index:rows[index+1].rowIndex;
          }
        })
        setTimeout(()=>{
          this.onBtStartEditing(this.gridRef.current,'Maturity Score',nextRowIndex)
        },1000)
      return null

      }
        else if (!params.nextCellPosition &&  params.previousCellPosition.rowIndex>0) {
          console.log('default tab=============')
          return params.previousCellPosition;
        }else {
        return params.nextCellPosition;
        }
    }
    console.log('column in cell params render=======================>', this.state.controlDeficiencyColumns)
    if (this.state.controlDeficiencyColumns.length) {
      return {
        detailGridOptions: {
          columnDefs: this.state.controlDeficiencyColumns,
          className:'subGrid',
          id: 'subGrid',
          ref: this.detailGridRef,
          singleClickEdit: true ,
          stopEditingWhenCellsLoseFocus:true,          
          defaultColDef: { flex: 1, autoHeight: true, sortable: true,},
          onCellKeyDown:(params: any)=>{
            if(params.event.keyCode === 13) {
              var currentCell = params.api.getFocusedCell();console.log({currentCell})
              var finalRowIndex = params.api.paginationGetRowCount()-1;
              if (currentCell?.rowIndex === finalRowIndex) {
                  return;
              }
              params.api.stopEditing();
              params.api.clearFocusedCell();
        
              params.api.startEditingCell({
                rowIndex: Number.parseInt(currentCell.rowIndex),
                colKey:currentCell.column.colId
              });
          }
          },
          onGridReady:async (params: any)=>{
            params.api.setHeaderHeight(80);
            let ele: any=document.querySelectorAll('.subGrid');
            console.log('element-------------------->',ele)
            const newNode = document.createElement("div");
            newNode.classList.add('addDeficiencyButton')
            const titleNode = document.createElement("div");
            titleNode.classList.add('ag-header-row')
            titleNode.classList.add('ag-header-row-column')
            titleNode.classList.add('deficiencyTitle')

            titleNode.innerHTML= 'Deficiencies'
            console.log('parent node', ele)
            ele.forEach(((d: any,index: number) => {    
              let headerElement=d?.querySelector('.ag-header-container')
              console.log('children------------------->',headerElement)
              headerElement?.append?.(titleNode)
              newNode.innerHTML=`<button id='add-btn${index}'><img src='https://squad1e.emgage-dev2.com/api/v1/appdefs/2049/contentinses/3088/items/12051476/file' class='plusIcon' /> Add deficiency</button>`
              d.append(newNode)
              document.getElementById(`add-btn${index}`)?.addEventListener('click',()=>{this.handleAddClick()})

            }))

            console.log('sub on grid ready================>', params)
            let subRow=params.api.getDisplayedRowAtIndex(0)
            console.log({subRow})
            if (!subRow) {
              let bodyFormData = new FormData();
              bodyFormData.append('languageCulture',' en-US')
              bodyFormData.append('displayNameId','-1')

              let statusData: any = { ...this.state.statusData.controlDeficiency }
              let parentRow: any;
              this.gridRef.current.api.forEachLeafNode((row: any) => {
                console.log({row})
                if (row.expanded && (row.data.children.length===0 || !row.data.children)) {
                  parentRow = row
                  console.log('row--===-=>', row)

                }
              })
              let isSatisFactory;
              console.log('riskrankdata==================>',this.state.riskRankCriteriaObj.riskRankData)
              this.state.riskRankCriteriaObj.riskRankData.forEach((riskRank: RiskRankType)=>{
                if(riskRank.Name===parentRow?.data?.['Risk']){
                  console.log('risk rank---------------------->',riskRank)
                  isSatisFactory=riskRank?.Satisfactory?.toString()?.toLowerCase()==="true"?true:false
                }
              })
              if (parentRow && !isSatisFactory) {
                try {
                  let payload: any = {}
                  for (let [key, val] of Object.entries(this.state.controlDeficencyPrimaryFieldIds)) {
                    console.log('obj===>', key, val)
                    if (key === 'Status' && statusData['Open']) {
                      Object.assign(payload, { [key]: {label:'Open',id:statusData['Open']} })
                      bodyFormData.append(val.toString(), statusData['Open'])
                    }
                    else if (parentRow.data[key]) {
                      Object.assign(payload, { [key]: parentRow.data[key] })
                      bodyFormData.append(val.toString(), typeof parentRow.data[key] === "object" ? parentRow.data[key].id : parentRow.data[key])

                    } else if (key === "Control Assessment") {
                      Object.assign(payload, { [key]: parentRow.data.id })
                      bodyFormData.append(val.toString(), parentRow.data.id)

                    }
                    else if (key === "Description") {
                      Object.assign(payload, { [key]: "test" })
                      bodyFormData.append(val.toString(), 'test')

                    }
                  }
                  console.log({ payload })
                  console.log('params ====>', params)
                  console.log('this.detailGridRef.current ====>', this.gridRef.current)
                
                  let addResponse: any = await AddContentItem(this.contentInsIdFromURI.controlDeficiency.appDefId,this.contentInsIdFromURI.controlDeficiency.id, bodyFormData)
                  if(addResponse){
                    console.log({addResponse})
                    // this.detailGridRef.current.api.updateRowData({
                    //   add: [newRowObj],
                    //   addIndex: 0, // YOU CAN PASS THE INDEX AT WHICH THE NEW ROW IS TO BE ADDED
                    // });
                    this.state.controlDeficiencyColumns.forEach((col: any)=>{
                      if(Object.keys(payload).length && !payload[col.field]){
                       
                       Object.assign(payload, { [col.field]: col?.cellRendererParams?.isMultipleRelation?[]:{}})
                      } 
   
                     })

                     Object.assign(payload, { id: addResponse?.data?.entityID})
                 
                     let selectedRowData: any =[]
                     this.gridRef.current.api.forEachNodeAfterFilterAndSort((row: any) => {
                       if(row.data.id===parentRow.data.id){
                       selectedRowData.push({
                         ...row.data,
                         children: [payload]
                       })
                     }else{
                       selectedRowData.push(row.data)
                     }
                     }) 
                     console.log({selectedRowData})
                     const res=this.gridRef.current.api!.applyTransaction({update: selectedRowData})
                     console.log({res})
                  }
                
                } catch (error: any) {
                  console.log({ error })
                }

              }
              // console.log({lastrow})
            }
          autoSizeAll(params)
          },
          onCellEditingStarted:(params: any)=>{
            count=0
          },
          onCellEditingStopped:async (event: any) => {
            try {
            const {payload,multiSelectValue,singleSelectValue,riskRankCriteriaObj} =this.state
            console.log('cell editing stopper:::::::::::::::::>',event, payload)
            if (payload.AddRelationships.length || payload.RemoveRelationships.length || payload.ReplaceRelationships.length || (event.column.colId==="Description" && event.oldValue!==event.value)) {
            
              payload.ItemIDs = [event?.data?.id]
              console.log('column:>',event?.columnApi?.columnModel?.columnDefs)

              if((event.column.colId==='Highest Likelihood' || event.column.colId==="Highest Impact") && (event.data["Highest Impact"]?.label && event.data['Highest Likelihood']?.label)){
                let riskRankObj=this.getRiskScoreAndRank(singleSelectValue,event.column.colId==='Highest Likelihood'?event.data['Highest Impact']:event.data['Highest Likelihood'])
                
                payload.AddRelationships.push({LeftContentItemID:event.data.id,RightContentItemID:riskRankObj.calculatedRank.id,ContentInsRelationshipInsID: +this.state.assessmentRiskRankAndScoreId['Risk Rank']})
                riskRankCriteriaObj.riskRankData.forEach((riskRank: RiskRankType)=>{
                  console.log('risk rank--------------==>', riskRank)
                  if(riskRank.Name===event.data.Risk){
                    console.log('inside the condition')
                  
                    if(riskRankObj.calculatedRank.id===riskRank.id){
                    payload.AddRelationships= payload.AddRelationships.filter((item)=> item.RightContentItemID!==riskRank.id)
                    }else payload.RemoveRelationships.push({LeftContentItemID:event.data.id,RightContentItemID:riskRank.id,ContentInsRelationshipInsID: +this.state.assessmentRiskRankAndScoreId['Risk Rank']})
                  }
                })
                this.updateOneRecord(riskRankObj?.calculatedRank?.Name,'Risk',this.detailGridRef.current,event.rowIndex)
                payload.Fields = [{ ID: +this.state.assessmentRiskRankAndScoreId['Risk Score'], Value: riskRankObj.riskScore}]
                
              }
              else if(event.column.colId==='Description'){
                let fieldObj={
                  id: 0,
                  field: ''
                }
                event?.columnApi?.columnModel?.columnDefs?.forEach((column: any, )=>{
                  if(column.field.toLowerCase()==='description'){
                    fieldObj={
                      id: column.id,
                      field: column.field,
  
                    }
                  }
                })
                console.log({fieldObj}) 
              payload.Fields = [{ ID: fieldObj.id || event?.columnApi?.columnModel?.columnDefs?.[0]?.id, Value: event.data[fieldObj.field] }]
              }else{
                payload.Fields=[]
              }
             
              console.log("inside cell editor :>",payload)
              event.api.showLoadingOverlay();
              //this.contentInsIdFromURI.controlDeficiency.appDefId
              const updatedResponse=await updateContenntItem(this.props.appDefId, this.contentInsIdFromURI.controlDeficiency.id, payload)
              event.api.hideOverlay();
              if(updatedResponse.status===202){
                this.updateOneRecord(event?.colDef?.cellEditorParams?.multiple?multiSelectValue:singleSelectValue,event.colDef.field,this.detailGridRef.current,event.rowIndex)
              }
              this.setState({payload: this.getDefaultPayloadData()})
            }
          autoSizeAll(this.detailGridRef.current)

        } catch (error) {
          console.log({error})
          event.api.hideOverlay();
      }
          },
          tabToNextCell: tabToNextChildCell
      
        },
        getDetailRowData: (params: any) => {
          //callRecords here is any data u want to render
          console.log('params data=======================>', params.data.children)
            let childrenData=params.data.children
          params.successCallback(params.data.children || [])
        } 
      };
    } else return null
  }
  handleKeyDown=(event: any)=>{
    console.log('on key down===========================================>', event)
    
  }
  onBtStartEditing(params: any,colKey: string,rowIndex: number,key?: string, char?: string, pinned?: RowPinnedType) {

   
      console.log('current api in cell editing==============>',params.api);
      console.log('row index==============>',rowIndex);
     params.api!.startEditingCell({
        rowIndex: +rowIndex,
        colKey: colKey,
      });
  }
  tabToNextCell = (params: TabToNextCellParams): any => {
    console.log('tab next cell params==============>',params)  
    console.log('api=====================>',this.gridRef.current)
    let selectedRow: any;
    let rows: any=[];
 
    this.gridRef.current.api.forEachNodeAfterFilter((row: any) =>{
     rows.push(row)
     console.log('rows=========>', row)
     if(row.rowIndex===params.previousCellPosition.rowIndex){
      selectedRow=row
     }
    });
    let childRows: any=[]
    this.gridRef.current.api.forEachDetailGridInfo((childRow: any, index: number)=>{
      // childRow.api.getRenderedNodes().map((row: any)=>{
      //   childRows.push(row)

      // })
      childRows.push(childRow.api.getRenderedNodes()[0])
      console.log('child details row===========================================================>', childRow, index)
    
    })
    childRows.sort(function(a: any, b: any) { 
      return b.data.id - a.data.id;
    });
    console.log('child rows==================>',childRows)
    console.log('row count====================>',rows)
    
    console.log('current row data=========================------>',selectedRow)

    console.log('grid api==================>', this.gridRef.current)
   
      if(params.nextCellPosition?.rowIndex!==params.previousCellPosition.rowIndex && selectedRow?.expanded && !params.backwards){
        var firstEditCol = params.columnApi.getAllDisplayedColumns();
        console.log('edit col=================>',firstEditCol)
      
        // this.state.gridApi?.api.getDisplayedRowAtIndex(params.previousCellPosition.rowIndex).setExpanded(true);
     
          setTimeout(()=>{
            let detailRow: any;
            console.log('detail ref============================>',this.detailGridRef.current)
            this.gridRef.current.api.forEachDetailGridInfo((childRow: any, index: number)=>{
            console.log('child index=======================>', index,childRow)
            detailRow=childRow.api.getRenderedNodes()[0]
            if(detailRow?.data?.id===selectedRow.data.children[0]['id']){
              childRow.api.stopEditing();
              childRow.api.clearFocusedCell();
              childRow.api.startEditingCell({
                rowIndex: 0,
                colKey: 'Description'
              })

              console.log('child details row===========================================================>', detailRow, index)
            }
          })

        },2000)
        return null
  
      }else if(params.backwards &&  params.previousCellPosition.column.getColId()==="Maturity Score" && childRows.length){
        
        setTimeout(()=>{
          let previouseIndex: any;
          let rowPreviouseIndex: any;

          rows.forEach((row: any,index: number)=>{
            console.log('calulate select row', row)
            if(row.data.id===selectedRow.data.id){
            // if(!row.expanded && params.backwards){
              console.log('inside condition ====--->', row,index)
               selectedRow=index>0?rows[index-1]:rows[index]
               rowPreviouseIndex=index>0?index-1:index
            // }
            }
          })
          console.log({selectedRow})
          childRows.forEach((row: any, index: number) => {
            console.log('child row insidw==============>', row)
              if(row.data.id===selectedRow.data.children[0].id){
                
                console.log('inside condition====================>',row, index)
                previouseIndex=index
              }
          });
          console.log({rowPreviouseIndex})
          if(rows[rowPreviouseIndex]?.expanded){
          // this.gridRef.current.api.forEachDetailGridInfo((childRow: any, index: number)=>{
          //   console.log('child index=======================>', index,previouseIndex,rowPreviouseIndex)
          //   console.log('child rows children-------------------->',rows[rowPreviouseIndex])
          //   console.log({childRow})
          //   if(index===previouseIndex){

          //     childRow.api.stopEditing();
          //     childRow.api.clearFocusedCell();
          
          //     childRow.api.startEditingCell({
          //       rowIndex:  (rows[rowPreviouseIndex]?.data?.children?.length-1) || 0,
          //       colKey: 'Status'
          //     })
          //     console.log('child details row===========================================================>', childRow, index)
          //   }
          // })
          let detailRows;
          this.gridRef.current.api.forEachDetailGridInfo((childRow: any, index: number)=>{
            console.log('child index=======================>', index,previouseIndex,rowPreviouseIndex)
            console.log({childRow})
            detailRows=childRow.api.getRenderedNodes()
            console.log('child rows children-------------------->',detailRows[0])
            console.log('parent rows children-------------------->',childRows[previouseIndex].data)
            if(detailRows[0].data.id===childRows[previouseIndex].data.id){

              childRow.api.stopEditing();
              childRow.api.clearFocusedCell();
              console.log('rowindex--->',rows[rowPreviouseIndex]?.data?.children?.length)
              childRow.api.startEditingCell({
                rowIndex:  (rows[rowPreviouseIndex]?.data?.children?.length-1) || 0,
                
                colKey: 'Status'
              })
              console.log('child details row===========================================================>', childRow, index)
            }
          })
          return null
        }else{
          console.log('else is call of no childer----------------')
          if (!params.nextCellPosition) {
            return params.previousCellPosition;
          }
          return params.nextCellPosition;
        }
        },2000)
       
 

      }else{
      if (!params.nextCellPosition) {
        return params.previousCellPosition;
      }
      return params.nextCellPosition;

    };
  }

  getRiskScoreAndRank=(likelihood: any,impact: any)=>{
    let riskScore = (+likelihood?.label?.trim()?.match(/\d/g)?.[0].trim() || 0) * (+impact?.label?.trim()?.match(/\d/g)?.[0].trim() || 0)
    console.log({ riskScore })
    let calculatedRank: any = {}
    this.state.riskRankCriteriaObj.riskRankData?.forEach((riskRank: any) => {
      if (riskScore >= Number.parseInt(riskRank['Min Value']) && riskScore < Number.parseInt(riskRank['Max Value'])) {
        console.log({ riskRank })
        calculatedRank = riskRank;
      }

    })
    return{
      riskScore,
      calculatedRank
    }
  }

  handleSearchTerm = (value: string, resetSearch = false) => {
    // const searchableFields = this.getSearchFields();
    
   this.setState({searchText: value})
  };
  handleSearchKeyDown= (event: React.KeyboardEvent<HTMLInputElement>)=>{
    if(event.keyCode===13){
      this.setState({
        paginationConfig:{
          ...this.state.paginationConfig,
          currentPage: 0,

        }
      })
      this.setColumnAndRows(0,this.state.paginationConfig.pageSize, this.state.assessmentId, this.state.searchText)
    }
  }
  render() {
  console.log('state data===-->',this.state)
   
    return (
      <div className="grid-wrapper">
          <input type='text' id="hiddenEle"  style={{opacity: 0 , width:'0px',height:'0px'}}  />
        <div style={{ flex: 1, padding: '15px' }}>
          <div style={{ flex: 1 }}>
            <TextField
              type="text"
              placeholder='Search Control Assessments...'
              onKeyDown={this.handleSearchKeyDown}
              value={this.state.searchText}
              onChange={(val) => { this.handleSearchTerm(val) }}
              // prefix={<div style={{display: 'flex'}}><Icon source="search" componentColor="inkLighter" /><p>Search Control Assessments...</p></div>}
              prefix={<Icon source="search" componentColor="inkLighter" />}

              suffix={this.state.searchText && <Icon source="cancelSmall" onClick={() => this.handleSearchTerm('')} componentColor="inkLighter" />}
            />
          </div>
        </div>
          <div className={`agGridRootWrapper ag-theme-alpine`}>
            <AgGridReact
              ref={this.gridRef}
              rowData={this.state.rows}
              sortingOrder={["desc", "asc", null]}
              onGridReady={this.onGridReady}
              onFirstDataRendered={this.onFirstDataRendered}
              defaultColDef={{
                flex: 1,
                sortable: true,
                cellClass: 'cell-wrap-text',
                autoHeight: true,
              }}
              domLayout="autoHeight"
              columnDefs={this.state.controlAssessmentColumns}
              masterDetail={true}
              // detailRowHeight={195}
              onCellEditingStarted={(params: any)=>{
                count=0
                autoSizeAll(params)
                // this.setState({payload: this.getDefaultPayloadData()})

              }}
              onCellEditingStopped={async (event: any) => {
                try {

                const {payload,multiSelectValue,singleSelectValue,riskRankCriteriaObj} =this.state
                console.log({singleSelectValue})
                console.log('cell editing stopper:::::::::::::::::>',event, payload)

                if (payload.AddRelationships.length || payload.RemoveRelationships.length || payload.ReplaceRelationships.length) {
                  payload.ItemIDs = [event?.data?.id]
                  console.log('column:>',event?.columnApi?.columnModel?.columnDefs)
                  if((event.column.colId==='Likelihood' || event.column.colId==='Impact') && (event.data.Likelihood?.label && event.data.Impact?.label)){
                  let riskRankObj=this.getRiskScoreAndRank(singleSelectValue,event.column.colId==='Likelihood' ?event.data.Impact: event.data.Likelihood)
                    console.log({riskRankObj})
                    payload.AddRelationships.push({LeftContentItemID:event.data.id,RightContentItemID:riskRankObj.calculatedRank.id,ContentInsRelationshipInsID: +this.state.assessmentRiskRankAndScoreId['Risk Rank']})
                    riskRankCriteriaObj.riskRankData.forEach((riskRank: RiskRankType)=>{
                      console.log('risk rank--------------==>', riskRank)
                      if(riskRank.Name===event.data.Risk){
                        console.log('inside the condition')
                      
                        if(riskRankObj.calculatedRank.id===riskRank.id){
                        payload.AddRelationships= payload.AddRelationships.filter((item)=> item.RightContentItemID!==riskRank.id)
                        }else payload.RemoveRelationships.push({LeftContentItemID:event.data.id,RightContentItemID:riskRank.id,ContentInsRelationshipInsID: +this.state.assessmentRiskRankAndScoreId['Risk Rank']})
                      }
                    })
                    this.updateOneRecord(riskRankObj?.calculatedRank?.Name,'Risk',this.gridRef.current,event.rowIndex)

                    payload.Fields = [{ ID: +this.state.assessmentRiskRankAndScoreId['Risk Score'], Value: riskRankObj.riskScore}]
                  }else{
                  payload.Fields = []
                  }
                  console.log("inside cell editor :>",payload)
                  event.api.showLoadingOverlay();

                  const updatedResponse=await updateContenntItem(this.contentInsIdFromURI.controlAssessment.appDefId, this.contentInsIdFromURI.controlAssessment.id, payload)
                  event.api.hideOverlay();
                  console.log({updatedResponse})
                  if(updatedResponse.status===202){
                    this.updateOneRecord(event?.colDef?.cellEditorParams?.multiple?multiSelectValue:singleSelectValue,event.colDef.field,this.gridRef.current,event.rowIndex)
                 
                  }
                 this.setState({payload: this.getDefaultPayloadData()})

                }
                autoSizeAll(event)
              } catch (error) {
                  console.log({error})
                  event.api.hideOverlay();
                  this.setState({payload: this.getDefaultPayloadData()})

              }
              }}
              onRowDataUpdated={(params)=>{
                autoSizeAll(params)
              }}
              tabToNextCell={this.tabToNextCell}
               detailRowAutoHeight={true}
              detailCellRendererParams={this.detailCellRendererParams()}
              singleClickEdit
            alwaysShowHorizontalScroll
            getRowNodeId= {function(data) {
              return data.id;
          }}
            alwaysShowVerticalScroll  
            stopEditingWhenCellsLoseFocus={true}
            />
          </div>
          <div style={{ marginTop: 16 }}>
                  <Pagination
                      current={+this.state.paginationConfig.currentPage}
                      defaultCurrent={1}
                      onChange={(current, pageSize) => {
                        this.setState({
                          ...this.state,
                          paginationConfig: {
                            ...this.state.paginationConfig,
                            currentPage: current,
                            pageSize: pageSize
                          }
                        }, () =>{
                          this.setColumnAndRows(current,pageSize,this.state.assessmentId,this.state.searchText || '')
                        }
                         )
                      }}
                      
                      pageSize={this.state.paginationConfig.pageSize}
                      total={this.state.paginationConfig.total}
                      hideOnSinglePage={true}
                />
          </div>
          <input type='text' id="hiddenEle"  style={{opacity: 0 , width:'0px',height:'0px'}} />
         </div>
      );
  }
}
