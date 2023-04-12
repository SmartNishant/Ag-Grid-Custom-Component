import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import './AgGridLargeTextRender.scss'
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
export class AgGridLargeTextRender extends React.Component<ICellRendererParams,{}> {
  eGui!: HTMLSpanElement;

  init(params: any) {
    
    
    this.eGui = document.createElement('span');
    this.eGui.classList.add('text')
    console.log({params})
    this.eGui.innerHTML=`
    <p>${params.value}</p>`
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