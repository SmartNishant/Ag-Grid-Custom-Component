import React from 'react';
import './App.css';
import AgGridCellRender from './AgGridCellRender/AgGridCellRender'
import CommanAgGridRelation from './AgGridCustomRelationShipWidget/CommanAgGridRelation';
interface OptionType {
  id: number,
  key: string
  label: string,
  email?: string,
}

function App() {
  return (
    <div className="App">
    <CommanAgGridRelation  appDefId={112641} contentInsId={458768} relationContentInsId={434192} maxCardinality={5} />
    {/* <AgGridCellRender appDefId={112641} contentInsId={458768} isMultipleRelation={false} /> */}
     {/* <CommanAgGridRelation appDefId={112641} contentInsId={459792} relationContentInsId={434192} /> */}
    </div>
  );
}

export default App;
