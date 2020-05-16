import React from "react";
import {
  prepareSQLClauses,
  buildSubsetWhereClause,
  constructQueryForExport,
  constructQueryForSubsetCount
} from "./Query";

class Something extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bumbles: [{ id: "10", name: "Jenny Peterson" }]
    };
  }
  addSomethingToList(something) {
    // something = {id: '2', name: 'Varun Arora'}

    // .push -> adds one item to an array, .concat -> merges two arrays

    var newBumbles = this.state.bumbles;
    newBumbles.push(something);
    this.setState({ bumbles: newBumbles });
  }
  addSomethingSomewhereInList(something, somewhere = 0) {
    // slice, splice
    var addedBumbles = this.state.bumbles;
    addedBumbles.splice(somewhere, 0, something);
    this.setState({ bumbles: addedBumbles });
  }
  removeSomethingFromList(id) {
    var spot;
    for (let step = 0; step < this.state.bumbles.length; step++) {
      if (this.state.bumbles[step].id === id) {
        spot = step;
        break;
      }
    }
    var splicedBumbles = this.state.bumbles;
    splicedBumbles.splice(spot, 1);
    this.setState({ bumbles: splicedBumbles });
  }
  changeSomethingInList(id, keyValues = { name: "Jenessa Peterson" }) {
    var spot;
    for (let step = 0; step < this.state.bumbles.length; step++) {
      if (this.state.bumbles[step].id === id) {
        spot = step;
        break;
      }
    }
    var changedBumbles = this.state.bumbles,
      changedBumble = changedBumbles[spot];
    for (let key in keyValues) {
      let value = keyValues[key];
      changedBumble[key] = value;
    }
    this.setState({ bumbles: changedBumbles });
  }
}

var filters1 = [
  {
    count: null,
    field: { name: "County", type: String },
    logic: "=",
    value: "Washoe",
    subfilters: null
  },
  {
    count: null,
    field: { name: "First_Name", type: String },
    logic: "=",
    value: "Jen",
    subfilters: null
  },
  {
    count: null,
    field: { name: "Address_1", type: String },
    logic: "!=",
    value: "",
    subfilters: null
  },
  {
    count: null,
    field: { name: "County_Status", type: String },
    logic: "=",
    value: "Active",
    subfilters: null
  },
  {
    count: 3,
    field: null,
    logic: null,
    value: null,
    subfilters: [
      {
        count: null,
        field: { name: "Election_Date", type: String },
        logic: ">",
        // TODO: Fix date format here later.
        value: "DATE('2016-01-01')",
        subfilters: null
      }
    ]
  }
];

var subsets1 = [
  {
    id: "1",
    name: "First",
    count: 1,
    field: { name: "Last_Name", type: String },
    logic: "=",
    value: "Goober",
    subfilters: null
  },
  {
    id: "2",
    name: "Second",
    count: 2,
    field: { name: "Birth_Date", type: String },
    logic: ">",
    value: 10,
    subfilters: null
  },
  {
    id: "3",
    name: "Third",
    count: 3,
    field: { name: "Party", type: String },
    logic: "=",
    value: "Democrat",
    subfilters: null
  },
  {
    id: "4",
    name: "Fourth",
    count: 4,
    field: { name: "Party", type: String },
    logic: "IN",
    value: ["Democrat", "Green", "Republican"],
    subfilters: null
  },
  {
    id: "all",
    name: "First",
    count: 1,
    field: { name: "Last_Name", type: String },
    logic: "=",
    value: "Goober",
    subfilters: null
  }
];
var subsetHighlighted = "4";
var columns1 = [
  "VoterID",
  "First_Name",
  "Address",
  "County",
  "Birth_Date",
  "Party",
  "IDRequired",
  "Children_Count"
];

// Assigns the clauses object created in the above function to a variable available outside the function
var clauses = prepareSQLClauses(
  filters1.filter(filter => !filter.count),
  columns1,
  filters1.find(filter => filter.count)
);

var santaClauses = prepareSQLClauses(
  filters1.filter(filter => !filter.count),
  columns1
);

/*
// testing
console.log("build sub ", buildSubsetWhereClause(subsets1, "3", clauses));

// testing
console.log(constructQueryForExport(subsets1, "all", clauses));

// testing
console.log(constructQueryForSubsetCount(subsets1, "4", clauses));

console.log(
  "santa: ",
  constructQueryForSubsetCount(subsets1, "4", santaClauses)
);

// testing
constructQueryForSubsetCount(subsets1, "3", clauses);
*/

