/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
    .constant('CONST', {
        'MENU': {
            CLOSED: 0,
            HALF: 1,
            FULL: 2
        },
        'BLOCKMODE': {
            BOTH: 0,
            UPPER: 1,
            LOWER: 2
        },
        'LOWERBLOCKMODE': {
            PROPOSALS: 0,
            ATTACHMENTS: 1,
            MATERIALS: 2
        },
        'HOMEMODE': {
            ALL: 0,
            MEETINGS: 1,
            ESIGN: 2
        },
        'APPSTATE': {
            APP: "app",
            LOGIN: "app.login",
            INFO: "app.info",
            HOME: "app.home",
            OVERVIEW: "app.overview",
            MEETING: "app.meeting",
            SIGNITEM: "app.signitem",
            DOCSIGNERS: 'app.signitem.docsigners',
            MEETINGDETAILS: "app.meeting.details",
            TOPIC: "app.meeting.details.topic",
            LIST: "app.meeting.details.list",
            LISTATTACHMENT: "app.meeting.details.list.attachment",
            LISTPROPOSALS: "app.meeting.details.list.proposals",
            ERROR: "error"
        },
        'MTGROLE': {
            NONE: 0,
            CHAIRMAN: 1,
            PARTICIPANT_FULL: 2,
            DEMONSTRATOR: 3,
            SECRETARY: 4,
            PARTICIPANT_LIMITED: 5,
            TRANSLATOR: 6,
            INFORMER: 7,
            NO_ROLE: 8
        },
        'KEY': {
            TOPIC: 'topic',
            PDF_DATA: 'pdfdata',
            SELECTION_DATA: 'selectiondata'
        },
        'BTNTYPE': {
            DEFAULT: 'btn-default',
            PRIMARY: 'btn-primary',
            SUCCESS: 'btn-success'
        },
        'PUBLICITY': {
            NONE: 0,
            PUBLIC: 1,
            SECRET: 2
        },
        'MTGSTATUS': {
            RESERVED: { value: 0, stringId: 'STR_RESERVED_MEETING', badgeClass: 'label-default' },
            CREATED: { value: 1, stringId: 'STR_CREATED', badgeClass: 'label-default' },
            TECHNICALLY_OPEN: { value: 2, stringId: 'STR_TECHNICALLY_OPEN', badgeClass: 'label-default' },
            ACTIVE: { value: 3, stringId: 'STR_ACTIVE', badgeClass: 'label-warning' },
            ABORTED: { value: 4, stringId: 'STR_ABORTED', badgeClass: 'label-danger' },
            OFFICIALLY_CLOSED: { value: 5, stringId: 'STR_OFFICIALLY_CLOSED', badgeClass: 'label-success' },
            RECORDS_MOVED: { value: 6, stringId: 'STR_RECORDS_MOVED', badgeClass: 'label-success' },
            TECHNICALLY_CLOSED: { value: 5, stringId: 'STR_TECNICALLY_CLOSED', badgeClass: 'label-success' },
        },
        'TOPICSTATUS': {
            NONE: { value: 0, iconPath: "" },
            PENDING: { value: 1, iconPath: "images/state_4.png" },
            ACTIVE: { value: 2, iconPath: "images/state_4_lock.png" },
            ABORTED: { value: 3, iconPath: "images/state_4_lock_remark.png" },
            READY: { value: 4, iconPath: "images/state_4_remark.png" }
        },
        'ESIGNSTATUS': { //SignApi_DocStatuses
            UNSIGNED: { value: 1, stringId: 'STR_UNSIGNED', badgeClass: 'label-warning' },
            REJECTED: { value: 2, stringId: 'STR_REJECTED', badgeClass: 'label-danger' },
            SIGNED: { value: 4, stringId: 'STR_SIGNED', badgeClass: 'label-success' },
            RETURNED: { value: 7, stringId: 'STR_RETURNED', badgeClass: 'label-info' },
            UNDECIDED: { value: 8, stringId: 'STR_UNDECIDED', badgeClass: 'label-default' }
        },
        'ESIGNTYPE': {// SignApi_DocTypes
            POLICYMAKER: { value: 1, stringId: 'STR_SIGNING_DOC_POLICYMAKER' },
            OFFICIAL: { value: 2, stringId: 'STR_SIGNING_DOC_OFFICIAL' }
        },
        'ESIGNROLE': {
        }
    });
