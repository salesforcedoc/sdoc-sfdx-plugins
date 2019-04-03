import { Parser } from 'json2csv';
const os = require('os');
const sdocTablePrinter = require('./sdocTablePrinter');

function sdocOutput(cmd, fields, jsonResponse) {

  if (!cmd.flags.json) {

    // easier to output to csv using this vs this.ux.table
    if (cmd.flags.resultformat === 'csv') {
      const json2csvParser = new Parser(fields);
      const csv = json2csvParser.parse(jsonResponse);
      cmd.ux.log(csv);
    } else if (cmd.flags.resultformat === 'human') {
      // tablePrinter doesn't handle embedded delimiters
      const json2csvParser = new Parser(fields);
      const tableCsv = json2csvParser.parse(jsonResponse).replace(/\"/gi, '');
      const tableOpts = {
        delimiter: ',',
        eol: os.EOL
      };
      // cloned version of the json2csv TablePrinter 
      // does not work well with embedded delimiters
      // can also then update logic for setting column sizes
      // update so it writes using this.ux.log vs console.log - tbd
      (new sdocTablePrinter(tableOpts)).printCSV(tableCsv);
      //(new sdocTablePrinter(tableOpts)).printJSON(jsonResponse);
    } else {
      cmd.ux.logJson(jsonResponse)
    }
  }
}

export { sdocOutput };
