import React, {
  forwardRef,
  Component,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  createRef
} from "react";
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import {ColDef, GridApi,IRowNode} from 'ag-grid-community'
import {RiskCellRenderer} from './RiskCellRenderer'
import {getContentItems, getInfo} from '../api/api'
import {SingleSelectAgGrid} from './SingleSelectAgGrid'
import './AgGridRiskComponent.scss'
interface RiskRankType {
   Satisfactory?: boolean
  'Min Value'?: number
  'Max Value'?: number
  Name?: number
  Color?: string
}
interface IState{
    columns: ColDef[]
    rows: any[]
    riskRankValues: RiskRankType[]
    isLoading:boolean,
    gridApi: any
}
interface AgGridRiskComponentProps{
 appDefId: number
 riskRank: number
 riskScore: number
 contentInsId: number
}

export default class AgGridRiskComponent extends Component<AgGridRiskComponentProps,IState> {
    gridRef=createRef<any>();
    constructor(props: any){
        super(props)
        

        this.state={
            columns: [
                {
                    field: 'control',
                    headerName: 'Control',
                },
                {
                    field: 'likelihood',
                    headerName: 'Likelihood',
                    editable: true,
                    cellEditor: SingleSelectAgGrid,
                    cellEditorPopup: true,
                    cellEditorParams: {
                      onValueChange:(option:any,data: any,field: string)=>{
                        console.log('click option=============================>', option,data,field)
                        this.updateOneRecord(option.label,field)
                      }
                        // options: [{id: 1,label:'1 - Not Foreseeble'}, {id: 2,label:'2 - Foreseeble, not expected'},{id: 3,label:'3 - Foreseeble, expected'}, {id: 4,label:'4 - Common'}],
                      },
                      suppressKeyboardEvent: (e: any) => {
                        if (e.event.keyCode===13) {
                          return true
                        } else {
                          return false
                        }
                      },
                },
                {
                    field: 'impact',
                    headerName: 'Impact',
                    editable: true,
                    cellEditor: SingleSelectAgGrid,
                    cellEditorPopup: true,
                    autoHeaderHeight: true,
                    autoHeight: true,
                    cellEditorParams: {
                        // options: [{id: 1,label:'1 - Negligible'}, {id: 2,label:'2 - Acceptable'},{id: 3,label:'3 - Unacceptable'}, {id: 4,label:'4 - High'}, {id: 5,label:'5 - Catastrophic'}],
                        onValueChange:(option:any,data: any,field: string)=>{
                          console.log('click option=============================>', option,data,field)
                          this.updateOneRecord(option.label,field)
                        }
                      },
                      suppressKeyboardEvent: (e: any) => {
                        if (e.event.keyCode===13) {
                          return true
                        } else {
                          return false
                        }
                      },
                },
                {
                    field: 'risk',
                    headerName: 'Risk',
                    valueGetter: `{rankScore: data.likelihood, rankName: data.impact}`,
                    cellRenderer: RiskCellRenderer,
                    cellRendererParams:{
                      riskRankData: []
                    }
                    
                },
            ],
            rows: [{
                control: 'test control',
                likelihood:'',
                impact: '',
                risk: ''

            }],
            riskRankValues: [],
            isLoading: false,
            gridApi:null
        }
    }
    getRiskRankValuesForProgram=async ()=>{
      this.setState({isLoading: true})
      let query: any={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":0}
      const programInfo=await getInfo(this.props?.appDefId,610320)
      console.log({programInfo})
      let riskCriteriaPrimitiveId: number;
      programInfo.data?.fields?.map((field: any)=>{
        if (field.fieldType.itemName.toLowerCase() === "relationship" && field.name==="Risk Criteria") {
          console.log({field})
          riskCriteriaPrimitiveId=field.id
        }
      })
      console.log({programInfo})
      const programResponse=await getContentItems(this.props.appDefId,610320,JSON.stringify(query))
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
        riskCriteria.id= response[riskCriteriaPrimitiveId][0].rightContentItem.id
        riskCriteria.contentInsId= response[riskCriteriaPrimitiveId][0].rightContentIns.id

      })
      query.query.bool.must.push({"term":{"id": riskCriteria.id}})
      let riskRankId: number;
      let riskRankIds: any={
        impact: 0,
        likelihood: 0,
        rank: 0,

      }
      const riskCriterianfo=await getInfo(this.props?.appDefId,riskCriteria.contentInsId)
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
      
