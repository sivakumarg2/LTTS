//// Service Name: exportReportService
//// Description: This service has methods to export data to XL.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function ServiceImplementation() {

    var exportToExcel = function (exportData, filename, opts) {

      var wb = new Workbook();
      var worksheet = prepareSheetDataFor(exportData);
      /* add worksheet to workbook */
      wb.SheetNames.push(filename);
      wb.Sheets[filename] = worksheet;
      var wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
      };
      /* Workbook out */
      var wbout = XLSX.write(wb, wopts);
      saveAs(new Blob([s2AbConversion(wbout)], {
        type: "application/octet-stream"
      }), filename + '.xlsx');

    };

    /* Routine to convert to proper date format for excel sheet */
    //TODO Need to work on this
    function datenum(v, date1904) {
      if (date1904) v += 1462;
      var epoch = Date.parse(v);
      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    /* Routine to prepare XL sheet data for 1 sheet */
    function prepareSheetDataFor(data, opts) {
      var worksheet = {};

      var range = {
        s: {
          c: 10000000,
          r: 10000000
        },
        e: {
          c: 0,
          r: 0
        }
      };

      for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {

          if (range.s.r > R) range.s.r = R;
          if (range.s.c > C) range.s.c = C;
          if (range.e.r < R) range.e.r = R;
          if (range.e.c < C) range.e.c = C;

          var cell = {
            v: data[R][C]
          };

          if (cell.v == null || cell.v == undefined) {
            cell.v = " ";
          }
          // Get the cell reference using XLSX utils by giving column and row index
          var cell_ref = XLSX.utils.encode_cell({
            c: C,
            r: R
          });

          // cell.v reprents value to write
          //cell.t reprents type of value
          if (typeof cell.v === 'number') {
            cell.t = 'n';
          } else if (typeof cell.v === 'boolean') {
            cell.t = 'b';
          } else if (cell.v instanceof Date) {
            cell.t = 'n';
            cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          } else {
            cell.t = 's';
          }

          //Adding the cell value into worksheet cell
          worksheet[cell_ref] = cell;
        }
      }

      if (range.s.c < 10000000) {
        worksheet['!ref'] = XLSX.utils.encode_range(range);
      }
      return worksheet;
    }

    /* Constructor function to create an instance of XL-Workbook */
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }

    /* conversion from Uniform Office Format Spreadsheet to array buffer */
    function s2AbConversion(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    return { exportToExcel: exportToExcel };
  }

  angular.module("CCApp").service("exportReportService", ServiceImplementation);

})();
