import React, {
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
import {Loading} from 'engage-ui'
import './SingleRelationSelect.scss'
import axios from '../axiosConfig'
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
interface OptionType {
  id?: number,
  key?: string
  label: string,
  email?: string,
}
interface CounterType {
  forward: number
  backward: number
  value?: OptionType;
}
const getPrimitiveLabel=(item: any, primitiveId: any)=>{
  console.log("select promotove===================================>",primitiveId)
  if(Array.isArray(primitiveId)){
    let label=''
    primitiveId.forEach((id)=>{
      label+=item[id]+" "
    })
    console.log('inside label========================>',label)

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
export const SingleRelationSelect = forwardRef<any, any>(
  (props, ref) => {
console.log('single editor props======================>', props)
    const itemPluralLable = props.colDef.field
    console.log({ props })
    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const refOption = useRef<HTMLInputElement[]>([]);

    const [value, setValue] = useState<ValueType>();
    const [isLoading, setIsLoading] = useState(false)
    const [total, setTotal] = useState<number>(0);
    const [pageFrom, setPageFrom] = useState(0)
    const [searchVal, setSearchVal] = useState<string | undefined>(undefined)
    const [isOpenPopup, setIsOpenPopup] = useState(true)
    const [currentKey, setCurrentKey] = useState<number>()
    const [arrowCounter, setArrowCounter] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
   
    const refInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setTimeout(() => {
        if (refInput && refInput.current) {
          refInput.current.focus();
        }
      });
    }, [relationOptions])

    const getData = async (search?: any) => {
      setIsLoading(true)
      const query: any = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": { "exists": { "field": "ownerContentDef" } } } }, "from": pageFrom }
      if(props?.filterIds?.length){
        query.query.bool.must.push({terms: {id: props.filterIds}})
      }
      const response = await axios.get(`/${props?.appDefId}/contentinses/${props?.relationContentInsId}/items?query=${JSON.stringify(query)}`)
      let options: OptionType[] = search ? [] : [...relationOptions]
      console.log('select response', response)
      setTotal(response?.data?.total)
      response.data.results.forEach((item: any) => {
        options.push({
          id: item['contentItemID'],
          label: getPrimitiveLabel(item,props?.colDef?.cellEditorParams?.primitiveId),
        })
      })
      console.log({ options })
      setRelationOptions(options)
      setIsLoading(false)
      setIsOpenPopup(true)
    }
    useEffect(()=>{
      console.log('call from current component mount----------->')
      getData()
    },[])
    const curentVal=useDebounce(searchVal,1000)
    console.log({curentVal})
    useEffect(()=>{
      if(curentVal!==undefined && isOpenPopup){
        console.log('call from current val=================>')
        getData(curentVal)
      }
    },[curentVal])

 
    useEffect(() => {
      if (props?.data)
      console.log('field------------>', props?.data?.[props?.colDef.field])
        setValue({
          id: props?.data?.[props?.colDef.field].id || '',
          label: props?.data?.[props?.colDef.field].label || ''

        })
    if(pageFrom>0){
      console.log('call from page form----------->')
      getData()
    }
    }, [pageFrom])
    const handleFocus = (e: any) => {
      e.preventDefault()
      setIsOpenPopup(true)
      console.log('focus================')
     }
    console.log({ value })
    const handleClick = (option: OptionType | undefined) => {
      props.colDef.cellEditorParams.handleChangeEvent(props?.data?.id, option?.id, props?.colDef?.id, props?.data, props?.colDef?.field, option, props?.rowIndex,props?.isParent)
      setValue(option)
      setSearchVal('')
      setIsOpenPopup(false)
    }
    const setOptionsOnArrowKey = (arrowCounters: any, key: string, defaultValue: number) => {
      if (key === 'forward' && arrowCounters[key] === relationOptions.length) {
        arrowCounters[key] = defaultValue

      } else if (arrowCounters[key] < 0) {
        arrowCounters[key] = defaultValue
      }
      let option = relationOptions[arrowCounters[key]]
      relationOptions.forEach((option) => {
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
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      let KeyID = e.keyCode;
      let windowEvent: any = window.event
      setCurrentKey(KeyID)
      console.log({ KeyID })

      if (windowEvent) {
        KeyID = windowEvent?.keyCode;
      } else {
        KeyID = e.which;
      }
      if (KeyID === 38) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.backward = KeyCodes.KEY_DOWN_ARROW === currentKey ? arrowCounters.forward - 2 : arrowCounters.backward


        setOptionsOnArrowKey(arrowCounters, 'backward', relationOptions.length - 1)
      }
      else if (KeyID === 40) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.forward = KeyCodes.KEY_UP_ARROW === currentKey ? arrowCounters.backward + 2 : arrowCounters.forward
        setOptionsOnArrowKey(arrowCounters, 'forward', 0)
      }
      else if (KeyID === 13) {
        if (currentKey === KeyCodes.KEY_UP_ARROW || currentKey === KeyCodes.KEY_DOWN_ARROW) {
          
          handleClick(arrowCounter.value)

        }
      }
      else if (KeyID === KeyCodes.KEY_ESC) {
        setIsOpenPopup(false)
      }

    }
    console.log({ relationOptions })
    console.log({ total })
    console.log({value})
    console.log('is open================>',isOpenPopup)
    const renderOption = () => {
      // if (isOpenPopup) {
        return (
          <div className="dropdownContent" >

            {((total > (relationOptions.length)) || searchVal!==undefined ) &&
            <div className="option">
              <input id="myInput" type="text"   name="clinCellEditor" placeholder={`Find ${itemPluralLable}...`}
                onKeyDown={onKeyDown}
                value={searchVal || ''}
                onChange={(event) => {
                  console.log('search value-->',event.target.value)
                  setSearchVal(event.target.value)
                }} />

            </div>}
            {relationOptions?.map((option: any, index: any) => (
                <div key={option.id} className={option.id === value?.id  ? 'option activeBlueOption' : 'option'} id={`option_${option?.id}`} ref={(el: any) => refOption.current[index] = el} onClick={() => handleClick(option)}>
                <span>
                  {option?.label || ''}
                  <br />
                  {option?.email || ''}
                </span>
              </div>
            ))}
            {total > 0 && total > (relationOptions?.length || 0) && total !== relationOptions.length  &&
              <div className='loadBtn' onClick={() => {
                let page = pageFrom + 10;
                setPageFrom(page)
              }}> Load more...</div>

            }
            {searchVal && relationOptions.length===0 && <div className={'option'} >No match found</div>}
            {relationOptions.length === 0 && value===props?.data?.[props?.colDef?.field] && !isLoading && <div className={'option'} >No {itemPluralLable}s are availabe</div>}
          
          </div>
        )
      // }
    }

    return (
      <div className="simpleSelect">
        <div className="dropdown">
        {isLoading && <Loading iconStyle={{fill:'#808080'}} componentStyle={{width: "100%",height: '100%',display:'flex',alignItems:"center",justifyContent:'center',background: 'rgba(239, 239, 240, 0.4)',zIndex:201,position: "absolute"}} />}

          <input className="textbox" ref={refInput} autoFocus={true}  readOnly onFocus={handleFocus} onKeyDown={onKeyDown} value={value?.label || '' } placeholder={`Select ${props?.colDef?.field}`} />
          {renderOption()}
        </div>


      </div>
    );
  }
);