      const riskCriteriaResponse=await getContentItems(this.props.appDefId,riskCriteria.contentInsId,JSON.stringify(query))
      console.log('risk idx=============================================>', riskRankIds)
      riskCriteriaResponse.data.results.map((response: any)=>{
          console.log('risk ranks:>',response[riskRankId])
          Object.keys(riskRankIds).map((riskId: any)=>{
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
      query={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": rankCriteriIdObj.rank.ids}}],"should":[]}},"from":0}
      const riskRankInfo=await getInfo(this.props?.appDefId,rankCriteriIdObj.rank.contentInsId)
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
            [field.key]: response[field.id]
          }
        })
        riskRankData.push(riskRankObj)
        riskRankObj={}
      })
    console.log({riskRankData})
   
   
    let options: any={
      riskImpactOptions: [],
      riskLikelihoodOptions: [],

    }
    query={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": rankCriteriIdObj.likelihood.ids}}],"should":[]}},"from":0}

    const riskLikelyhoodLevels=await getContentItems(this.props.appDefId,rankCriteriIdObj.likelihood.contentInsId, JSON.stringify(query))
    console.log({riskLikelyhoodLevels})
    this.setOptions(riskLikelyhoodLevels.data.results,options.riskLikelihoodOptions,'82963','80915')
    query={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}},{"terms": {"id": rankCriteriIdObj.impact.ids}}],"should":[]}},"from":0}

    const riskImpactLevels=await getContentItems(this.props.appDefId,rankCriteriIdObj.impact.contentInsId, JSON.stringify(query))
    console.log({riskImpactLevels})
    
    this.setOptions(riskImpactLevels.data.results,options.riskImpactOptions,'79891','77843')
    console.log({options})
      let columns=[...this.state.columns]
      columns.forEach((column)=>{
        if(column.field==="likelihood"){
          column.cellEditorParams.options=options.riskLikelihoodOptions
        }else  if(column.field==="impact"){
          column.cellEditorParams.options=options.riskImpactOptions
        }else if(column.field==='risk'){
          column.cellRendererParams.riskRankData=riskRankData

        }
      })
      this.setState({columns})
    }
    setOptions=(responseData: any,options: any, keyId: string,KeyLabel: string)=>{
      responseData.forEach((riskLikelyhood: any)=>{
        options.push({
          id: riskLikelyhood.id,
          label: `${riskLikelyhood[keyId]} - ${riskLikelyhood[KeyLabel]}`
        })
      })
    }
    // getImpactAndLielihood=async()=>{
    //   let query={"sort":[{"id":{"order":"desc"}}],"size":10,"query":{"bool":{"must_not":[{"exists":{"field":"parentNodeID"}}],"must":[{"term":{"isCurrentVersion":true}},{"terms":{"entityState.itemID":[1,2,3,4,5]}}],"should":[]}},"from":0}
    
    //   const controlAssessmentData=await getContentItems(this.props.appDefId,this.props.contentInsId, JSON.stringify(query))
    //   console.log({controlAssessmentData})
    //   let riskRankOptions: any={
    //     impact: [],
    //     likelihood: [],
  
    //   }
  
    //   controlAssessmentData.data.results.forEach((data: any)=>{
    //     console.log('rank data:>',data?.[this.props.riskRank])
    //     data?.[3538962]?.forEach((rank: any)=>{
    //       riskRankOptions.likelihood.push(rank.rightContentItem.label)
  
    //     })
    //     data?.[3539986]?.forEach((rank: any)=>{
    //       riskRankOptions.impact.push(rank.rightContentItem.label)
    //     })    
  
    //   })
    //   console.log({riskRankOptions})
    //   let columns=JSON.parse(JSON.stringify(this.state.columns))
    //   columns.forEach((column: any)=>{
    //     if(column.field==="impact"){
    //       column.cellEditorParams= {
    //         values: riskRankOptions.impact
    //       }
    //     }
    //     if(column.field==="likelihood"){
    //       column.cellEditorParams= {
    //         values: riskRankOptions.likelihood
    //       }
    //     }
    //   })
    //   this.setState({columns: columns})
     
    // }
    componentWillMount(): void {
      window.addEventListener("keydown", function(e) {
        if(["ArrowUp","ArrowDown"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    }
  pickExistingRowNodeAtRandom(gridApi: GridApi) {
    var allItems: IRowNode[] = [];
    gridApi.forEachLeafNode(function (rowNode) {
      allItems.push(rowNode);
    });

    if (allItems.length === 0) {
      return;
    }
    var result = allItems[Math.floor(Math.random() * allItems.length)];

    return result;
  }

  updateOneRecord(value: any, field: string) {
    var rowNodeToUpdate = this.pickExistingRowNodeAtRandom(this.state.gridApi.api!);
    if (!rowNodeToUpdate) return;

    rowNodeToUpdate.setDataValue(field, value);
  }
  onGridReady = async(params: any) => {
   this.setState({gridApi: params})
    console.log('call grid reay================================', params)
    params.api.showLoadingOverlay();
      await this.getRiskRankValuesForProgram()
      params?.api?.hideOverlay?.();
      
  };
  
  render() {
    return (
        <div className="riskGrid">
          <div className="agGridRootWrapper ag-theme-alpine" style={{ height: 1000, width: 'auto'}}>
            <AgGridReact
              ref={this.gridRef}
              // getRowHeight={onGridReady}
              frameworkComponents={
                SingleSelectAgGrid
              }
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
              // suppressRowClickSelection={true}
              rowData={this.state.rows}
              onGridReady={this.onGridReady}
              singleClickEdit
              defaultColDef={{
                flex: 1,
                sortable: true,
                resizable: true,
                cellClass: 'cell-wrap-text',
                autoHeight: true
              }}
              overlayLoadingTemplate={`<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>`}
              domLayout="autoHeight"
              columnDefs={this.state.columns}
           />
          </div>
        </div>
      );
  }
}
