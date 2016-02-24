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
        RESERVED: { value: 0, stringID: 'STR_RESERVED_MEETING' },
        CREATED: { value: 1, stringID: 'STR_CREATED' },
        TECHNICALLY_OPEN: { value: 2, stringID: 'STR_TECHNICALLY_OPEN' },
        ACTIVE: { value: 3, stringID: 'STR_ACTIVE' },
        ABORTED: { value: 4, stringID: 'STR_ABORTED' },
        OFFICIALLY_CLOSED: { value: 5, stringID: 'STR_OFFICIALLY_CLOSED' },
        RECORDS_MOVED: { value: 6, stringID: 'STR_RECORDS_MOVED' },
        TECHNICALLY_CLOSED: { value: 5, stringID: 'STR_TECNICALLY_CLOSED' },
    }
)
.constant(
    'TOPICSTATUS', {
        NONE : 0,
        PENDING : 1,
        ACTIVE : 2,
        ABORTED : 3,
        READY : 4
    }
);
