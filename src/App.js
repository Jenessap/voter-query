import React from "react";
import "./styles.css";
import Google from "./Google";
import { Button, Tag } from "@blueprintjs/core";
import "../node_modules/normalize.css/normalize.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import { Suggest } from "@blueprintjs/select";
import {
  prepareSQLClauses,
  constructQueryForExport,
  constructQueryForSubsetCount
} from "./Query";

const logicOptions = {
  INTEGER: [
    { id: "=", title: "equal to" },
    { id: ">", title: "greather than" },
    { id: ">=", title: "greater than or equal to" },
    { id: "<", title: "less than" },
    { id: "<=", title: "less than or equal to" },
    { id: "IN", title: "is one of" },
    { id: "!=", title: "is not" }
    // {id: 'null', title: 'is empty'},
    // {id: 'set', title: 'is not empty'}
  ],

  STRING: [
    { id: "=", title: "is exactly" },
    // {id: 'starts', title: 'starts with'},
    // {id: 'ends', title: 'ends with'},
    // {id: 'contains', title: 'contains'},
    // {id: 'icontains', title: 'contains (case-insensitive)'},
    { id: "IN", title: "is one of" },
    { id: "!=", title: "is not" }
    // {id: 'notcontains', title: 'does not contain'},
    // {id: 'null', title: 'is empty'},
    // {id: 'set', title: 'is not empty'}
  ],

  BOOLEAN: [
    { id: "=", title: "is" }
    // {id: 'true', title: 'is true'},
    // {id: 'false', title: 'is false'},
    // {id: 'null', title: 'is empty'},
    // {id: 'set', title: 'is not empty'}
  ],

  DATE: [
    { id: "<", title: "is before" },
    { id: ">", title: "is after" }
    // {id: 'between', title: 'is between'}
    // {id: 'null', title: 'is empty'},
    // {id: 'set', title: 'is not empty'}
  ]
};
// Number:
// - {id: 'equal', title: 'equal to'}
// - {id: 'greater', title: 'greather than' }
// - {id: 'greaterequal': title: 'greater than or equal to'}
// - {id: 'less', title: 'less than'},
// - {id: 'lessequal', title: 'less than or equal to'}
// - {id: 'in', title: 'is one of'}
// - {id: 'null', title: 'is empty'}
// - {id: 'set', title: 'is not empty'}
// String:
// - {id: 'is', title: 'is exactly'}
// - {id: 'starts', title: 'starts with'}
// - {id: 'ends', title: 'ends with'}
// - {id: 'contains', title: 'contains'}
// - {id: 'icontains', title: 'contains (case-insensitive)'}
// - {id: 'in', title: 'is one of'}
// - {id: 'is not', title: 'is not'}
// - {id: 'notcontains', title: 'does not contain'}
// - {id: 'null', title: 'is empty'}
// - {id: 'set', title: 'is not empty'}
// Boolean:
// - {id: 'true', title: 'is true'}
// - {id: 'false', title: 'is false'}
// - {id: 'null', title: 'is empty'}
// - {id: 'set', title: 'is not empty'}
// Date:
// - {id: 'before', title: 'is before'}
// - {id: 'after', title: 'is after'}
// - {id: 'between', title: 'is between'}
// - {id: 'null', title: 'is empty'}
// - {id: 'set', title: 'is not empty'}

