'use strict';

function messages() {
    var logs = {};
    logs = {
        "loginStarted": "Login validation initiated.",
        "loginChangePassword": "Login validation for change password initiated",
        "loginChangePasswordForLink": "Change Password for reset/new user link",
        "gotChangePasswordResult": "Returned from Change password database call",
        "changePasswordError": "Change password returned error",
        "processLoginRes": "Data returned from database. Processing the result initiated",
        "unSuccessLogin": "Login is failed",
        "successLoginResult": "Login is successful",
        "loggedAgent": "Logged In as Agent/Supervisor",
        "loggedAdmin": "Logged In as Admin",
        "getUserToken": "Geting Twilio worker Token initiated",
        "identiTokInitiated": "Getting Twilio Identity token initiated",
        "gotIdentiToken": "Got Identity Token",
        "workerTokInitiated": "Getting worker token initiated",
        "gotWorkerToken": "Twilio worker token received",
        "getJSONToken": "Getting JSON token initiated",
        "gotJSONToken": "Got JSON token",
        "updateActStart": "Updating worker activity/status to Twilio initiated",
        "updateActSuccess": "Twilio worker status(activity) is updated successfully. Result is sending back to client",
        "updateActFail": "Updating Twilio worker status(activity) is failed",
        "sendingBackRes": "Sending result back to client"
    }

    return logs;
}
module.exports = messages();