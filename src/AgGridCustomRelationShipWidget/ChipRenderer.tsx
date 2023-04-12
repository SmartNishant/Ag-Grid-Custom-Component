import React from 'react';
import './CustomCellComponet.scss'
import {redirectToPage} from '../utils'
import { getInfo} from '../api/api'

const ChipRenderer=(props: any) => {
    console.log('chip wraper props:>',props)
  const buttonClicked = async(data: any) => {
    // alert(`${cellValue} medals won!`);
    console.log({data})
    console.log('chip clicked ------------------------>',props?.colDef)
  const {appDefId,relationContentInsId}= props?.colDef?.cellEditorParams
  let controlAppDefId;
  if(appDefId && relationContentInsId){
    const conentInfo = await getInfo(appDefId, relationContentInsId);
    controlAppDefId=conentInfo?.data?.appDef?.id
    console.log({controlAppDefId})
    
    redirectToPage(appDefId,relationContentInsId,data.id, true,controlAppDefId)
  }
  };
  const getChip=()=>{
    if(Array.isArray(props.data?.[props?.colDef?.field])){
        return props.data?.[props?.colDef?.field].map(((data: any)=>(
                <div key={data.id} className="read-chip" onClick={()=>buttonClicked(data)}> 
                 {data.label}
            </div>
            )))

    }else if(typeof props.data?.[props?.colDef?.field] ==="object" && props.data?.[props?.colDef?.field]?.label){
        return(
            <div className="read-chip" onClick={()=>buttonClicked(props.data?.[props?.colDef?.field])}> 
                 {props.data?.[props?.colDef?.field]?.label}
            </div>
        )
    }else if(typeof props.data?.[props?.colDef?.field] ==="string"){
        return(
            <div className="read-chip" onClick={()=>buttonClicked(props.data?.[props?.colDef?.field])}> 
                 {props.data?.[props?.colDef?.field]}
            </div>
        )
    }
  }
  return (
    <div className='read-chip-wrapper'>
    {getChip()}
    </div>
  );
};
export default ChipRenderer