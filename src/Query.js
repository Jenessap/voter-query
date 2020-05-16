import { tableId, joinTableId, projectId, datasetId } from "./Google";

var Query = {
  // Helper function to add quote to "value"s.
  addQuotes: function(value) {
    if (typeof value === "string") {
      return '"' + value + '"';
    }
    return value;
  },
  // Helper function to add quotes to each value and put the whole list in ().
  serializeValue: function(value) {
    if (value instanceof Date) {
      // DATE('2016-01-01')
      return `DATE(\'${value}\')`;
    } else if (typeof value === "object") {
      return "(" + value.map(Query.addQuotes).join(",") + ")";
    } else if (typeof value === "string") {
      return Query.addQuotes(value);
    }
    return value;
  },
  // Helper:Creates a complete Where clause from an object's attributes(logic, name, and value)
  serializeWhereClause: function(f) {
    return [
      "(",
      f.field.name,
      f.logic,
      Query.serializeValue(f.value),
      ")"
    ].join(" ");
  },
  // Creates the "clauses" object that stores all the needed bits of a query string
  // EXCEPT SUBSET INFORMATION!!!!.
  prepareSQLClauses: function(filters, columns, joinFilter) {
    // This object will later be used to populate a string SQL query.
    var clauses = {
      select: [],
      from: null,
      join: null,
      where: [],
      limit: [],
      unserializedWhere: [],
      joinWhere: [],
      count: null
    };
    clauses.select = columns;
    clauses.from = `\`${projectId}.${datasetId}.${tableId}\``;
    clauses.join = `\`${projectId}.${datasetId}.${joinTableId}\``;

    // Populate the WHERE clause in clausesForSQL.
    var newWhere = filters.map(Query.serializeWhereClause);
    clauses.unserializedWhere = newWhere;
    clauses.where = newWhere.join(" AND ");

    if (joinFilter) {
      // Populate the  join Where clause.
      var newJoinWhere = joinFilter.subfilters.map(Query.serializeWhereClause);
      clauses.count = joinFilter.count;
      clauses.joinWhere = newJoinWhere;
      clauses.joinWhere = newJoinWhere.join(" AND ");
    }

    return clauses;
  },
  // Function builds Where clause for any non-count subset
  buildSubsetWhereClause: function(subsets, chosenSubsetID, clauses) {
    var whereArr = clauses.unserializedWhere;
    if (chosenSubsetID !== "all") {
      var chosenSubset = subsets.find(subset => subset.id === chosenSubsetID);
      whereArr = whereArr.concat([Query.serializeWhereClause(chosenSubset)]);
    }
    return whereArr.length ? whereArr.join(" AND ") : "true";
  },
  // Helper function: Constructs complete query including count, but only for cases with exactly one count variable
  constructCountQuery: function(
    subsets,
    chosenSubsetID,
    clauses,
    count = false
  ) {
    return `WITH countClause AS 
    (SELECT VoterID, 
      COUNT(voterID) as numberOf 
      FROM ${clauses.join}
      WHERE ${clauses.joinWhere} 
      GROUP BY VoterID HAVING numberOf >= ${clauses.count})
    SELECT ${count ? "COUNT(*)" : clauses.select}
    FROM ${clauses.from}
    INNER JOIN CountClause USING(VoterID)
    WHERE ${Query.buildSubsetWhereClause(subsets, chosenSubsetID, clauses)};`;
  },
  // Function constructs subset count information to go in the dashboard
  constructQueryForSubsetCount: function(subsets, chosenSubsetID, clauses) {
    // If we're looking for a summary (count) on a pivot table.
    if (clauses.count) {
      return Query.constructCountQuery(subsets, chosenSubsetID, clauses, true);
    }
    // Otherwise, we're looking for a summary (count) on a simple query.
    return `SELECT COUNT(*) 
    FROM ${clauses.from}
    WHERE ${Query.buildSubsetWhereClause(subsets, chosenSubsetID, clauses)};`;
  },
  // Function constructs (rignt now only simple) query for export to csv.
  constructQueryForExport: function(subsets, chosenSubsetID, clauses) {
    // If we're looking for a bunch of records from a pivot table.
    if (clauses.count) {
      return Query.constructCountQuery(subsets, chosenSubsetID, clauses, false);
    }
    // Otherwise, we're looking for a records from a simple query.
    return `SELECT ${clauses.select} 
    FROM ${clauses.from} 
    WHERE ${Query.buildSubsetWhereClause(subsets, chosenSubsetID, clauses)};`;
  }
};

module.exports = Query;
