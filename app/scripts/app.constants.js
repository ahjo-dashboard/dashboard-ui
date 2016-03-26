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
        'MENUACTIVE': 'MENUACTIVE',
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
            SELECTION_DATA: 'selectiondata',
            VISIBLE_MTGS: 'visiblemeetings',
            SIGNING_RES: 'signingres',
            MEETING_ITEM: 'meetingitem'
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
            ACTIVE: { value: 3, stringId: 'STR_ACTIVE', badgeClass: 'db-label-yel' },
            ABORTED: { value: 4, stringId: 'STR_ABORTED', badgeClass: 'db-label-pur' },
            OFFICIALLY_CLOSED: { value: 5, stringId: 'STR_OFFICIALLY_CLOSED', badgeClass: 'label-success' },
            RECORDS_MOVED: { value: 6, stringId: 'STR_RECORDS_MOVED', badgeClass: 'label-success' },
            TECHNICALLY_CLOSED: { value: 5, stringId: 'STR_TECNICALLY_CLOSED', badgeClass: 'label-success' },
        },
        'TOPICSTATUS': {
            NONE: { value: 0, iconPath: "", icon_conf: "", icon_props: "", icon_conf_prop: "" },
            PENDING: { value: 1, iconPath: "images/mtgag_state_1.png", icon_conf: "images/mtgag_state_1_conf.png", icon_props: "images/mtgag_state_1_props.png", icon_conf_props: "images/mtgag_state_1_conf_props.png" },
            ACTIVE: { value: 2, iconPath: "images/mtgag_state_2.png", icon_conf: "images/mtgag_state_2_conf.png", icon_props: "images/mtgag_state_2_props.png", icon_conf_props: "images/mtgag_state_2_conf_props.png" },
            ABORTED: { value: 3, iconPath: "images/mtgag_state_3.png", icon_conf: "images/mtgag_state_3_conf.png", icon_props: "images/mtgag_state_3_props.png", icon_conf_props: "images/mtgag_state_3_conf_props.png" },
            READY: { value: 4, iconPath: "images/mtgag_state_4.png", icon_conf: "images/mtgag_state_4_conf.png", icon_props: "images/mtgag_state_4_props.png", icon_conf_props: "images/mtgag_state_4_conf_props.png" }
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
            CM: { value: 1, stringId: 'STR_SROLE_CM' },
            SEC: { value: 2, stringId: 'STR_SROLE_SEC' },
            REV: { value: 3, stringId: 'STR_SROLE_REV' },
            REV_BAK: { value: 4, stringId: 'STR_SROLE_REV_BAK' },
            DISPW: { value: 5, stringId: 'STR_SROLE_DISPW' },
            DMAKER: { value: 6, stringId: 'STR_SROLE_DMAKER' },
            IREV_CONF: { value: 7, stringId: 'STR_SROLE_IREV_CONF' },
            IREV: { value: 8, stringId: 'STR_SROLE_IREV' },
            CONF: { value: 9, stringId: 'STR_SROLE_CONF' }
        }
    });
