import axios from '../axiosConfig'

const getInfo=(appdefId: number,contentInsId: number)=> axios.get(`/${appdefId}/contentInses/${contentInsId}/info`)
const updateContenntItem=(appDefId: number,contentInsId: number, payload: any)=> axios.put(`${appDefId}/contentInses/${contentInsId}/items/bulkUpdate`,{
    'RequestPayload': payload,
    "IncludeDiagnosticOutput": true 
})
export {
    getInfo,
    updateContenntItem
}