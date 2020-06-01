import React from "react";
import "./styles.css";
import Google from "./Google";
import {
  Button,
  Tag,
  Dialog,
  Classes,
  Intent,
  Checkbox,
  InputGroup,
  FormGroup,
  AnchorButton,
  Position
} from "@blueprintjs/core";
import "../node_modules/normalize.css/normalize.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import { Suggest } from "@blueprintjs/select";
import { DateInput } from "@blueprintjs/datetime";
import { v4 as uuidv4 } from "uuid";
import {
  prepareSQLClauses,
  constructQueryForExport,
  constructQueryForSubsetCount,
  nonValueOperators,
  multiValueOperators
} from "./Query";

const logicOptions = {
  INTEGER: [
    { id: "=", title: "equal to" },
    { id: ">", title: "greather than" },
    { id: ">=", title: "greater than or equal to" },
    { id: "<", title: "less than" },
    { id: "<=", title: "less than or equal to" },
    { id: "IN", title: "is one of" },
    { id: "NOT IN", title: "is not one of" },
    { id: "!=", title: "is not" },
    { id: "BETWEEN", title: "is between" },
    { id: "NOT BETWEEN", title: "is not between" },
    { id: "IS NULL", title: "is not set" },
    { id: "IS NOT NULL", title: "is set" }
  ],

  STRING: [
    { id: "=", title: "is" },
    { id: "LIKE%", title: "starts with" },
    { id: "%LIKE", title: "ends with" },
    //{ id: "icontains", title: "contains (case-insensitive)" },
    { id: "%LIKE%", title: "contains" },
    { id: "NOT %LIKE%", title: "does not contain" },
    { id: "IN", title: "is one of" },
    { id: "NOT IN", title: "is not one of" },
    { id: "!=", title: "is not" },
    { id: "IS ''", title: "is empty" },
    { id: "!= ''", title: "is not empty" },
    { id: "IS NOT NULL", title: "is set" },
    { id: "IS NULL", title: "is not set" }
  ],

  BOOLEAN: [
    { id: "=", title: "is" },
    { id: "IS TRUE", title: "is true" },
    { id: "IS FALSE", title: "is false" },
    { id: "IS NOT NULL", title: "is set" },
    { id: "IS NULL", title: "is not set" }
  ],

  DATE: [
    {id: "=", title: "is"},
    { id: "<", title: "is before" },
    { id: ">", title: "is after" },
    { id: "BETWEEN", title: "is between" },
    { id: "NOT BETWEEN", title: "is not between" },
    { id: "IS NOT NULL", title: "is set" },
    { id: "IS NULL", title: "is not set" }
  ]
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true,
      subsets: [
        {
          id: "all",
          name: "Matching the above filters (all)",
          field: null,
          logic: null,
          value: null,
          subfilters: null
        },
        {
          id: "1",
          name: "Registered Democrat",
          field: { name: "Party", type: "STRING" },
          logic: "=",
          value: "",
          subfilters: null
        },
        {
          id: "2",
          name: "Registered after Jan. 1st, 2018",
          field: { name: "Birth_Date", type: "DATE" },
          logic: ">",
          value: new Date("2018-01-01"),
          subfilters: null
        },
        {
          id: "3",
          name: "65 or older",
          field: { name: "Birth_Date", type: "DATE" },
          logic: "<",
          value: new Date("1955-05-16"),
          subfilters: null
        },
        {
          id: "4",
          name: "Registered Green, Non-Partisan, or Libertarian Party",
          field: { name: "Party", type: "STRING" },
          logic: "IN",
          value: ["Green", "Non-Partisan", "Libertarian Party"],
          subfilters: null
        }
      ],
      subsetHighlighted: "all",
      filters: [
        {
          count: null,
          field: { name: "County_Status", type: "STRING" },
          logic: "=",
          value: "Active",
          subfilters: null
        },
        {
          count: null,
          field: { name: "Address_1", type: "STRING" },
          logic: "!=",
          value: "",
          subfilters: null
        }
      ],
      subsetCounts: {},

      fieldValueOptions: {
        County: [
          "Churchill",
          "Douglas",
          "Esmeralda",
          "Humboldt",
          "Lincoln",
          "Mineral",
          "Pershing",
          "Washoe",
          "Carson City",
          "Clark",
          "Elko",
          "Eureka",
          "Lander",
          "Lyon",
          "Nye",
          "Storey",
          "White Pine"
        ],
        Party: [
          "Green Party",
          "Libertarian Party",
          "Non-Partisan",
          "Other (All Others)",
          "Democrat",
          "Independent American Party",
          "Natural Law Party",
          "Republican"
        ],
        County_Status: [
          "Active",
          "Inactive",
          "P-17",
          ],
        State: ["NV"]
      },

     fields: [
        { name: "VoterID", type: "STRING"},
        { name: "County", type: "STRING" },
        { name: "First_Name", type: "STRING" },
        { name: "Middle_Name", type: "STRING" },
        { name: "Last_Name", type: "STRING"},
        { name: "Suffix", type: "STRING" },
        { name: "Birth_Date", type: "DATE"},
        { name: "Registration_Date", type: "DATE" },
        { name: "Address_1", type: "STRING" },
        { name: "Address_2", type: "STRING" },
        { name: "City", type: "STRING"},
        { name: "State", type: "STRING"},
        { name: "Zip", type: "STRING"},
        { name: "Phone", type: "STRING"},
        { name: "Party", type: "STRING"},
        { name: "Congressional_District", type: "STRING"},
        { name: "Senate_District", type: "STRING"},
        { name: "Assembly_District", type: "STRING" },
        { name: "Education_District", type: "STRING", },
        { name: "Regent_District", type: "STRING"},
        { name: "Registered_Precinct", type: "STRING" },
        { name: "County_Status", type: "STRING" },
        { name: "County_Voter_ID", type: "STRING"},
        { name: "ID_Required", type: "BOOLEAN" }
      ],


      totalRecords: null
      // countFilterOpen: {state:false, ?}
    };
    // Funtions sent to <Dashboard>.
    this.changeSubsetHighlighted = this.changeSubsetHighlighted.bind(this);
    this.addEditSubset = this.addEditSubset.bind(this);
    this.closeAddEditSubset = this.closeAddEditSubset.bind(this);
    this.removeSubset = this.removeSubset.bind(this);
    this.onSubsetDone = this.onSubsetDone.bind(this);

    // Functions sent to <Filters>.
    this.onFilterChange = this.onFilterChange.bind(this);
    this.addRegularFilter = this.addRegularFilter.bind(this);
    this.addCountFilter = this.addCountFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.openCountFilter = this.openCountFilter.bind(this);
    this.closeCountFilterPopup = this.closeCountFilterPopup.bind(this);

    // Functions sent to <Export Options>.
    this.onExportClick = this.onExportClick.bind(this);
    this.closeExportPopup = this.closeExportPopup.bind(this);
    this.search = this.search.bind(this);
    this.onExportConfirm = this.onExportConfirm.bind(this);
  }

  onExportConfirm(columns) {
    var clauses = prepareSQLClauses(
      this.state.filters.filter(filter => !filter.count),
      columns,
      this.state.filters.find(filter => filter.count)
    );
    // TODO attach to api rather than console.log
    var query = constructQueryForExport(
      this.state.subsets,
      this.state.subsetHighlighted,
      clauses
    );

    // Meanwhile, keep the user loading through some spinner.
    this.setState({ exporting: true });
    Google.export(query).then(url => {
      // Make the url downloadable through a button click.
      this.setState({ exporting: false, url, exportOpen: false });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.loggedIn && this.state.loggedIn) {
      Google.getColumns().then(({ fields, numRows }) => {
        this.setState({ fields: fields, totalRecords: numRows });
      });
    }

    if (!prevState.addEditSubsetOpen && this.state.addEditSubsetOpen) {
      // Connect change in value from Firebase.
    }

    if (prevState.addEditSubsetOpen && !this.state.addEditSubsetOpen) {
      // Disconnect Firebase.
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

  search() {
    var clauses = prepareSQLClauses(
      this.state.filters.filter(filter => !filter.count),
      this.state.columns,
      this.state.filters.find(filter => filter.count)
    );

    var query;
    var newSubsetCounts = this.state.subsetCounts;
    Promise.all(
    this.state.subsets.map(subset => {
      query = constructQueryForSubsetCount(
        this.state.subsets,
        subset.id,
        clauses
      );
      return Google.getCount(query).then(count => {
        newSubsetCounts[subset.id] = count;
      });
    })
    ).then(() => {
      this.setState({ subsetCounts: newSubsetCounts });
    });
  }

  changeSubsetHighlighted(subsetHighlighted) {
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
    var newFilters = this.state.filters,
      newFilter = {
        count: 1,
        field: null,
        logic: null,
        value: null,
        subfilters: null
      };

    newFilters.push(newFilter);

    this.setState({ filters: newFilters });
    this.openCountFilter(newFilter);
  }

  removeFilter(index) {
    var splicedFilters = this.state.filters;
    splicedFilters.splice(index, 1);
    this.setState({ filters: splicedFilters });
  }

  openCountFilter(filter, index) {
    this.setState({ countFilterOpen: { filter, index } });
  }

  onExportClick() {
    this.setState({ exportOpen: true, url: false });
  }

  closeExportPopup() {
    this.setState({ exportOpen: false });
  }

  closeCountFilterPopup() {
    this.setState({ countFilterOpen: null });
  }

  addEditSubset(index) {
    if (index && typeof index === Number) {
    } else {
      var newSubset = {
        id: uuidv4(),
        count: null,
        name: null,
        field: null,
        logic: null,
        value: null,
        subfilters: null
      };

      this.setState({
        addEditSubsetOpen: {
          index: this.state.subsets.length,
          subset: newSubset
        }
      });
      // TODO: Add subset to Firebase.
    }
  }

  closeAddEditSubset() {
    this.setState({ addEditSubsetOpen: null });
  }

  onSubsetDone(id, keysValues) {
    // TODO: Update subset on Firebase.

    this.closeAddEditSubset();
  }

  removeSubset() {
    // TODO: Remove subset in Firebase.
  }

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
            fieldValueOptions={this.state.fieldValueOptions}
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
            addEditSubset={this.addEditSubset}
            removeSubset={this.removeSubset}
            closeAddSubset={this.closeAddEditSubset}
          />
          <SubsetEditor
            open={this.state.addEditSubsetOpen}
            onDone={this.onSubsetDone}
            onClose={this.closeAddEditSubset}
            fields={this.state.fields}
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
                onClick={this.onExportClick}
              >
                Export to CSV
              </Button>
            </div>
          </div>
        </div>
        <Export
          fields={this.state.fields}
          onExportClick={this.onExportClick}
          open={this.state.exportOpen}
          onClose={this.closeExportPopup}
          onExportConfirm={this.onExportConfirm}
          exporting={this.state.exporting}
          url={this.state.url}
        />
        <CountFilterPopup
          fields={this.state.fields}
          onFilterChange={this.onFilterChange}
          removeFilter={this.removeFilter}
          addRegularFilter={this.addRegularFilter}
          open={this.state.countFilterOpen}
          onClose={this.closeCountFilterPopup}
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
                fieldValueOptions={this.props.fieldValueOptions}
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
          {!this.props.filters.find(filter => filter.count) ? (
            <Button
              icon="insert"
              intent="warning"
              minimal={true}
              large={true}
              onClick={this.props.addCountFilter}
            >
              Add count filter
            </Button>
          ) : null}
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
    this.open = this.open.bind(this);
  }

  // I think this part is the most important.
  onRemove(event) {
    this.props.removeFilter(this.props.index);
    event.stopPropagation();
  }

  buildAndChangeFilter(change) {
    var filter = this.props.filter;
    filter[change[0]] = change[1];
    this.props.onFilterChange(this.props.index, filter);
  }

  onFieldChange(field) {
    this.buildAndChangeFilter(["field", field]);

    // If this filter doesn't have a logic value set, default it to the first
    // value in the list (because the UI shows that by default.)
    if (this.props.filter.logic === null){
        this.onLogicChange(logicOptions[field.type][0].id);
    }
  }
  onLogicChange(logic) {
    this.buildAndChangeFilter(["logic", logic]);
  }
  onValueChange(value) {
    this.buildAndChangeFilter(["value", value]);
  }

  open() {
    if (this.props.filter.count) {
      this.props.openCountFilter(this.props.filter, this.props.index);
    }
  }

  render() {
    var isCountFilter = this.props.filter.count;
    var options = [];

    if (this.props.filter.field && this.props.fieldValueOptions.hasOwnProperty(this.props.filter.field.name)){
      options = this.props.fieldValueOptions[this.props.filter.field.name];
    }

    return (
      <Tag
        large={true}
        onRemove={this.props.removeFilter ? this.onRemove : null}
        round={true}
        intent={isCountFilter ? "warning" : "primary"}
        onClick={this.open}
        interactive={isCountFilter}
      >
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
            options={options}
              onChange={this.onValueChange}
              selected={this.props.filter.value}
              field={this.props.filter.field}
              logic={this.props.filter.logic}
            />
          </span>
        ) : (
          <span>
            {isCountFilter} record(s)
            {this.props.filter.subfilters
              ? " for fields " +
                this.props.filter.subfilters
                  .map(f => (f.field ? f.field.name : "(unnamed)"))
                  .join(", ")
              : ""}
          </span>
        )}
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

  renderOption(item, itemProps) {
    return (
      <div key={item.name} onClick={itemProps.handleClick}>
        {item.name}
      </div>
    );
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
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handIeIndividualDateChange = this.handIeIndividualDateChange.bind(
      this
    );
    this.renderDates = this.renderDates.bind(this);
  }

  onChange(event) {
    var value;
   if(typeof(event) === "object") {
     value = event.target.value;
    }
    else {
     value = event;
    }
    if (["IN", "NOT IN"].indexOf(this.props.logic) !== -1) {
      value = value.split(",").map(v => v.trim());

      if (this.props.field.type === "INTEGER") {
        value = value.map(v => parseInt(v, 10));
      }
    }

    this.props.onChange(value);
  }

  handleDateChange(date) {
    this.props.onChange(date);
  }

  handIeIndividualDateChange(index, date) {
    var datePair = this.props.selected;
    if (!datePair) datePair = [];

    datePair[index] = date;
    this.handleDateChange(datePair);
  }


  renderOption(item, itemProps) {
    return (
      <div key={item} onClick={itemProps.handleClick}>
        {item}
      </div>
    );
  }

  renderInputValue(input) {
    return input;
  }

  renderDates() {
    var dateProps = {
      popoverProps: { position: Position.BOTTOM },
      shortcuts: true,
      closeOnSelection: true,
      formatDate: date => (date === null ? "" : date.toLocaleDateString()),
      parseDate: str => str ? new Date(Date.parse(str)) : new Date()
    };

    if (multiValueOperators.indexOf(this.props.logic) === -1) {
      return (
        <DateInput
          {...dateProps}
          onChange={this.handleDateChange}
          value={
            !(this.props.selected instanceof Array) && this.props.selected
              ? this.props.selected
              : new Date()
          }
        />
      );
    } else {
      var selectedIsSet =
        this.props.selected && this.props.selected instanceof Array;
      return [
        <DateInput
          key={0}
          {...dateProps}
          onChange={this.handIeIndividualDateChange.bind(this, 0)}
          value={selectedIsSet ? this.props.selected[0] : new Date()}
        />,
        <span key={1}> AND </span>,
        <DateInput
          key={2}
          {...dateProps}
          onChange={this.handIeIndividualDateChange.bind(this, 1)}
          value={selectedIsSet ? this.props.selected[1] : new Date()}
        />
      ];
    }
  }

  render() {
    return (
      <span>
        {this.props.field &&
        nonValueOperators.indexOf(this.props.logic) === -1 ? (
          this.props.options.length ? (
            <span>
        <Suggest
          items={this.props.options}
          onItemSelect={this.onChange}
          closeOnSelect={true}
          resetOnQuery={true}
          itemRenderer={this.renderOption}
          inputValueRenderer={this.renderInputValue}
          selectedItem={this.props.selected}
          inputProps={{ placeholder: "Pick a value" }}
        />
      </span>
          ) :
          this.props.field.type === "DATE" ? (
            this.renderDates()
          ) : (
            <input
              type="text"
              className="bp3-input"
              value={this.props.selected}
              onChange={this.onChange}
            />
          )
        ) : null}
      </span>
    );
  }
}

class CountFilterPopup extends React.Component {
  constructor(props) {
    super(props);
    this.onClickDone = this.onClickDone.bind(this);
    this.onSubfilterChange = this.onSubfilterChange.bind(this);
    this.removeSubfilter = this.removeSubfilter.bind(this);
    this.addSubfilter = this.addSubfilter.bind(this);
    this.onCountChange = this.onCountChange.bind(this);
  }

  onClickDone() {
    // this.props.buildFilter(this.props.subset.id);
  }

  onSubfilterChange(index, subfilter) {
    var updatedFilter = this.props.open.filter;
    updatedFilter.subfilters[index] = subfilter;
    this.props.onFilterChange(this.props.open.index, updatedFilter);
  }

  removeSubfilter(index) {
    var updatedFilter = this.props.open.filter;
    updatedFilter.subfilters.splice(index, 1);
    this.props.onFilterChange(this.props.open.index, updatedFilter);
  }

  addSubfilter() {
    var updatedFilter = this.props.open.filter;

    if (!updatedFilter.subfilters) updatedFilter.subfilters = [];

    updatedFilter.subfilters.push({
      count: null,
      field: null,
      logic: null,
      value: null,
      subfilters: null
    });
    this.props.onFilterChange(this.props.open.index, updatedFilter);
  }

  onCountChange(event) {
    var updatedFilter = this.props.open.filter;
    updatedFilter.count = parseInt(event.target.value, 10);
    this.props.onFilterChange(this.props.open.index, updatedFilter);
  }

  render() {
    return (
      <div className="CountFilterPopup">
        <Dialog
        className="CountFilterPopup_dialog"
          icon="right-join"
          onClose={this.props.onClose}
          title="Add a count filter"
          isOpen={this.props.open}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <div>
              <FormGroup
                helperText="If the number of matched records per VoterID is greater or equal to the number you enter, it will qualify"
                label="Minimum number of record matches"
                labelFor="text-input"
                labelInfo="(required)"
              >
                <InputGroup
                  id="text-input"
                  placeholder="Enter a number"
                  onChange={this.onCountChange}
                  defaultValue={
                    this.props.open ? this.props.open.filter.count : "1"
                  }
                />
              </FormGroup>

              <FormGroup
                label="Fields"
                labelFor="text-input"
                labelInfo="(required)"
              >
                {this.props.open && this.props.open.filter.subfilters
                  ? this.props.open.filter.subfilters.map((filter, i) => {
                      return (
                        <Filter
                          filter={filter}
                          fields={[
                            { name: "Election_Date", type: "DATE" },
                            { name: "Vote_Code", type: "STRING" }
                          ]}
                          // TODO fill in and hook these to show up
                          fieldValueOptions={{
                            Election_Date: [],
                            Vote_Code: [
                              "BR",
                              "EV",
                              "FW",
                              "MB",
                              "PP",
                              "PV"
                            ]
                          }
                          }
                          onFilterChange={this.onSubfilterChange}
                          removeFilter={this.removeSubfilter}
                        />
                      );
                    })
                  : null}
                <Button icon="add" onClick={this.addSubfilter}>
                  Add field
                </Button>
              </FormGroup>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button intent={Intent.PRIMARY} onClick={this.props.onClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
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
                addEdit={this.props.addEditSubset}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

class SubsetEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onClickDone = this.onClickDone.bind(this);
    this.onSubsetFilterChange = this.onSubsetFilterChange.bind(this);
    this.onSubsetTitleChange = this.onSubsetTitleChange.bind(this);
  }

  onSubsetFilterChange(index, subsetFilter) {
    this.setState({ filter: subsetFilter });
  }

  onSubsetTitleChange(event) {
    this.setState({ title: event.target.value });
  }

  onClickDone() {
    var newSubset = this.state.filter || this.props.open.subset;

    if (this.state.title) newSubset.title = this.state.title;

    this.props.onDone(this.props.open.index, newSubset);
  }

  render() {
    return (
      <div className="SubsetEditor">
        <Dialog
        className="SubsetEditor_dialog"
          icon="filter"
          onClose={this.props.onClose}
          title="Add / edit dashboard filter"
          isOpen={this.props.open}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
        >
          <div className={Classes.DIALOG_BODY}>
            {this.props.open ? (
              <div>
                <FormGroup
                  helperText="This phrase appears above the count of your filter on the main page in the results dashboard"
                  label="Title"
                  labelFor="text-input"
                  labelInfo="(required)"
                >
                  <InputGroup
                    id="text-input"
                    placeholder="Enter a phrase"
                    onChange={this.onSubsetTitleChange}
                    defaultValue={this.props.open.subset.title}
                  />
                </FormGroup>

                <FormGroup
                  label="Fields"
                  labelFor="text-input"
                  labelInfo="(required)"
                >
                  <Filter
                    filter={this.props.open.subset}
                    fields={this.props.fields}
                    onFilterChange={this.onSubsetFilterChange}
                  />
                </FormGroup>
              </div>
            ) : null}
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button intent={Intent.PRIMARY} onClick={this.onClickDone}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
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
            : "") +
          (this.props.subset.id === "new" ? " new" : "")
        }
      >
        {this.props.subset.id === "new" ? (
          <div className="Subset_body" onClick={this.props.addEdit}>
            <div className="Subset_body_count">+</div>
          </div>
        ) : (
          <div className="Subset_body" onClick={this.onClick}>
            <div className="Subset_body_label">{this.props.subset.name}</div>
            <div className="Subset_body_count">{this.props.count}</div>
          </div>
        )}
      </div>
    );
  }
}

class Export extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumns: []
    };
    this.onColumnToggle = this.onColumnToggle.bind(this);
    this.onClickforExport = this.onClickforExport.bind(this);
  }

  onColumnToggle(name) {
    var updatedSelectedColumns = this.state.selectedColumns,
      indexOfTitle = updatedSelectedColumns.indexOf(name);

    if (indexOfTitle === -1) {
      updatedSelectedColumns.push(name);
    } else {
      updatedSelectedColumns.splice(indexOfTitle, 1);
    }

    this.setState({ selectedColumns: updatedSelectedColumns });
  }

  onClickforExport() {
    this.props.onExportConfirm(this.state.selectedColumns);
  }

  render() {
    return (
      <div>
        <Dialog
          icon="export"
          onClose={this.props.onClose}
          title="Export to CSV..."
          isOpen={this.props.open}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <div>Pick which columns you would like to see in your CSV:</div>
            {this.props.fields
              ? this.props.fields.map((field, i) => {
                  return (
                    <Column
                      key={i}
                      field={field}
                      selected={
                        this.state.selectedColumns.indexOf(field.name) !== -1
                      }
                      onChange={this.onColumnToggle}
                    />
                  );
                })
              : null}
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                {this.props.url ? (
                  <AnchorButton
                    target="_blank"
                    icon="download"
                    intent="success"
                    href={this.props.url}
                  >
                    Download CSV
                  </AnchorButton>
                ) : this.props.exporting ? (
                  <Button loading={true} />
                ) : (
                  <Button
                    intent={Intent.PRIMARY}
                    disabled={this.props.exporting}
                    onClick={this.onClickforExport}
                  >
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

class Column extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.onChange(this.props.field.name);
  }

  render() {
    return (
      <div>
        <Checkbox
          checked={this.props.selected}
          label={this.props.field.name}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
