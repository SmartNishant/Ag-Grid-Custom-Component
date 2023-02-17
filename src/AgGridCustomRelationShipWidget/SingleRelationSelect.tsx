import React, {
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
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
export const SingleRelationSelect = forwardRef<any, any>(
  (props, ref) => {
    debugger
    console.log({ props })
    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const refOption = useRef<HTMLInputElement[]>([]);

    const [value, setValue] = useState<ValueType>();
    const [isLoading, setIsLoading] = useState(false)
    const [total, setTotal] = useState<number>(0);
    const [pageFrom, setPageFrom] = useState(0)
    const [searchVal, setSearchVal] = useState('')
    const [isOpenPopup, setIsOpenPopup] = useState(true)
    const [currentKey, setCurrentKey] = useState<number>()
    const [arrowCounter, setArrowCounter] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
    const getData = async (search?: any) => {
      setIsLoading(false)
      const query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": { "exists": { "field": "ownerContentDef" } } } }, "from": pageFrom }
      const response = await axios.get(`/${props?.appDefId}/contentinses/${props?.relationContentInsId}/items?query=${JSON.stringify(query)}`)
      let options: OptionType[] = search ? [] : [...relationOptions]
      setTotal(response?.data?.total)
      response.data.results.forEach((item: any) => {
        options.push({
          id: item['contentItemID'],
          label: item['5696531']
        })
      })
      setRelationOptions(options)
      setIsLoading(true)
    }
    useEffect(() => {
      setValue({
        id: props?.data?.userRelationIds[0],
        label: props?.data?.user[0]

      })

      getData()
    }, [pageFrom])

    const handleClick = (option: OptionType | undefined) => {

      props.colDef.cellEditorParams.handleChangeEvent(props?.data?.id, option?.id, props?.colDef?.id, props?.data)

      setValue(option)

      setIsOpenPopup(false)
    }
    const setOptionsOnArrowKey = (arrowCounters: any, key: string, defaultValue: number) => {
      debugger
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
        // setIsOpen(false)
      }

    }
    const renderOption = () => {
      if (isOpenPopup) {
        return (
          <div className="dropdownContent">
            <div className="option">
              <input id="myInput" type="text" name="clinCellEditor" placeholder="Find..."
                onKeyDown={onKeyDown}
                onChange={(event) => {
                  setSearchVal(event.target.value)
                  getData(event.target.value)
                }} />
            </div>
            {relationOptions?.map((option: any, index: any) => (
              <>          <div className={option.id === value?.id ? 'option activeOption' : 'option'} id={`option_${option?.id}`} ref={(el: any) => refOption.current[index] = el} onClick={() => handleClick(option)}>
                <span>
                  {option?.label || ''}
                  <br />
                  {option?.email || ''}
                </span>
              </div>
                {total > 0 && total >= (relationOptions.length) && total !== (relationOptions.length) && index > 0 && index % 9 === 0 &&
                  <div className="loadBtn" onClick={() => {
                    let page = pageFrom + 10;
                    setPageFrom(page)
                  }}> Load more...</div>

                }
              </>

            ))}
            {relationOptions.length === 0 && !searchVal && isLoading && <div className="option" >No item are availabe</div>}
            {relationOptions.length === 0 && searchVal && isLoading && <div className="option" >No item are availabe</div>}
          </div>
        )
      }
    }

    return (
      <div className="simpleSelect">
        <button className="textbox" onClick={() => setIsOpenPopup(!isOpenPopup)}>
          {value?.id ? value?.label : 'Select Threat'}
        </button>
        {renderOption()}



      </div>
    );
  }
);

