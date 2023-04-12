import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import './RiskCellRenderer.scss'

interface OptionType {
  id: number,
  key: string
  label: string,
  email?: string,
}
interface CustomCellComponetProps {
  options: OptionType
}

const HSLToRGB = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};
function pickTextColorBasedOnBgColorSimple(color: number[]) {
  console.log({color})
  const brightness = color?.[0] * 0.299 + color?.[1] * 0.587 + color?.[2] * 0.114;
  console.log({brightness})
  return brightness > 186 ? "#000000" : "#FFFFFF";
}
const getValueFromArray=(val: any)=>{
  console.log('val===========->',val)
  if(Array.isArray(val)){
      return val[0]
  }else{
    return val
  }
}
const isIncludeDash=(val: any)=>{
  return val.includes('-')
}
export class RiskCellRenderer extends React.Component<ICellRendererParams, {}> {
  eGui!: HTMLSpanElement;

  init(params: any) {
    let rankName=getValueFromArray(params?.value?.rankName?.label)
    let rankScore=getValueFromArray(params?.value?.rankScore?.label)
    console.log({rankName})
    console.log({rankScore})
    
    console.log('risk cell renderer params===============================>',params)

    if (rankName && rankScore) {
      this.eGui = document.createElement('span');
      console.log('score================>',rankScore?.trim()?.split(isIncludeDash(rankScore)?'-':' '))
      let riskScore = (+rankScore?.trim()?.match(/\d/g)?.[0].trim() || 0) * (+rankName?.trim()?.match(/\d/g)?.[0].trim() || 0)
      console.log({ riskScore })
      let calculatedRank: any = {}
      let riskRankData: any = params?.riskRankData
      console.log({ riskRankData })
      riskRankData?.forEach((riskRank: any) => {
        if (riskScore >= Number.parseInt(riskRank['Min Value']) && riskScore < Number.parseInt(riskRank['Max Value'])) {
          console.log({ riskRank })
          calculatedRank = riskRank;
        }

      })
      console.log({ riskScore })
      console.log({ calculatedRank })
      if (riskScore > 0 && calculatedRank.Name) {
      const RGBColor=HSLToRGB(calculatedRank.Color.h,calculatedRank.Color.s,calculatedRank.Color.l)
        this.eGui.classList.add('riskWrapper')
        this.eGui.innerHTML = `
        <span>${riskScore}</span>
        <div class='riskChip' style="background-color: hsla(${calculatedRank.Color.h}, ${calculatedRank.Color.s}%, ${calculatedRank.Color.l}%,${calculatedRank.Color.a}); color: ${pickTextColorBasedOnBgColorSimple(RGBColor)};" >
        <p class='riskchipContent'>${calculatedRank?.Name || ''}</p>
        </div>
     `
      }
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
    console.log('key=========>', key)
    if (key === 13) {  // right
      event.stopPropagation();
    }
  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }

}   