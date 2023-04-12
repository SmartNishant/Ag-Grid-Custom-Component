import React from 'react';
import './App.css';
import AgGridCellRender from './AgGridCellRender/AgGridCellRender'
import CommanAgGridRelation from './AgGridCustomRelationShipWidget/CommanAgGridRelation';
import AgGridRiskComponent from './AgGridRiskComponent/AgGridRiskComponent';
import AgGridLargeText from './AgGridLargeText/AgGridLargeText';
import AgGridOneToOneReation from './AgGridOneToOneRelationship/AgGridOneToOneReation';
import ControllAssessmentAgGrid from './ControllAssessmentAgGrid/ControllAssessmentAgGrid';
import { AgGridMasterTable } from './AgGridMasterTable/AgGridMasterTable';
interface OptionType {
  id: number,
  key: string
  label: string,
  email?: string,
}

function App() {
  return (
    <div className="App">
      {/* <AgGridMasterTable/> */}
      {/* 187393 */}
       <ControllAssessmentAgGrid appDefId={188417} />
      {/* <AgGridLargeText /> */}
      {/* <AgGridRiskComponent appDefId={166913} riskRank={3541010} riskScore={8044563} contentInsId={613392}   /> */}
    {/* <CommanAgGridRelation  appDefId={112641} contentInsId={458768} relationContentInsId={434192} maxCardinality={5} /> */}
    {/* <AgGridCellRender appDefId={112641} contentInsId={458768} isMultipleRelation={false} /> */}
     {/* <AgGridOneToOneReation appDefId={112641} contentInsId={459792} relationContentInsId={434192} /> */}
    </div>
  );
}

export default App;