/*





<!-- <App> onExportClick() -->
// Meanwhile, keep the user loading through some spinner.
this.setState({ exporting: true });
Google.export(sql).then(url => {
    this.setState({ exporting: false });
    // Make the url downloadable through a button click.
});

*/

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true,
      subsets: [
        {
          id: "all",
          name: "Is from the Goober family",
          field: { name: "Last_Name", type: "STRING" },
          logic: "=",
          value: "Goober",
          subfilters: null
        },
        {
          id: "1",
          name: "Is a bumbles",
          field: { name: "First_Name", type: "STRING" },
          logic: "=",
          value: "Bumbles",
          subfilters: null
        },
        // {
        //   id: "2",
        //   name: "Second",
        //   field: { name: "Birth_Date", type: "DATE" },
        //   logic: ">",
        //   value: 10,
        //   subfilters: null
        // },
        {
          id: "3",
          name: "Republic party preference",
          field: { name: "Party", type: "STRING" },
          logic: "=",
          value: "Republican",
          subfilters: null
        },
        {
          id: "4",
          name: "Does not vote for a random unknown party",
          field: { name: "Party", type: "STRING" },
          logic: "IN",
          value: ["Democrat", "Green", "Republican"],
          subfilters: null
        }
      ],
      subsetHighlighted: "1",
      filters: [
        {
          count: null,
          field: { name: "County", type: "STRING" },
          logic: "=",
          value: "Lander",
          subfilters: null
        }
        // {
        //   count: null,
        //   field: { name: "First_Name", type: "STRING" },
        //   logic: "=",
        //   value: "Jen",
        //   subfilters: null
        // }
      ],
      subsetCounts: {},

      fields: [
        { name: "VoterID", type: "STRING" },
        { name: "First_Name", type: "STRING" },
        { name: "Address_1", type: "STRING" },
        { name: "County", type: "STRING" },
        { name: "Birth_Date", type: "DATE" },
        { name: "Party", type: "STRING" },
        { name: "IDRequired", type: "BOOLEAN" },
        { name: "Children_Count", type: "INTEGER" }
      ],
      columns: [
        "VoterID",
        "First_Name",
        "Address",
        "County",
        "Birth_Date",
        "Party",
        "IDRequired",
        "Children_Count"
      ],
      totalRecords: null
      // countFilterOpen: {state:false, ?}
    };
    // Funtions sent to <Dashboard>.
    this.changeSubsetHighlighted = this.changeSubsetHighlighted.bind(this);
    // Functions sent to <Filters>.
    this.onFilterChange = this.onFilterChange.bind(this);
    this.addRegularFilter = this.addRegularFilter.bind(this);
    this.addCountFilter = this.addCountFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.openCountFilter = this.openCountFilter.bind(this);
    // Functions sent to <Export Options>.
    this.onExportClick = this.onExportClick.bind(this);
    this.closeExportPopup = this.closeExportPopup.bind(this);
    this.search = this.search.bind(this);
    this.onExportConfirm = this.onExportConfirm.bind(this);
  }
  // prepareSQLClauses,
  // constructQueryForExport,
  // constructQueryForSubsetCount

  onExportConfirm() {
    var clauses = prepareSQLClauses(
      this.state.filters.filter(filter => !filter.count),
      this.state.columns,
      this.state.filters.find(filter => filter.count)
    );
    // TODO attach to api rather than console.log
    console.log(
      constructQueryForExport(
        this.state.subsets,
        this.state.subsetHighlighted,
        clauses
      )
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.loggedIn && this.state.loggedIn) {
      Google.getColumns().then(({ fields, numRows }) => {
        this.setState({ fields: fields, totalRecords: numRows });
      });
    }
  }

  componentDidMount() {
    // Show loading until the value of loggedIn has been set
    if (!this.state.loggedIn) {
      Google.load("sign-in").then(loggedIn => {
        this.setState({ loggedIn: loggedIn });
      });
    }
  }

  // Google.getCount(sql).then(count => {
  //     // Store it in a state of a object mapping from subsetID -> count.
  // });
  search() {
    var clauses = prepareSQLClauses(
      this.state.filters.filter(filter => !filter.count),
      this.state.columns,
      this.state.filters.find(filter => filter.count)
    );
    console.log(clauses);
    // TODO attach to api rather than console.log
    var query;
    var newSubsetCounts = this.state.subsetCounts;
    Promise.all(
      this.state.subsets.map((subset, i) => {
        query = constructQueryForSubsetCount(
          this.state.subsets,
          subset.id,
          clauses
        );
        console.log(query);
        return Google.getCount(query).then(count => {
          // Store it in a state of a object mapping from subsetID -> count.
          newSubsetCounts[subset.id] = count;
        });
      })
    ).then(() => {
      this.setState({ subsetCounts: newSubsetCounts });
    });
  }

  changeSubsetHighlighted(subsetHighlighted) {
    console.log(subsetHighlighted);
    this.setState({ subsetHighlighted: subsetHighlighted });
  }

  onFilterChange(index, filter) {
    var newFilters = this.state.filters;
    newFilters[index] = filter;
    this.setState({ filters: newFilters });
  }
  addRegularFilter() {
    var newFilters = this.state.filters;
    newFilters.push({
      count: null,
      field: null,
      logic: null,
      value: null,
      subfilters: null
    });
    this.setState({ filters: newFilters });
  }
  addCountFilter() {
    var newFilters = this.state.filters;
    newFilters.push({
      count: 1,
      field: null,
      logic: null,
      value: null,
      subfilters: null
    });
    this.setState({ filters: newFilters });
    this.openCountFilter();
  }
  removeFilter(index) {
    var splicedFilters = this.state.filters;
    splicedFilters.splice(index, 1);
    this.setState({ filters: splicedFilters });
  }
  openCountFilter() {}
  onExportClick() {}
  closeExportPopup() {}

  render() {
    if (!this.state.loggedIn)
      return (
        <div className="App">
          <div className="App_login-screen">
            <img src="renotype-logo.png" />
            <div className="App_login-screen_app-name">Voter DB Tool</div>
            <div id="sign-in">
              <Button loading={true} />
            </div>
          </div>
        </div>
      );

    return (
      <div className="App">
        <header>
          <div className="App_logo">
            <img src="renotype-logo.png" />
          </div>
          <div className="App_name">Voter DB Tool</div>
        </header>
        <div className="App_filters">
          <Filters
            onSearchClick={this.search}
            filters={this.state.filters}
            fields={this.state.fields}
            onFilterChange={this.onFilterChange}
            addRegularFilter={this.addRegularFilter}
            addCountFilter={this.addCountFilter}
            removeFilter={this.removeFilter}
            openCountFilter={this.openCountFilter}
          />
        </div>
        <div className="App_dashboard">
          <Dashboard
            subsetCounts={this.state.subsetCounts}
            subsets={this.state.subsets}
            highlighted={this.state.subsetHighlighted}
            subsetClicked={this.changeSubsetHighlighted}
          />
        </div>
        <div className="App_footer">
          <div className="App_footer_body">
            <div className="App_footer_body_label">
              Total records: {this.state.totalRecords}
            </div>
            <div className="App_footer_body_action">
              <Button
                icon="export"
                intent="success"
                onClick={this.onExportConfirm}
              >
                Export to CSV
              </Button>
            </div>
          </div>
        </div>
        <ExportOptions
          columns={this.state.columns}
          onExportClick={this.onExportClick}
          exportOpen={this.state.exportOpen}
          close={this.closeExportPopup}
          onExportConfirm={this.onExportConfirm}
        />
        <CountFilterPopup
          fields={this.state.fields}
          onFilterChange={this.onFilterChange}
          removeFilter={this.removeFilter}
          addRegularFilter={this.addRegularFilter}
          open={this.state.countFilterOpen}
          close={this.closeCountFilterPopup}
        />
      </div>
    );
  }
}

