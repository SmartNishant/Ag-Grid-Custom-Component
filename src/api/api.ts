import axios from '../axiosConfig'
interface RelationType {
    LeftContentItemID?: number
    RightContentItemID?: number
    ContentInsRelationshipInsID?: number,

}
interface FieldValueType {
    ID?: number
    Value?: string | number
  }
  export interface PayloadType {
    "ItemIDs": number[], // contentitemId
    "Publish": boolean,
    "Fields": FieldValueType[], // field with relation id and udated payload
    "AddRelationships": RelationType[],
    "ReplaceRelationships": RelationType[],
    "RemoveRelationships": RelationType[],
    "RemoveAllRelationships": {
      ContentInsRelationshipInsID?: number
    }[]
  }
export interface IBulkPayloadDataType {
    RequestPayload: any,
    IncludeDiagnosticOutput: boolean
}
const getInfo=(appdefId: number,contentInsId: number)=> axios.get(`/${appdefId}/contentInses/${contentInsId}/info`)
const updateContenntItem=(appDefId: number,contentInsId: number, payload: any)=> axios.put(`${appDefId}/contentInses/${contentInsId}/items/bulkUpdate`,{
    'RequestPayload': JSON.stringify(payload),
    "IncludeDiagnosticOutput": true 
})
// const getPrograms=(query: string)=> axios.get(`/166913/contentinses/610320/items?query=${query}`)
const getContentItems=(appDefId: number,contentInsId: number,query: string)=> axios.get(`/${appDefId}/contentinses/${contentInsId}/items?query=${query}`)
const AddContentItem=(appDefId: number,contentInsId: number,payload: any)=> axios.post(`${appDefId}/contentInses/${contentInsId}/items/immediate`,payload)
const getContentStoresURI=(appDefId:number,urlList: string[])=>{
  let query={"query":{"bool": {"must": [{"terms":{"entityState.itemID": [1,2,3,4,5]}}, {"term":{"isCurrentVersion":true}},{'terms':{'uri': urlList}}]}}, "sort": [{"id":{"order":"desc"}}], "size": 100, "from": 0}
  return axios.get(`https://squad1e.emgage-dev2.com/api/v1/appdefs/${appDefId}/contentInses?query=${JSON.stringify(query)}`)
}

export {
    getInfo,
    updateContenntItem,
    getContentItems,
    AddContentItem,
    getContentStoresURI
}