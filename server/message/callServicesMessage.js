'use strict';

function callServicesMessage() {
    var logs = {};
    logs = {
        "insertCallDetailsStarted": "Inserting into Calldetails/incidents started. ",
        "insertCallDetailsSuccess": "Inserting into Calldetails/incidents success. ",
        "updateCallUserActivityStarted": "Updating call status & Agent activity started. ",
        "noCallIncidentsIdFound": "No callIncidentsId Found. UniqueId: ",
        "noCallDetailsIdFound": "No callDetailsId Found. UniqueId: ",
        "saveCallDispoStarted": "Save Call disposition started. ",
        "saveCallDispoDBStarted": "Save Call disposition to DB started. "
    }

    return logs;
}
module.exports = callServicesMessage();