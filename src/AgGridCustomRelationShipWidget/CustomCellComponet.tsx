import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import './CustomCellComponet.scss'
import {redirectToPage} from '../utils'
interface OptionType {
    id: number,
    key: string
    label: string,
    email?: string,
  }
interface CustomCellComponetProps{
    options: OptionType
}
export class CustomCellComponet extends React.Component<ICellRendererParams,{}> {
  eGui!: HTMLSpanElement;
  init(params: any) {
   
    
    this.eGui = document.createElement('span');
    console.log('custom paramsrelation===========================================>',params)
    this.eGui.classList.add('read-chip-wrapper')

    if(Array.isArray(params?.['value'])){
      params?.['value']?.map((val: any,index: number) => {
        this.eGui.innerHTML += `<div class="read-chip" id="read_${index}_${val.id}">

        ${val.label}
      </div>`
        // document.getElementById(`read_${index}_${val.id}`)?.addEventListener('click', () => {
        //   const { appDefId, relationContentInsId } = params?.colDef?.cellEditorParams
        //   redirectToPage(appDefId, relationContentInsId, val.id, true)
        // })
      });
}else if(params?.['value'] && params?.['value']?.label){

  this.eGui.innerHTML +=`<div class="read-chip" id="single-chip" >

  ${typeof params?.['value'] ==="object"? params?.['value']?.label : params?.['value']}
</div>`;
let element=document.getElementById(`single-chip`);
console.log('element---------------->',element)
element?.addEventListener?.('click',()=>{
  debugger
  const {appDefId,relationContentInsId,contentInsAppDefId}= params?.colDef?.cellEditorParams
   redirectToPage(appDefId,relationContentInsId,params?.['value'] .id, true,contentInsAppDefId)
 })
}
  }
  getGui(params: any) {
    return this.eGui;
  }
  afterGuiAttached(params: any) {
    debugger
    console.log('after params-=-=-=>',params)
    // get ref from React component
    let eInput = this.eGui;
    // Add a listener to 'keydown'
    let self = this;
    eInput.addEventListener('keydown', function (event) {
      self.myOnKeyDown(event)
    });

  }
  // Stop propagating 'left'/'right' keys
  myOnKeyDown(event: any) {
    debugger
    let key = event.which || event.keyCode;
    if (key === 13) {  // right
      event.stopPropagation();
    }
  }
  refresh(params: ICellRendererParams): boolean {
    console.log('refersh params==>',params)
    return false;
  }

}