import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import './CustomCellComponet.css'
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
    console.log({params})

    if(params.isMultipleRelation){
    this.eGui.classList.add('read-chip-wrapper')
    params?.['value']?.map((val: any) => {
        this.eGui.innerHTML +=`<div class="read-chip" id="read_${val.id}" onClick="handleClick">

        ${val.label}
      </div>`
      document.getElementById(`read_${val.id}`)?.addEventListener('click',()=>{
       const {appDefId,relationContentInsId}= params?.colDef?.cellEditorParams
        redirectToPage(appDefId,relationContentInsId,val.id, true)
      })
  });
}else{
  this.eGui.innerHTML=`<p class="center-text">Completed</p>`;
}
  }

  getGui() {
    return this.eGui;
  }
  afterGuiAttached() {
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
    let key = event.which || event.keyCode;
    console.log('key=========>',key)
    if (key === 13 ) {  // right
        event.stopPropagation();
    }
}
  refresh(params: ICellRendererParams): boolean {
    return false;
  }

}