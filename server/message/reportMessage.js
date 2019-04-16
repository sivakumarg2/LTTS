'use strict';

function messages() {
    var logs = {};
    logs = {
        "getWorkersStatsStarted": "Getting workers statistics is initiated",
        "gotWorkersFromDBForCountry": "Retrieved list of workers from DB",
        "reqWorkerStatsTwilio": "Request has been sent to Twilio for workers stats",
        "gotWorkerStatsTwilio": "Got workers stats from Twilio"
    }

    return logs;
}
module.exports = messages();