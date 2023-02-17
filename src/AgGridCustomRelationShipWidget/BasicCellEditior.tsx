
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
import './BasicCellEditor.scss'
import axios from '../axiosConfig'
import { redirectToPage } from '../utils'

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


export const ClinCellEditor = forwardRef<any, any>(
  (props, ref) => {
    const itemPluralLable = props.colDef.field

    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const [filterOptions, setFilterOptions] = useState<OptionType[]>([]);
    const [optionValues, setOptionValues] = useState<ValueType[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [total, setTotal] = useState<number>(0);
    const [pageFrom, setPageFrom] = useState(0)
    const [counters, setCounters] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
    const [currentKey, setCurrentKey] = useState<number>()
    const [searchVal, setSearchVal] = useState('')
    const [arrowCounter, setArrowCounter] = useState<CounterType>({
      forward: 0,
      backward: 0,
    })
    const [isOpen, setIsOpen] = useState(false)
    const [isDisplayInput, setIsDisplayInput] = useState(true)
    const refInput = useRef<HTMLInputElement>(null);
    const refOption = useRef<HTMLInputElement[]>([]);
    useEffect(() => {
      setTimeout(() => {
        if (refInput && refInput.current) {
          refInput.current.focus();
        }
      });
    }, [arrowCounter, optionValues, filterOptions])

    const getData = async (search?: any) => {
      setIsLoading(false)
      const query = { "sort": [{ "label.keyword": { "order": "asc" } }], "size": 10, "query": { "bool": { "must": [{ "terms": { "entityState.itemID": [5] } }, { "term": { "isCurrentVersion": true } }, { "simple_query_string": { "query": search ? search + "*" : '*', "default_operator": "and", "fields": ["label"] } }], "must_not": [{ "exists": { "field": "ownerContentDef" } }, { "terms": { "id": props.data[`${props.colDef.field}RelationIds`] } }] } }, "from": pageFrom }
      const response = await axios.get(`/${props?.appDefId}/contentinses/${props?.relationContentInsId}/items?query=${JSON.stringify(query)}`)
      let options: OptionType[] = search ? [] : [...relationOptions]

      setTotal(response?.data?.total)
      response.data.results.forEach((item: any) => {
        options.push({
          id: item['contentItemID'],
          label: item[props?.colDef?.cellEditorParams?.primitiveId],
          changeTimestamp: item['changeTimestamp']
        })
      })
      setRelationOptions(options)
      setFilterOptions(options)
      setIsLoading(true)
    }

    useEffect(() => {
      setOptionValues(props?.data?.[props?.colDef?.field])
      setCounters((prevCounter) => {
        return {
          ...prevCounter,
          backward: props?.data?.[props?.colDef?.field].length - 1
        }
      })

      getData()
    }, [pageFrom])

    useEffect(() => {
      if (optionValues.length === props?.maxCardinality) {
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
    }, [optionValues])
    useEffect(() => {
      if (filterOptions.length > 0)
        setArrowCounter((prevCounter) => {
          return {
            ...prevCounter,
            backward: filterOptions.length - 1
          }
        })
    }, [filterOptions])


    const handleClick = (option: OptionType | undefined) => {
      debugger
      let optionValue = [...optionValues]
      optionValue.push({
        id: option?.id,
        label: option?.label || '',
        email: option?.email || '',
      })
      let relationValues = [...filterOptions]
      console.log({ relationValues })
      relationValues = relationValues.filter((item) => item.id !== option?.id)
      setFilterOptions(relationValues)
      setOptionValues(optionValue)
      props?.handleChangeEvent('AddRelationships', props?.data?.id, option?.id, props?.colDef?.id)

    }
    const onCrossClick = (id: number | undefined) => {
      let options = [...optionValues]
      options = options.filter((option) => option.id !== id);
      setOptionValues(options)
      let relationValues = [...relationOptions]
      let filterRelationValues = [...filterOptions]
      let filterItem = relationValues.filter((item) => item.id === id)
      if (filterItem.length)
        filterRelationValues.push(filterItem[0])
      props?.handleChangeEvent('RemoveRelationships', props?.data?.id, id, props?.colDef?.id)
      setFilterOptions(filterRelationValues)
    }

    const setOptionsOnArrowKey = (arrowCounters: any, key: string, defaultValue: number) => {
      if (key === 'forward' && arrowCounters[key] === filterOptions.length) {
        arrowCounters[key] = defaultValue

      } else if (arrowCounters[key] < 0) {
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
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      if (KeyID === 38) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.backward = KeyCodes.KEY_DOWN_ARROW === currentKey ? arrowCounters.forward - 2 : arrowCounters.backward

        // clear(true)

        setOptionsOnArrowKey(arrowCounters, 'backward', filterOptions.length - 1)
      }
      else if (KeyID === 40) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.forward = KeyCodes.KEY_UP_ARROW === currentKey ? arrowCounters.backward + 2 : arrowCounters.forward
        setOptionsOnArrowKey(arrowCounters, 'forward', 0)
      }
      else if (KeyID === 13) {
        if (currentKey === KeyCodes.KEY_UP_ARROW || currentKey === KeyCodes.KEY_DOWN_ARROW) {
          handleClick(arrowCounter?.value)
          clear(false)
        }
        else if (currentKey === KeyCodes.KEY_F2) {
          redirectToPage(props?.appDefId, props?.relationContentInsId, counters?.value?.id || 0, false)
          clear(true)
        }
      } else if (KeyID === KeyCodes.KEY_DELETE) {
        if (currentKey === KeyCodes.KEY_F2)
          onCrossClick(counters.value?.id)
      }
      else if (KeyID === KeyCodes.KEY_ESC) {
        setIsOpen(false)
      }
    }
    const handleFocus = () => {
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

    return (
      <div className={'customSelect'} >
        <div className={'chipWrapper'}
          onKeyDown={onKeyDown}
        >
          {optionValues.map((val, index) => (
            <button className={'chip'} id={`chip_${val.id}`} key={val.id} tabIndex={index + 1} >

              {val.label}
              <span className={'closebtn'} id={`btn_${val.id}`} onClick={() => onCrossClick(val?.id)}>&times;</span>
            </button>
          ))}
          <div className="combobox">
            {isDisplayInput && <input id={'customInput'} onFocus={handleFocus} ref={refInput} type="text" name="clinCellEditor" placeholder={`Add ${itemPluralLable}`} onChange={(event) => {
              setSearchVal(event.target.value)
              getData(event.target.value)
            }}

            />
            }
            {isOpen && <div className={'dropdownContent'}  >
              {filterOptions?.map((option: any, index: any) => (
                <>
                  <input type="text" className={'option'} key={option?.id}
                    id={`option_${option?.id}`}
                    readOnly
                    ref={(el: any) => refOption.current[index] = el} onClick={() => handleClick(option)} value={option?.label || ''} />
                  {total > 0 && total >= filterOptions.length && total !== filterOptions.length && index > 0 && index % 9 === 0 &&
                    <div className={'loadBtn'} onClick={() => {
                      let page = pageFrom + 10;
                      setPageFrom(page)
                    }}> Load more...</div>

                  }
                </>

              ))}
              {filterOptions.length === 0 && !searchVal && isLoading && <div className={'option'} >No {itemPluralLable} are availabe</div>}
              {filterOptions.length === 0 && searchVal && isLoading && <div className={'option'} >No {itemPluralLable} are availabe</div>}
            </div>}
          </div>
        </div>

      </div>
    );
  }
);

