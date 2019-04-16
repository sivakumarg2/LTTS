'use strict';

function messages() {
    var logs = {};
    logs = {
        "saveWorkflowStarted": "Saving Twilio workflow is started.",
        "workflowExpressionFormed": "Twilio workflow expression is formed.",
        "workflowSavedSuccessfully": "Workflow saved successfully",
        "workflowSavingError": "Error occurred while saving workflow. The error is ",
        "sipCallReached": "Calling SIP request initiated",
        "sipCallInitiated": "Call has been initated from ",
        "toRequired": "To number is required",
        "toShouldNumber": "To should be a number",
        "fromRequired": "From number is required",
        "fromShouldNumber": "From should be a number",
        "unitIDRequired": "UnitId is required",
        "callInitiationErr": "Error occurred while initiating a call. Error: ",
        "callInitiatedSuccessfully": "Call initiated successfully. Call Sid is ",
        "updateActivityMsg": "Status made to offline as user is not active for ",
        "gotWorkerStats": "Got worker statistics from Twilio",
        "getStatistics": "Getting workers statistics from Twilio is requested",
        "gotStatistics": "Got workers statistics from Twilio.",
        "getWorkerAvailabilityReq": "Getting workers availability from Twilio is requested",
        "gotWorkerAvailabilityReq": "Got workers availability from Twilio.",
        "getWorkersStatisticsReq": "Getting workers statistics from Twilio is requested",
        "gotWorkersStatisticsReq": "Got workers statistics from Twilio.",
        "cleaningInactiveUsers": "Cleaning Inactive users started",
        "updateActivitySuccess": "Activity updated successfully for user ",
        "updateActivityStarted": "Activity updation initiated for user ",
        "createRoomStarted": "Create twilioRoom started",
        "callbackRoomCreated": "Callback room has been created",
        "callbackRoomCreation53113Error": "Callback room creation 53113 error",
        "callbackRoomCreationError": "Callback room creation error",
        "callbackRoomCreationException": "Callback room creation exception.",
        "updateActivityLogin": "Update activity for login initiated.",
        "updateActAge": "Status is Reserved and task age: "
    }

    return logs;
}
module.exports = messages();