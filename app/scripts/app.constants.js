/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
.constant(
    'DEVICE', {
        MOBILE: 1,
        DESKTOP: 2
    }
)
.constant(
    'MENU', {
        CLOSED: 0,
        HALF: 1,
        FULL: 2
    }
)
.constant(
    'BLOCKMODE', {
        BOTH : 0,
        UPPER : 1,
        LOWER : 2
    }
)
.constant(
    'HOMEMODE', {
        ALL : 0,
        MEETINGS : 1,
        ESIGN : 2
    }
)
.constant(
    'APPSTATE', {
        APP: "app",
        LOGIN: "app.login",
        INFO: "app.info",
        HOME: "app.home",
        OVERVIEW: "app.overview",
        MEETING: "app.meeting",
        SIGNITEM: "app.signitem"
    }
)
.constant(
    'MTGROLE', {
        NONE: 0,
        CHAIRMAN: 1,
        PARTICIPANT_FULL: 2,
        DEMONSTRATOR: 3,
        SECRETARY: 4,
        PARTICIPANT_LIMITED: 5,
        TRANSLATOR: 6,
        INFORMER: 7,
        NO_ROLE: 8
    }
)
.constant(
    'KEY', {
        TOPIC: 'topic'
    }
)
.constant(
    'PUBLICITY', {
        NONE: 0,
        PUBLIC: 1,
        SECRET: 2
    }
)
.constant(
    'MTGSTATUS', {
        RESERVED: { value: 0, stringId: 'STR_RESERVED_MEETING' },
        CREATED: { value: 1, stringId: 'STR_CREATED' },
        TECHNICALLY_OPEN: { value: 2, stringId: 'STR_TECHNICALLY_OPEN' },
        ACTIVE: { value: 3, stringId: 'STR_ACTIVE' },
        ABORTED: { value: 4, stringId: 'STR_ABORTED' },
        OFFICIALLY_CLOSED: { value: 5, stringId: 'STR_OFFICIALLY_CLOSED' },
        RECORDS_MOVED: { value: 6, stringId: 'STR_RECORDS_MOVED' },
        TECHNICALLY_CLOSED: { value: 5, stringId: 'STR_TECNICALLY_CLOSED' },
    }
)
.constant(
    'TOPICSTATUS', {
        NONE : { value: 0, iconPath: ""},
        PENDING : { value: 1, iconPath: "images/state_4.png"},
        ACTIVE : { value: 2, iconPath: "images/state_4_lock.png"},
        ABORTED : { value: 3, iconPath: "images/state_4_lock_remark.png"},
        READY : { value: 4, iconPath: "images/state_4_remark.png"}
    }
)
.constant(
    'ESIGNSTATUS', { //SignApi_DocStatuses
        UNSIGNED: { value: 1, stringId: 'STR_UNSIGNED'},
        REJECTED: { value: 2, stringId: 'STR_REJECTED'},
        SIGNED: { value: 4, stringId: 'STR_SIGNED'},
        RETURNED: { value: 7, stringId: 'STR_RETURNED'},
        UNDECIDED: { value: 8, stringId: 'STR_UNDECIDED'}
    }
)
.constant(
    'ESIGNTYPE', {// SignApi_DocTypes
        POLICYMAKER: { value: 1, stringId: 'STR_SIGNING_DOC_POLICYMAKER'},
        OFFICIAL: { value: 2, stringId: 'STR_SIGNING_DOC_OFFICIAL'}
    }
);
