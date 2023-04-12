import React, {
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react";
import './SingleSelectAgGrid.scss'
import axios from '../axiosConfig'
import { keyboard } from "@testing-library/user-event/dist/keyboard";
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
export const SingleSelectAgGrid = forwardRef<any, any>(
  (props, ref) => {
    const itemPluralLable = props.colDef.field
    console.log({ itemPluralLable })
    console.log({ props })

    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const refOption = useRef<HTMLInputElement[]>([]);

    const [inputValue, setInputValue] = useState<ValueType>();
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

    const refInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
      setRelationOptions(props?.options
      )
    }, [props?.options
    ])
    useEffect(() => {
      setTimeout(() => {
        if (refInput && refInput.current) {
          refInput.current.focus();
          refInput.current.select();
          // setIsOpen(true)
        }
      });
    }, [relationOptions])
    useEffect(() => {
      if (props?.data)
        setInputValue({
          id: props?.data?.[`${props?.colDef.field}RelationIds`]?.[0] || '',
          label: props?.data?.[props?.colDef.field] || ''

        })

      // getData()
    }, [pageFrom])
    const handleFocus = (e: any) => {
      e.preventDefault()
      setIsOpenPopup(true)
    }
    console.log({ inputValue })
    const handleClick = (option: OptionType | undefined) => {

      // props?.colDef?.cellEditorParams?.handleChangeEvent?.(props?.data?.id, option?.id, props?.colDef?.id, props?.data)
      const rowData = { ...props.data }
      rowData[props?.colDef.field] = option?.label
      // props?.api?.setRowData([rowData])
      setIsOpenPopup(false)
      setInputValue(option)
      props?.onValueChange(option, props?.data, props?.colDef?.field)
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
      e.preventDefault()
      let KeyID = e.keyCode;
      console.log('key board eevnt================================>', KeyID)
      let windowEvent: any = window.event
      setCurrentKey(KeyID)
      console.log({ KeyID })

      if (windowEvent) {
        KeyID = windowEvent?.keyCode;
      } else {
        KeyID = e.which;
      }
      if (KeyID === KeyCodes.KEY_UP_ARROW) {
        let arrowCounters = { ...arrowCounter }
        arrowCounters.backward = KeyCodes.KEY_DOWN_ARROW === currentKey ? arrowCounters.forward - 2 : arrowCounters.backward


        setOptionsOnArrowKey(arrowCounters, 'backward', relationOptions.length - 1)
      }
      else if (KeyID === KeyCodes.KEY_DOWN_ARROW) {
        let arrowCounters = { ...arrowCounter }
        if(!isOpenPopup)
        setIsOpenPopup(true)
        arrowCounters.forward = KeyCodes.KEY_UP_ARROW === currentKey ? arrowCounters.backward + 2 : arrowCounters.forward
        setOptionsOnArrowKey(arrowCounters, 'forward', 0)
      }
      else if (KeyID === KeyCodes.KEY_ENTER) {
        if (currentKey === KeyCodes.KEY_UP_ARROW || currentKey === KeyCodes.KEY_DOWN_ARROW) {
          console.log('enter===================================>', arrowCounter)
          handleClick(arrowCounter.value)

        }
      }
      else if (KeyID === KeyCodes.KEY_ESC) {
        setIsOpenPopup(false)
      }

    }
    console.log({ relationOptions })
    console.log({ total })
    console.log('isopenpopup=====================================================>', isOpenPopup)
    const renderOption = () => {
      if (isOpenPopup) {
        return (
          <div className="dropdownContent" >
            {total > 0 && total > (relationOptions.length) && <div className="option">
              <input id="myInput" type="text" name="clinCellEditor" placeholder={`Find ${itemPluralLable}...`}
                onKeyDown={onKeyDown}
                onChange={(event) => {
                  // setSearchVal(event.target.value)
                  console.log('inside search================================>')
                  props?.onSearch(event.target.value, props?.colDef.field)

                  // getData(event.target.value)
                }} />

            </div>}
            {/* } */}
            {relationOptions?.map((option: any, index: any) => (
              <div key={option.id} className={option.id === inputValue?.id || option.label === inputValue?.label ? 'option activeBlueOption' : 'option'} id={`option_${option?.id}`} ref={(el: any) => refOption.current[index] = el} onClick={() => handleClick(option)}>
                <span>
                  {option?.label || ''}
                  <br />
                  {option?.email || ''}
                </span>
              </div>

            ))}
            {props?.total > 0 && props?.total > (relationOptions?.length || 0) &&
              <div className='loadBtn' onClick={() => {
                let page = pageFrom + 10;
                setPageFrom(page)
              }}> Load more...</div>

            }
            {relationOptions?.length === 0 && !searchVal && isLoading && <div className="option" >No item are availabe</div>}
            {relationOptions?.length === 0 && searchVal && isLoading && <div className="option" >No item are availabe</div>}
          </div>
        )
      }
    }

    return (
      <div className="simpleSelect" >
        <div className="dropdown">
         <input className="textbox" ref={refInput} readOnly onFocus={handleFocus} onKeyDown={onKeyDown} value={inputValue?.label ? inputValue?.label : `Select ${itemPluralLable}`} />
          {renderOption()}
        </div>


      </div>
    );
  }
);

