/**
 * resetCurrentProject() - Resets the current project on the backend.
 */
export const resetCurrentProject = async () => {
  const payload = {
    operationName: "ResetCurrentProject",
    variables: {},
    query:
      "mutation ResetCurrentProject {\n  resetCurrentProject\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * listTableDetails() - Default fetch for non-sample databases.
 */
export const listTableDetails = async () => {
  const payload = {
    operationName: "ListDataSourceTables",
    variables: {},
    query:
      "query ListDataSourceTables {\n  listDataSourceTables {\n    name\n    columns {\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};
/**
 * listSampleTables() - Fetches tables from your Neon sample DB.
 * (Uses the same query as listTableDetails because the backend does not accept a "data" argument.)
 */
export const listSampleTables = async () => {
  const payload = {
    operationName: "ListDataSourceTables",
    variables: {},
    query:
      "query ListDataSourceTables {\n  listDataSourceTables {\n    name\n    columns {\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

/**
 * saveSelectedTables() - (Not used in sample branch)
 */
export const saveSelectedTables = async (selectedTables: string[]) => {
  const payload = {
    operationName: "SaveTables",
    variables: {
      data: {
        tables: selectedTables,
      },
    },
    query:
      "mutation SaveTables($data: SaveTablesInput!) {\n  saveTables(data: $data)\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};
/**
 * previewTableData() - Fetches a data preview for a particular table.
 * This version nests the table name in a "data" object.
 */
/**
 * previewTableData() - Fetches data preview (all rows) for a particular table.
 * If the query is not supported by the backend, it returns a mock preview.
 */
/**
 * previewTableData() - Fetches data preview (all rows) for a particular table.
 * This function now checks the response status and logs any error messages.
 */
/**
 * previewTableData() - Fetches data preview (all rows) for a particular table.
 * If the backend does not support the query, it falls back to mock data.
 */
/**
 * previewTableData() - Fetches data preview (all rows) for a particular table.
 * If the backend does not support the query field (e.g. previewTableData),
 * this function falls back to returning mock preview data.
 */
export const previewTableData = async (tableName: string) => {
  const payload = {
    operationName: "PreviewTableData",
    variables: { tableName },
    query:
      "query PreviewTableData($tableName: String!) { previewTableData(tableName: $tableName) { columns { name type } rows } }",
  };

  console.log("Sending payload:", payload);

  try {
    const response = await fetch("http://localhost:5000/api/codesmell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    // If the returned data has errors indicating the field isn't supported, use fallback data.
    if (data.errors && data.errors.length > 0) {
      const fieldNotSupported = data.errors.some((err: any) =>
        err.message.includes('Cannot query field "previewTableData"')
      );
      if (fieldNotSupported) {
        console.warn("previewTableData not supported; returning fallback data.");
        return {
          data: {
            previewTableData: {
              columns: [
                { name: "sample_text", type: "TEXT" },
                { name: "sample_number", type: "INTEGER" },
              ],
              rows: [
                { sample_text: "Example row 1", sample_number: 100 },
                { sample_text: "Example row 2", sample_number: 200 },
              ],
            },
          },
        };
      }
    }
    return data;
  } catch (error) {
    console.error("Error in previewTableData:", error);
    throw error;
  }
};






/**
 * fetchTableData() - Fetches a data preview for a particular table.
 */



/**
 * previewDataAPI() - Fetches a preview of table data for a given responseId.
 * This function sends a POST request using the PreviewData mutation.
 */
export const previewDataAPI = async (responseId: number) => {
  const payload = {
    operationName: "PreviewData",
    variables: { where: { responseId } },
    query:
      "mutation PreviewData($where: PreviewDataInput!) {\n  previewData(where: $where)\n}",
  };

  const response = await fetch("http://localhost:5000/api/codesmell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

  
  /**
   * createAskingTaskAPI()
   * Sends a POST request with the CreateAskingTask mutation.
   */
// src/api/tables.ts

/**
 * createAskingTaskAPI()
 * Sends a POST request with the CreateAskingTask mutation.
 * Now, it only sends the "question" and "threadId" properties.
 */
export const createAskingTaskAPI = async (threadId: number, question: string) => {
    const payload = {
      operationName: "CreateAskingTask",
      variables: {
        data: {
          question,  // Only send question
          threadId,  // and threadId
        },
      },
      query:
        "mutation CreateAskingTask($data: AskingTaskInput!) {\n  createAskingTask(data: $data) {\n    id\n    __typename\n  }\n}",
    };
  
    const response = await fetch("http://localhost:5000/api/codesmell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  };
  
  /**
   * getTaskDetailsAPI()
   * Sends a POST request with the AskingTask query.
   */
  export const getTaskDetailsAPI = async (taskId: string) => {
    const payload = {
      operationName: "AskingTask",
      variables: { taskId },
      query:
        "query AskingTask($taskId: String!) {\n  askingTask(taskId: $taskId) {\n    status\n    type\n    candidates {\n      sql\n      type\n      view {\n        id\n        name\n        statement\n        displayName\n        __typename\n      }\n      __typename\n    }\n    error {\n      code\n      shortMessage\n      message\n      stacktrace\n      __typename\n    }\n    intentReasoning\n    __typename\n  }\n}",
    };
  
    const response = await fetch("http://localhost:5000/api/codesmell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  };
  