class Filters extends React.Component {
  render() {
    return (
      <div className="Filters">
        <div className="Filters_label">Show me voters where</div>
        <div className="Filters_list">
          {this.props.filters.map((filter, i) => {
            return (
              <Filter
                key={i}
                index={i}
                filter={filter}
                fields={this.props.fields}
                onFilterChange={this.props.onFilterChange}
                removeFilter={this.props.removeFilter}
                openCountFilter={this.props.openCountFilter}
              />
            );
          })}
          <Button
            icon="insert"
            intent="primary"
            minimal={true}
            large={true}
            onClick={this.props.addRegularFilter}
          >
            Add filter
          </Button>
          <Button
            icon="insert"
            intent="warning"
            minimal={true}
            large={true}
            onClick={this.props.addCountFilter}
          >
            Add count filter
          </Button>
        </div>
        <div className="Filters_actions">
          <Button icon="search" onClick={this.props.onSearchClick}>
            Search
          </Button>
        </div>
      </div>
    );
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.buildAndChangeFilter = this.buildAndChangeFilter.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onLogicChange = this.onLogicChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  // I think this part is the most important.
  onRemove() {
    this.props.removeFilter(this.props.index);
  }

  buildAndChangeFilter(change) {
    var filter = this.props.filter;
    filter[change[0]] = change[1];
    this.props.onFilterChange(this.props.index, filter);
  }

  // filters: [
  // {count:null, field:{name: "County", type: String }, logic:"is", va
  onFieldChange(field) {
    this.buildAndChangeFilter(["field", field]);
  }
  onLogicChange(logic) {
    this.buildAndChangeFilter(["logic", logic]);
  }
  onValueChange(value) {
    this.buildAndChangeFilter(["value", value]);
  }
  render() {
    // console.log("This is it: ", this.props.filter)
    return (
      <Tag large={true} onRemove={this.onRemove} round={true} intent="primary">
        {!this.props.filter.count ? (
          <span>
            <Field
              fields={this.props.fields}
              onChange={this.onFieldChange}
              selected={this.props.filter.field}
            />
            <Logic
              fieldType={
                this.props.filter.field ? this.props.filter.field.type : null
              }
              onChange={this.onLogicChange}
              selected={this.props.filter.logic}
            />
            <Value
              onChange={this.onValueChange}
              selected={this.props.filter.value}
              field={this.props.filter.field}
            />
          </span>
        ) : null}
      </Tag>
    );
  }
}

class Field extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChange(value);
  }

  renderOption(item, stuff) {
    return <div onClick={stuff.handleClick}>{item.name}</div>;
  }

  renderInputValue(input) {
    return input.name;
  }

  render() {
    return (
      <span>
        <Suggest
          items={this.props.fields}
          onItemSelect={this.onChange}
          closeOnSelect={true}
          resetOnQuery={true}
          itemRenderer={this.renderOption}
          inputValueRenderer={this.renderInputValue}
          selectedItem={this.props.selected}
          inputProps={{ placeholder: "Pick a field" }}
        />
      </span>
    );
  }
}

