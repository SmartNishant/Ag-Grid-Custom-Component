import { ICellEditor, ICellEditorParams } from "ag-grid-community";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
// import './BasicCellEditor.css'
import axios from '../axiosConfig'
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;
const KEY_ESC = 27;
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
export const ClinCellEditor = forwardRef<any, any>(
  (props, ref) => {
    console.log(props)
    const pageSize=10
    const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);
    const [value, setValue] = useState<ValueType[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [pageFrom,setPageFrom]=useState(0)
    const getData=async(search?: any)=>{
      const query={"sort":[{"label.keyword":{"order":"asc"}}],"size":10,"query":{"bool":{"must":[{"terms":{"entityState.itemID":[5]}},{"term":{"isCurrentVersion":true}},{"simple_query_string":{"query":search? search+"*": '*',"default_operator":"and","fields":["label"]}}],"must_not":[{"exists":{"field":"ownerContentDef"}}]}},"from":pageFrom}
      const response=await axios.get(`/${props?.appDefId}/contentinses/${props?.contentInsId}/items?query=${JSON.stringify(query)}`)
      console.log({response})
      let options: OptionType[]=[...relationOptions]
      setTotal(response?.data?.total)
      response.data.results.forEach((item: any)=>{
        options.push({
          id: item['contentItemID'],
         label: item['5696531']
        })
      })
      setRelationOptions(options)
      console.log({options})
    }
   
    useEffect(()=>{
      console.log('useEffect call=========================>')
   
  
      getData()
    },[])
    useEffect(()=>{
      console.log('useEffect call=========================>')
   
  
      getData()
    },[pageFrom])
    const refInput = useRef<HTMLInputElement>(null);

   
    const handleClick = (option: OptionType) => {
      let optionValues = [...value]
      optionValues.push({
        id: option?.id,
        label: option.label || '',
        email: option.email || '',
      })
      let relationValues=[...relationOptions]
      relationValues=relationValues.filter((item)=>item.id !==option.id)
      setRelationOptions(relationValues)
      setValue(optionValues)
    }
    console.log({ value })
    const onCrossClick = (id: number | undefined) => {
      let options = [...value]
      options = options.filter((option) => option.id !== id);
      setValue(options)
    //   let relationValues=[...relationOptions]
    //   relationValues.push(Option)
    //   setRelationOptions(relationValues)
    }

    return (
      <div className="custom-select">
          <div className="chip-wrapper">
            {value.map((val) => (
              <div className="chip">

                {val.label}
                <span className="closebtn" onClick={() => onCrossClick(val?.id)}>&times;</span>
              </div>
            ))}
            <div className="combobox">
              <div className="dropdown">
                <div>
                  <input type="text" name="clinCellEditor" placeholder="Add item" onChange={(event)=>{
                    console.log('val:>',event.target.value)
                   getData(event.target.value)
                  }} />
                </div>
                {/* <div className="dropdown-content">
                  {relationOptions?.map((option: any, index: any) => (
                    <>          <div className="option" onClick={() => handleClick(option)}>
                      <span>
                        {option?.label || ''}
                        <br />
                        {option?.email || ''}
                      </span>
                    </div>
                      {total > 0 && total >= (relationOptions.length+value.length) && total !== (relationOptions.length+value.length) &&  index>0  && index%9===0 &&
                        <div className="load-btn" onClick={()=>{ let page=pageFrom + 10;
                          setPageFrom(page)
                        }}> Load more...</div>

                      }
                    </>

                  ))}
                </div> */}
                  <div id="myDropdown" className="dropdown-content">
                  {relationOptions?.map((option: any, index: any) => (
                    <>          <div className="option" onClick={() => handleClick(option)}>
                      <span>
                        {option?.label || ''}
                      </span>
                    </div>
                      {total > 0 && total >= (relationOptions.length+value.length) && total !== (relationOptions.length+value.length) &&  index>0  && index%9===0 &&
                        <div className="load-btn" onClick={()=>{ let page=pageFrom + 10;
                          setPageFrom(page)
                        }}> Load more...</div>

                      }
                    </>

                  ))}
 
  </div>
              </div>
            </div>
        </div>

      </div>
    );
  }
);

