
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import {Loading,Icon} from 'engage-ui'
import './BasicCellEditor.scss'
import axios from '../axiosConfig'
import { redirectToPage } from '../utils'
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import { serialize } from "v8";
import { fileColumn } from "@emgage/app_support_lib";
import { Color } from "@ag-grid-community/core";

const KeyCodes = {
  KEY_TAB: 9,
  KEY_UP_ARROW: 38,
  KEY_ENTER: 13,
  KEY_DOWN_ARROW: 40,
  KEY_SHIFT: 16,
  KEY_F2: 113,
  KEY_DELETE: 46,
  KEY_ESC: 27,

}
interface ValueType {
  id?: number
  label?: string
  email?: string
}

interface CounterType {
  forward: number
  backward: number
  value?: OptionType;
}
interface OptionType {
  id?: number,
  key?: string
  label: string,
  email?: string,
  changeTimestamp?: string
}


const getPrimitiveLabel=(item: any, primitiveId: any)=>{
  if(Array.isArray(primitiveId)){
    let label=''
    primitiveId.forEach((id)=>{
      label=item[id]+" "
    })
    return label.trim()
  }else{
   return item[primitiveId]
  }
}

function useDebounce(value: string | undefined, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
export const ClinCellEditor = forwardRef<any, any>(
  (props, ref) => {
    console.log('props==================================>',props)
    const pageSize=10;
    const itemPluralLable = props.colDef.field

    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const [filterOptions, setFilterOptions] = useState<OptionType[]>([]);
    const [optionValues, setOptionValues] = useState<ValueType[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [total, setTotal] = useState<number>(0);
    const [pageFrom, setPageFrom] = useState<number | undefined>(undefined)
    const [counters, setCounters] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
    const [currentKey, setCurrentKey] = useState<number>()
    const [searchVal, setSearchVal] = useState<string | undefined>(undefined)
    const [arrowCounter, setArrowCounter] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
    const [isOpen, setIsOpen] = useState(false)
    const [isShiftTab, setIsShiftTab] = useState({
      tab: false,
      shiftTab: false
    })
    const [isDisplayInput, setIsDisplayInput] = useState(true)
    const [isFocusInput, setIsFocusInput] = useState(false)

    const refInput = useRef<HTMLInputElement>(null);
    const refOption = useRef<HTMLInputElement[]>([]);
    console.log({optionValues})
    useEffect(() => {
      setTimeout(() => {
        if (refInput && refInput.current) {
          refInput.current.focus();
        }
      });
    }, [optionValues, filterOptions, isOpen])

    const getData = async (search?: string) => {
      //{ "terms": { "id": props.data[`${props.colDef.field}RelationIds`] } }
      try{
      setIsLoading(true)
        console.log('call---------------------------------',search,optionValues)
        
      const relationIds=Array.isArray(optionValues)? optionValues?.map((data: any)=> data.id) : []
      const query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": pageSize, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": [{ "exists": { "field": "ownerContentDef" } },{ "terms": { "id": relationIds } }] } }, "from": pageFrom }
      const response = await axios.get(`/${props?.appDefId}/contentinses/${props?.relationContentInsId}/items?query=${JSON.stringify(query)}`)
      console.log({relationOptions})
      console.log({response})
      console.log({filterOptions})
      let options: OptionType[] = search ? [] : [...filterOptions]
      response.data.results.forEach((item: any,index: number) => {
        options.push({
          id: item['contentItemID'],
          label: getPrimitiveLabel(item,props?.colDef?.cellEditorParams?.primitiveId),
          changeTimestamp: item['changeTimestamp']
        })
      })
      console.log('data optionValues===>',optionValues)
      
      let alreadyCreatedRecord=[...optionValues]
      console.log({alreadyCreatedRecord})
      let existingSelectedOption=alreadyCreatedRecord.map((optionVal)=> optionVal.id)
       if(existingSelectedOption.length && options.length){
        options=options.filter((option)=> !existingSelectedOption.includes(option.id))
      }
      console.log('seting options======================>', options)
      setTotal(search?response?.data?.total:response?.data?.total+(props.data[props.colDef.field].length||0))
      
      setRelationOptions(options)
      setFilterOptions(options)
      setIsLoading(false)
    } catch (error) {
      console.log({error})
      setIsLoading(false)
        
    }

    }
    useEffect(()=>{
        setPageFrom(0)
        setOptionValues(Array.isArray(props?.data?.[props?.colDef?.field]) ? props?.data?.[props?.colDef?.field]  : [])     
    },[])
    useEffect(() => {
      
      setCounters((prevCounter) => {
        return {
          ...prevCounter,
          backward: props?.data?.[props?.colDef?.field].length - 1
        }
      })
console.log('page from is call-------------------------------------------->',pageFrom)
    if(typeof pageFrom === 'number' && pageFrom>=0){
        getData()
    }
    }, [pageFrom])
    useEffect(() => {
      if (optionValues.length === props?.maxCardinality) {
        console.log('inside the max ')
        setIsOpen(false)
        setIsDisplayInput(false)
        let options = optionValues[optionValues.length - 1]
        optionValues.forEach((option) => {
          document.getElementById(`chip_${option.id}`)?.classList.remove('ativeChip')
          document.getElementById(`btn_${option.id}`)?.classList.remove('ativeChipButton')
        })
        const element = document.getElementById(`chip_${options.id}`)
        const btnElement = document.getElementById(`btn_${options.id}`)
        if (element) {
          element.classList.add('ativeChip')
          btnElement?.classList?.add('ativeChipButton')
        }
      } else {
        setIsDisplayInput(true)

      }
      setCounters((prevCounter) => {
        return {
          ...prevCounter,
          backward: optionValues.length-1
        }
      })
    }, [optionValues])

    // useEffect(()=>{
    //   setTimeout(() => {
    //     console.log('useEffect search=================>',searchVal)
    //   
    //   }, 3000);
      
    // },[searchVal])
    useEffect(() => {
      if (filterOptions.length > 0)
        setArrowCounter((prevCounter) => {
          return {
            ...prevCounter,
            backward: filterOptions.length - 1
          }
        })
    }, [filterOptions])
   
    const curentVal=useDebounce(searchVal,1000)
    useEffect(()=>{
      if(curentVal!== undefined && isOpen){
      console.log('curentVal====================>',curentVal)

        getData(curentVal)
      }
    },[curentVal])
    const handleClick = (option: OptionType | undefined) => {
      let optionValue = [...optionValues]
      optionValue.push({
        id: option?.id,
        label: option?.label || '',
        email: option?.email || '',
      })
      let relationValues = [...filterOptions]
      console.log('click option=================>',option)
      console.log({ relationValues })
      let filterValues = relationValues.filter((item) => item.id !== option?.id)
      console.log({filterValues})
      
      setOptionValues(optionValue)
      setFilterOptions(filterValues)
      props?.handleChangeEvent(optionValue,props?.colDef?.id,props.colDef.field,props?.data,props?.rowIndex,props.isParent)
      if(searchVal && filterValues.length===0){
        console.log('inside search')
       setSearchVal(undefined) 
     
      }
    }
    const onCrossClick = (id: number | undefined) => {
      let options = [...optionValues]
      options = options.filter((option) => option.id !== id);
      setOptionValues(options)
      let relationValues = [...relationOptions]
      let filterRelationValues = [...filterOptions]
      let filterItem = relationValues.filter((item) => item.id === id)
      if (filterItem.length===0){
        let filterOption: any=optionValues.filter((option)=> option.id===id)
        if(filterOption.length)
          filterRelationValues.push(filterOption[0])
      }else{
        filterRelationValues.push(filterItem[0])
      }
      props?.handleChangeEvent(options,props?.colDef?.id, props.colDef.field, props?.data,props?.rowIndex,props.isParent)

      setFilterOptions(filterRelationValues)
    }

    const setOptionsOnArrowKey = (arrowCounters: any, key: string, defaultValue: number) => {
      if (key === 'forward' && arrowCounters[key] === filterOptions.length) {
        arrowCounters[key] = defaultValue

      } 
      else if (arrowCounters[key] < 0) {
        arrowCounters[key] = defaultValue
      }
      let option = filterOptions[arrowCounters[key]]
      filterOptions.forEach((option) => {
        document.getElementById(`option_${option.id}`)?.classList.remove('activeOption')
      })
      const element = document.getElementById(`option_${option.id}`)
      if (element) {
        element.classList.add('activeOption')
        refOption.current[arrowCounters[key]]?.focus()
        arrowCounters.value = option
        arrowCounters[key] = key === 'forward' ? arrowCounters[key] + 1 : arrowCounters[key] - 1
        setArrowCounter(arrowCounters)
      }
    }
    const setChipFocus = (counterObj: any, key: string, defaultValue: number) => {
      // if (key === 'forward' && optionValues.length === counterObj[key]) {
      //   console.log('input focus=======================')
      //   counterObj[key] = defaultValue

      // }
        if (key === 'forward' && (optionValues.length - 1 === counterObj[key] || optionValues.length === counterObj[key])) {
        setIsFocusInput(true)
        setIsOpen(true)
     
      } else if (counterObj[key] < 0) {
        counterObj[key] = defaultValue
      }



      const options = optionValues.length === counterObj[key] ? optionValues[defaultValue] : optionValues[counterObj[key]]
      optionValues.forEach((option) => {
        document.getElementById(`chip_${option.id}`)?.classList.remove('ativeChip')
        document.getElementById(`btn_${option.id}`)?.classList.remove('ativeChipButton')
      })
      const element = document.getElementById(`chip_${options.id}`)
      const btnElement = document.getElementById(`btn_${options.id}`)
      if (element) {
        element.classList.add('ativeChip')
        btnElement?.classList?.add('ativeChipButton')
        counterObj.value = options
        counterObj[key] = key === 'forward' ? counterObj[key] + 1 : counterObj[key] - 1;

        setCounters(counterObj)
      }

    }
    const getActiveChip=()=>{
      let activeChipOption
      for (let index = 0; index < optionValues.length; index++) {
        if(document.getElementById(`chip_${optionValues[index].id}`)?.className?.includes('ativeChip')){
          activeChipOption=optionValues[index]
          break
        } 
        
      }
      return activeChipOption
    }
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if(Object.values(KeyCodes).includes(e.keyCode)){
        e.preventDefault()
      }
      let KeyID = e.keyCode;
      let isShift;
      let windowEvent: any = window.event
      setCurrentKey(KeyID)

      if (windowEvent) {
        KeyID = windowEvent?.keyCode;
        isShift = !!windowEvent?.shiftKey; // typecast to boolean
      } else {
        KeyID = e.which;
        isShift = !!e.shiftKey;
      }
      if(KeyID===KeyCodes.KEY_TAB && !isShift && !isFocusInput){
        let counterObj=JSON.parse(JSON.stringify(counters))
        counterObj.forward = KeyCodes.KEY_TAB === currentKey && isShiftTab.shiftTab? counterObj.backward + 2 : counterObj.forward
        setChipFocus(counterObj,'forward',0)
        setIsShiftTab({
            shiftTab: false,
            tab: true
        })
        setIsOpen(false)
      }
      else if(KeyID===KeyCodes.KEY_TAB && !isShift && isFocusInput){
        optionValues.forEach((option) => {
          document.getElementById(`chip_${option.id}`)?.classList.remove('ativeChip')
          document.getElementById(`btn_${option.id}`)?.classList.remove('ativeChipButton')
        })
        setIsOpen(true)
        setCounters({
          forward: 0,
          backward: optionValues.length-1
        })
        setIsShiftTab({
          shiftTab: false,
          tab: false
      })
        setIsFocusInput(false)

      }
      else if(KeyID===KeyCodes.KEY_TAB && isShift){
        let counterObj=JSON.parse(JSON.stringify(counters))
        console.log({counterObj})
          console.log('inside backword=============================================>',optionValues)
        if(counterObj.backward>=0){
        counterObj.backward = isShiftTab.tab ? counterObj.forward - 2 : counterObj.backward
        setChipFocus(counterObj,'backward',optionValues.length)
        setIsOpen(false)
        setIsFocusInput(false)
        setIsShiftTab({
          shiftTab: true,
          tab: false
      })
    }else {
    
      optionValues.forEach((option) => {
        document.getElementById(`chip_${option.id}`)?.classList.remove('ativeChip')
        document.getElementById(`btn_${option.id}`)?.classList.remove('ativeChipButton')
      })
    }
    
      }
      else if (KeyID === 38) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.backward = KeyCodes.KEY_DOWN_ARROW === currentKey ? arrowCounters.forward - 2 : arrowCounters.backward
        setOptionsOnArrowKey(arrowCounters, 'backward', filterOptions.length - 1)
      }
      else if (KeyID === 40) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.forward = KeyCodes.KEY_UP_ARROW === currentKey ? arrowCounters.backward + 2 : arrowCounters.forward
        setOptionsOnArrowKey(arrowCounters, 'forward', 0)
      }
      else if (KeyID === KeyCodes.KEY_ENTER) {
        if (currentKey === KeyCodes.KEY_UP_ARROW || currentKey === KeyCodes.KEY_DOWN_ARROW) {
          handleClick(arrowCounter?.value)
          clear(false)
          setArrowCounter({
            forward: 0,
            backward: 0,
          })
        }
        else if (currentKey === KeyCodes.KEY_TAB || isShift){
          let activeChipOption=getActiveChip()
          if(activeChipOption)
            onCrossClick(activeChipOption?.id)
        }
      } else if (KeyID === KeyCodes.KEY_DELETE) {
        let activeChipOption=getActiveChip()
        console.log({activeChipOption})
        if (activeChipOption)
          onCrossClick(activeChipOption?.id)
      }
      else if (KeyID === KeyCodes.KEY_ESC) {
        setIsOpen(false)
      }
    }
    const handleFocus = (e: any) => {
      e.preventDefault()
      console.log('focus================')
      setIsOpen(true)
    }
    const clear = (isFromArrow: boolean) => {
      if (isFromArrow) {
        document.getElementById(`chip_${counters?.value?.id}`)?.classList.remove('ativeChip')
        document.getElementById(`btn_${counters?.value?.id}`)?.classList.remove('ativeChipButton')
        setCounters({
          forward: 0,
          backward: 0,
        })
      } else {
        setArrowCounter({
          forward: 0,
          backward: 0,
        })
      }
    }
    console.log('total==========================================>', total)
    console.log('options==========================================>', optionValues)
    console.log('isopen--------------------->',isOpen)
    console.log('isLoading--------------------->',isLoading)

    console.log('filterOptions--------------------->',filterOptions)

    return (
      <div className={'customSelect'} >

        <div className={'chipWrapper'}
          onKeyDown={onKeyDown}
        >
            {isLoading && <Loading iconStyle={{fill:'#808080'}} componentStyle={{width: "100%",height: '100%',display:'flex',alignItems:"center",justifyContent:'center',background: 'rgba(239, 239, 240, 0.4)',zIndex:201,position: "absolute"}} />}
          <div id="chipWrapperDiv">
          {optionValues?.map((val, index) => (
            <button className={'chip'} id={`chip_${val.id}`} key={ `option_chip_${val.id}_${index}`} tabIndex={index + 1} onClick={(event)=>{
              redirectToPage(props?.appDefId, props?.relationContentInsId, counters?.value?.id || 0, false,props?.contentInsAppDefId)

            }} >

              {val.label}
              <span className={'closebtn'} id={`btn_${val.id}`} 
              onClick={(event) => {
                event.stopPropagation()
                onCrossClick(val?.id)
              }}>
                    <Icon componentClass={'chipIcon'} source={'cancelSmall'} />
              </span>
            </button>
          ))}

        </div>
          <div className="combobox">
            {isDisplayInput  && <input id={'customInput'} value={searchVal || ''}  autoComplete="off" ref={refInput}  readOnly={!isOpen || isLoading} onFocus={handleFocus}  type="text" name="clinCellEditor" placeholder={isOpen?`Add ${itemPluralLable}`:''} onChange={(event) => {
              console.log('search============>',event.target.value)
              setSearchVal(event.target.value);
            }}

            />
            }
            {isOpen && <div className={'dropdownContent'} style={{height: filterOptions.length===10?'440px': 'auto'}} >
              {filterOptions?.map((option: any, index: any) => (
                <>
                  <input type="text" className={'option'} key={option?.id}
                    id={`option_${option?.id}`}
                    readOnly
                    ref={(el: any) => refOption.current[index] = el} onClick={() => handleClick(option)} value={option?.label || ''} />
                
                </>

              ))}
                {total > 0 && total > (filterOptions.length + optionValues.length) && total !== filterOptions.length  &&
                    <div className={'option loadBtn'} onClick={() => {
                      let page = pageFrom || 0 + 10;
                      setPageFrom(page)
                    }}> Load more...</div>  
                  }
              {searchVal && filterOptions.length===0 && <div className={'option'} >No matches found</div>}
              {!(total > 0 && total > (filterOptions.length + optionValues.length) && total !== filterOptions.length)  && filterOptions.length === 0 &&  optionValues.length!==props?.data?.[props?.colDef?.field]?.length && searchVal===undefined && !isLoading && <div className={'option'} >No more {itemPluralLable}s availabe</div>}
              {total > 0  && filterOptions.length === 0 && ( optionValues.length===props?.data?.[props?.colDef?.field]?.length) && !searchVal && !isLoading && <div className={'option'} >No {itemPluralLable}s availabe</div>}
            </div>}
          </div>
        </div>

      </div>
    );
  }
);