class Logic extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    return (
      <span>
        {this.props.fieldType ? (
          <div className="bp3-select">
            <select onChange={this.onChange} value={this.props.selected}>
              {logicOptions[this.props.fieldType].map(option => {
                return (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}
      </span>
    );
  }
}

class Value extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }
  render() {
    return (
      <span>
        {this.props.field ? (
          <input
            type="text"
            class="bp3-input"
            value={this.props.selected}
            onChange={this.onChange}
          />
        ) : null}
      </span>
    );
  }
}

class CountFilterPopup extends React.Component {
  constructor(props) {
    super(props);
    this.onClickDone = this.onClickDone.bind(this);
    this.onClickClose = this.onClickClose.bind(this);
  }

  onClickDone() {
    // this.props.buildFilter(this.props.subset.id);
  }
  onClickClose() {
    // this.props.buildFilter(this.props.subset.id);
  }
  render() {
    return (
      <div>
        {/*<div>CountFilterPopup - Question?</div>*/}
        {this.props.open ? (
          <Filter
            filter={this.props.open}
            fields={this.props.fields}
            onFilterChange={this.props.onFilterChange}
            removeFilter={this.props.removeFilter}
          />
        ) : null}
      </div>
    );
  }
}

class Dashboard extends React.Component {
  render() {
    return (
      <div className="Dashboard">
        {/*<div>Dashboard</div>
        <div>The length of subsets is {this.props.subsets.length}</div>*/}
        <div className="Dashboard_subsets">
          {this.props.subsets.concat([{ id: "new" }]).map((subset, i) => {
            return (
              <Subset
                key={i}
                subset={subset}
                count={
                  this.props.subsetCounts.hasOwnProperty(subset.id)
                    ? this.props.subsetCounts[subset.id]
                    : "-"
                }
                highlighted={this.props.highlighted}
                subsetClicked={this.props.subsetClicked}
                add={true}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

class Subset extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.subsetClicked(this.props.subset.id);
  }

  render() {
    return (
      <div
        className={
          "Subset" +
          (this.props.highlighted === this.props.subset.id
            ? " highlighted"
            : "")
        }
      >
        <div className="Subset_body" onClick={this.onClick}>
          <div className="Subset_body_label">{this.props.subset.name}</div>
          <div className="Subset_body_count">{this.props.count}</div>
        </div>
      </div>
    );
  }
}

class ExportOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumns: []
    };
    this.onColumnClick = this.onColumnClick.bind(this);
    this.onClickforExport = this.onClickforExport.bind(this);
  }

  onColumnClick() {
    // this.props.subsetClicked(this.props.subset.id);
  }

  onClickforExport() {
    this.props.onExportConfirm(this.props.columns);
    // this.props.subsetClicked(this.props.subset.id);
  }

  render() {
    return (
      <div>
        {/*<div>ExportOptions</div>*/}
        <Column
          columns={this.props.selectedColumns}
          selectedColumns={this.state.selectedColumns}
          onColumnClick={this.onColumnClick}
        />
      </div>
    );
  }
}

class Column extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    // this.props.subsetClicked(this.props.subset.id);
  }

  render() {
    return null;
  }
}
