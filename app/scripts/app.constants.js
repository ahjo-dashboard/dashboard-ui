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
        'CONFIRMACTIVE': 'CONFIRMACTIVE',
        'PROPOSALEVENT': 'PROPOSALEVENT',
        'PROPOSALSHASUNSAVED': 'PROPOSALSHASUNSAVED',
        'REMARKISUNSAVED': 'REMARKISUNSAVED',
        'PROPOSALDELETED': 'PROPOSALDELETED',
        'POLLINGTIMEOUT' : 10000,
        'NOTFOUND' : -1,
        'BLOCKMODE': {
            BOTH: 0,
            UPPER: 1,
            LOWER: 2
        },
        'LOWERBLOCKMODE': {
            PROPOSALS: 'PROPOSALS',
            ATTACHMENTS: 'ATTACHMENTS',
            MATERIALS: 'MATERIALS',
            REMARK: 'REMARK'
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
            SIGNLISTATT: 'app.signitem.signattlist',
            MEETINGDETAILS: "app.meeting.details",
            TOPIC: "app.meeting.details.topic",
            LIST: "app.meeting.details.list",
            LISTATTACHMENT: "app.meeting.details.list.attachment",
            LISTPROPOSALS: "app.meeting.details.list.proposals",
            REMARK: "app.meeting.details.list.remark",
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
            MEETING_ITEM: 'meetingitem',
            PROPOSAL_EVENT_ARRAY: 'proposaleventarray',
            VALUE: 'value'
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
            RESERVED: { value: 0, stringId: 'STR_RESERVED_MEETING', badgeClass: 'db-badge-dark' },
            CREATED: { value: 1, stringId: 'STR_CREATED', badgeClass: 'db-badge-dark' },
            TECHNICALLY_OPEN: { value: 2, stringId: 'STR_TECHNICALLY_OPEN', badgeClass: 'db-badge-dark' },
            ACTIVE: { value: 3, stringId: 'STR_ACTIVE', badgeClass: 'db-badge-yel' },
            ABORTED: { value: 4, stringId: 'STR_ABORTED', badgeClass: 'db-badge-pur' },
            OFFICIALLY_CLOSED: { value: 5, stringId: 'STR_OFFICIALLY_CLOSED', badgeClass: 'db-badge-gre' },
            RECORDS_MOVED: { value: 6, stringId: 'STR_RECORDS_MOVED', badgeClass: 'db-badge-gre' },
            TECHNICALLY_CLOSED: { value: 7, stringId: 'STR_TECNICALLY_CLOSED', badgeClass: 'db-badge-gre' },
        },
        'MTGEVENT': {
            LASTEVENTID: 'LastEventId',
            REMARKPUBLISHED: 'RemarkPublishedEvent',
            REMARKUPDATED: 'PublishRemarkUpdateEvent',
            REMARKDELETED: 'RemarkDeletedEvent',
            MEETINGSTATECHANGED: 'MeetingStateChangedEvent',
            TOPICSTATECHANGED: 'TopicStateChangedEvent'
        },
        'TOPICSTATUS': {
            NONE: { value: 0, iconPath: "", icon_conf: "", icon_props: "", icon_conf_prop: "", stringId: '' },
            PENDING: { value: 1, iconPath: "images/mtg-states/mtg-ag-state-1.png", stringId: 'STR_TOPIC_STATUS_PENDING' },
            ACTIVE: { value: 2, iconPath: "images/mtg-states/mtg-ag-state-2.png", stringId: 'STR_TOPIC_STATUS_ACTIVE' },
            ABORTED: { value: 3, iconPath: "images/mtg-states/mtg-ag-state-3.png", stringId: 'STR_TOPIC_STATUS_ABORTED' },
            READY: { value: 4, iconPath: "images/mtg-states/mtg-ag-state-4.png", stringId: 'STR_TOPIC_STATUS_READY' }
        },
        'ESIGNSTATUS': { //SignApi_DocStatuses
            UNSIGNED: { value: 1, stringId: 'STR_UNSIGNED', badgeClass: 'db-badge-ora' },
            REJECTED: { value: 2, stringId: 'STR_REJECTED', badgeClass: 'db-badge-red' },
            SIGNED: { value: 4, stringId: 'STR_SIGNED', badgeClass: 'db-badge-gre' },
            RETURNED: { value: 7, stringId: 'STR_RETURNED', badgeClass: 'db-badge-red' },
            UNDECIDED: { value: 8, stringId: 'STR_UNDECIDED', badgeClass: 'db-badge-dark' }
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