/*
${constructQueryForExport(subsets1, "4", clauses) }


WITH threeVotes AS (SELECT VoterID, count(voterID) as numVotes FROM `renotype.Voter_dataset.History` WHERE Election_Date > DATE('2016-01-01') GROUP BY VoterID HAVING numVotes > 2)
SELECT VoterID, First_Name, Middle_Name, Last_Name, Suffix, Birth_Date, Address_1, Address_2, City, State, Zip, Party
FROM `renotype.Voter_dataset.Voters`
INNER JOIN threeVotes
USING(VoterID)
WHERE Address_1 IS NOT NULL;

*/
/*
voteCountClauses = {
  select: "VoterID, COUNT(VoterID) as numVotes",
  from: `History`,
  where: (variable - based on filters),
  logic: ">=" (or others),
  minCount: (variable)

`WITH countClause AS 
      (SELECT VoterID, 
        count(voterID) as numVotes 
        FROM `renotype.Voter_dataset.History`
        WHERE Election_Date ${voteCountClauses.logic} DATE('${voteCountClauses.election_date}') 
        GROUP BY VoterID HAVING numVotes >= ${minTimeVoted})`

  `WITH countClause AS 
      (SELECT VoterID, 
        count(voterID) as numVotes 
        FROM `renotype.Voter_dataset.History`
        WHERE (Election_Date ${voteCountClauses.logic} DATE('${voteCountClauses.election_date}')) 
        AND 

        GROUP BY VoterID HAVING numVotes >= ${minTimeVoted})`

}

WITH countClause AS 
      (SELECT VoterID, 
        count(voterID) as numVotes 
        FROM `renotype.Voter_dataset.History` 
        WHERE Election_Date > DATE('2016-01-01') 
        GROUP BY VoterID HAVING numVotes > 2)
SELECT *
FROM `Voters`
INNER JOIN voteCountClause
USING (VoterID)
WHERE filters;  


*/

// for (let i = 0; i < filters.length; i++) {
//     var myWhere = []
//     myWhere.push(filters[i].field.name);
//     myWhere.push(filters[i].logic.sql);
//     myWhere.push(filters[i].value);
//     newWhere.push(myWhere.join(' '));
// }

// Adjust this to pick only subset highlighted.

// for (let k = 0; k < .length; i++) {
// newWhere.push([chosenSubset.field.name, chosenSubset.logic.sql,chosenSubset.value].join(' '));
// }

/*
WITH countClause AS 
  (SELECT VoterID, 
    COUNT(voterID) as numberOf 
    FROM `renotype.Voter_dataset.History`
    WHERE ( Election_Date > "DATE('2016-01-01')" )  
    GROUP BY VoterID HAVING numberOf >= 3)
  SELECT VoterID,First_Name,Address,County,Birth_Date,Party,IDRequired,Children_Count
  FROM `renotype.Voter_dataset.Voters`
  INNER JOIN CountClause USING(VoterID)
  WHERE ( County = "Washoe" ) AND ( First_Name = "Jen" ) AND ( Address_1 != "" ) AND ( County_Status = "Active" ) AND ( Party IN ("Democrat","Green","Republican") );
  
  
  Test Cases:

  1
  Description: 
  Example SQL query:
  Test:
  console.log()

  2
  Description:
  Example SQL query:
  Test:
  console.log()


  3
  Description:
  Example SQL query:
  Test:
  console.log()

  4
  Description:
  Example SQL query:
  Test:
  console.log()

  5
  Description:
  Example SQL query:
  Test:
  console.log()

  6
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()

  1
  Description:
  Example SQL query:
  Test:
  console.log()


  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  */

/*
- App
- CountFilterPopup
- [Filter]
- Filters
- [Filter]
- Field
- Logic
- [Value]
- Dashboard
- [Subset]
- ExportOptions
- [Column]

CountFilterPopup:
props:
- object containing (count, field, logic,value(s) and subfilters chosen)
- array of objects containing field names and field types
- onFilterChange function
- addRegularFilter function (I'm talking about subfilters, not the main list)
- removeFilter funtion (I'm talking about subfilters, not the main list)
- prop (which is a boolean value) called "open"
- prop (which is a function) called "close"
state:
local functions:
- onClick for done
- onClick for close

Filters:
props:
- array of objects (filter, filter, filter...)
- array of objects containing field names and field types
- onFilterChange function
- addCountFilter function
- addRegularFilter function
- removeFilter funtion
- openCountFilter (this opens the count filter popup when a count filter is clicked)
state:

local functions:


[Filter]:
props:
- object containing (count, field, logic,value(s) and subfilters chosen)
- array of objects containing field names and field types
- onFilterChange function
- removeFilter function to remove this filter
- openCountFilter (this opens the count filter popup when a count filter is clicked)
state:

local functions:
- function to summarize data from children into one object
- onFieldChange function
- onLogicChange function
- onValueChange function

Field:
props:
- array of field options
- onFieldChange funtion to change which field has been chosen.
- single name of the chosen field
state:
local functions:
- its own onChange function to tell which field has been chosen

Logic:
props:
state:
local functions:

Value:
props:
state:
local functions:


ExportOptions:
props:
- array of column objects (called "columns") (like "subsets")
- onExportClick button (send this info up to App)
- prop (which is a boolean value) called "open"
- prop (which is a function) called "close"
state:
- array of selectedColumns (like "highlighted") for each column
local functions:
- OnClick for export to csv button pressed.
- onColumnClick function (passed down to Column)


[Column]:
props:
- array of column objects (called "columns") (like "subsets") with their keys including (presentedName, exactColumnName (in original data) )
- array of selectedColumns (listed by their exact column names)
- onColumnClick function (that gets passed down from ExportOptions) (like "subsetClicked")
state:
local functions:
- its own onClick function to tell that this column has been toggled

*/

// export default function App() {
// return (
// <div className="App">
// <h1>Hello CodeSandbox</h1>
// <h2>Start editing to see some magic happen!</h2>
// </div>
// );
// }
// Varun Arora3:02 PM
// Array.slice()
// Array.concat()
// Array.splice()
// Varun Arora3:03 PM
// this.state.subsets[index].count += 1
// this.setState({ subsets: subsets })
