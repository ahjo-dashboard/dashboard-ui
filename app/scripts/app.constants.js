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
        'PROPOSALEVENT': 'PROPOSALEVENT',
        'PROPOSALSHASUNSAVED': 'PROPOSALSHASUNSAVED',
        'REMARKISUNSAVED': 'REMARKISUNSAVED',
        'PROPOSALDELETED': 'PROPOSALDELETED',
        'TOPICMINUTEUPDATED': 'TOPICMINUTEUPDATED',
        'VOTINGUPDATED': 'VOTINGUPDATED',
        'VOTESINSERTED': 'VOTESINSERTED',
        'UNSAVEMEETINGDDATA': 'UNSAVEMEETINGDDATA',
        'MTGUICHANGED': 'MTGUICHANGED',
        'GETMOTIONS': 'GETMOTIONS',
        'POLLINGTIMEOUT': 10000,
        'PROGRESSDLGMINDURATIONMS': 900,
        'MOTIONDATA': { loading: false, failure: false, objects: [] },
        'NOTFOUND': -1,
        'DBLANG': {
            FI: { langCode: 'fi', flagIconPath: 'images/flag-fi.svg' },
            SV: { langCode: 'sv', flagIconPath: 'images/flag-sv.svg' },
        },
        'HTTPSTATUS': {
            K200: { value: 200, strId: null }
        },
        'MTGAPICODES': {
            K1001: { value: 1001, strId: 'STR_REST_RES_1001' },
            K1002: { value: 1002, strId: 'STR_REST_RES_1002' },
            K1003: { value: 1003, strId: 'STR_REST_RES_1003' },
            K1004: { value: 1004, strId: 'STR_REST_RES_1004' },
            K1005: { value: 1005, strId: 'STR_REST_RES_1005' },
            K1007: { value: 1007, strId: 'STR_REST_RES_1007' },
            K1008: { value: 1008, strId: 'STR_REST_RES_1008' },
            K1009: { value: 1008, strId: 'STR_REST_RES_1008' },
            K1010: { value: 1008, strId: 'STR_REST_RES_1008' }
        },
        'GENERALERROR': { 'errorCode': -1 },
        'ID': 'id',
        'BLOCKMODE': {
            DEFAULT: 0,
            PRIMARY: 1,
            SECONDARY: 2
        },
        'PRIMARYMODE': {
            DEFAULT: 'DEFAULT',
            SECRET: 'SECRET',
            HIDDEN: 'HIDDEN'
        },
        'SECONDARYMODE': {
            PROPOSALS: 'PROPOSALS',
            ATTACHMENTS: 'ATTACHMENTS',
            MATERIALS: 'MATERIALS',
            REMARK: 'REMARK',
            SECRET: 'SECRET',
            DECISIONS: 'DECISIONS',
            MOTIONS: 'MOTIONS'
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
            SIGN: "app.sign",
            DOCSIGNERS: 'app.sign.docsigners',
            SIGNLISTATT: 'app.sign.signattlist',
            MEETINGDETAILS: "app.meeting.details",
            TOPIC: "app.meeting.details.topic",
            LISTPROPOSALS: "app.meeting.details.list.proposals",
            REMARK: "app.meeting.details.list.remark",
            ERROR: "error"
        },
        'MTGROLE': {
            CHAIRMAN: { value: 1, strId: 'STR_MTG_ROLE_1' },
            PARTICIPANT_FULL: { value: 2, strId: 'STR_MTG_ROLE_2' },
            DEMONSTRATOR: { value: 3, strId: 'STR_MTG_ROLE_3' },
            SECRETARY: { value: 4, strId: 'STR_MTG_ROLE_4' },
            PARTICIPANT_LIMITED: { value: 5, strId: 'STR_MTG_ROLE_5' },
            TRANSLATOR: { value: 6, strId: 'STR_MTG_ROLE_6' },
            INFORMER: { value: 7, strId: 'STR_MTG_ROLE_7' },
            NO_ROLE: { value: 8, strId: 'STR_MTG_ROLE_8' }
        },
        'MTGTYPE': {
            DEFAULT: 0,
            CITY_COUNCIL: 1
        },
        'KEY': {
            TESTENV_USERID: 'testenvuserid',
            TOPIC: 'topic',
            LIST_ATT: 'listattdata',
            SELECTION_DATA: 'selectiondata',
            VISIBLE_MTGS: 'visiblemeetings',
            SIGNING_RES: 'signingres',
            MEETING_ITEM: 'meetingitem',
            PROPOSAL_EVENT_ARRAY: 'proposaleventarray',
            MOTION_DATA: 'motionarray',
            SIGN_ITEM: 'signitem',
            VALUE: 'value',
            STATE_ID: 'stateId'
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
            //RESERVED: { stateId: 0, stringId: 'STR_RESERVED_MEETING', badgeClass: 'db-badge-dark', visibleInHelp: true },
            CREATED: { stateId: 1, stringId: 'STR_CREATED', stringText: 'STR_CREATED_TEXT', badgeClass: 'db-badge-dark', visibleInHelp: true },
            TECHNICALLY_OPEN: { stateId: 2, stringId: 'STR_TECHNICALLY_OPEN', stringText: 'STR_TECHNICALLY_OPEN_TEXT', badgeClass: 'db-badge-yel', visibleInHelp: true },
            ACTIVE: { stateId: 3, stringId: 'STR_ACTIVE', stringText: 'STR_ACTIVE_TEXT', badgeClass: 'db-badge-gre', visibleInHelp: true },
            ABORTED: { stateId: 4, stringId: 'STR_ABORTED', stringText: 'STR_ABORTED_TEXT', badgeClass: 'db-badge-pur', visibleInHelp: true },
            OFFICIALLY_CLOSED: { stateId: 5, stringId: 'STR_OFFICIALLY_CLOSED', stringText: 'STR_OFFICIALLY_CLOSED_TEXT', badgeClass: 'db-badge-gra', visibleInHelp: true },
            RECORDS_MOVED: { stateId: 6, stringId: 'STR_RECORDS_MOVED', stringText: 'STR_RECORDS_MOVED_TEXT', badgeClass: 'db-badge-gra', visibleInHelp: false },
            TECHNICALLY_CLOSED: { stateId: 7, stringId: 'STR_TECNICALLY_CLOSED', stringText: 'STR_TECNICALLY_CLOSED_TEXT', badgeClass: 'db-badge-gra', visibleInHelp: true },
        },
        'MEETINGSTATUSACTIONS': {
            OPEN: { stateId: 3, stringId: 'STR_OPEN', active: [2], actionId: 3 },
            ABORT: { stateId: 4, stringId: 'STR_ABORT', active: [3], actionId: 4 },
            CONTINUE: { stateId: 3, stringId: 'STR_CONTINUE', active: [4], actionId: 8 },
            CLOSE: { stateId: 5, stringId: 'STR_READY', active: [3], actionId: 5 }
        },
        'MTGEVENT': {
            LASTEVENTID: 'LastEventId',
            REMARKPUBLISHED: 'RemarkPublishedEvent',
            REMARKUNPUBLISHED: 'RemarkUnPublishedEvent',
            REMARKUPDATED: 'PublishRemarkUpdateEvent',
            REMARKDELETED: 'RemarkDeletedEvent',
            MEETINGSTATECHANGED: 'MeetingStateChangedEvent',
            TOPICSTATECHANGED: 'TopicStateChangedEvent',
            TOPICEDITED: 'TopicEditedEvent',
            LOGGEDOUT: 'PersonLoggedOutEvent',
            MINUTEUPDATED: 'MinuteEntryUpdateEvent',
            MINUTEDELETED: 'MinuteEntryDeletedEvent',
            MINUTETYPECHANGED: 'MinuteEntryUpdateTypeChangedEvent',
            VOTINGUPDATED: 'VotingUpdatedEvent',
            VOTESINSERTED: 'VotesInsertedEvent',
            MOTIONSUPPORTED: 'MotionSupportedEvent',
            MOTIONSUPPORTREMOVED: 'MotionSupportRemovedEvent',
            MOTIONPUBLISHED: 'MotionPublishedEvent',
            MOTIONUNPUBLISHED: 'MotionUnpublishedEvent',
            MOTIONDELETED: 'MotionDeletedEvent',
            MOTIONSUBMIT: 'MotionSubmitEvent',
            AGENDAUPDATED: 'AgendaUpdatedEvent'
        },
        'TOPICSTATUS': {
            PENDING: { stateId: 1, iconPath: "images/mtg-states/mtg-ag-state-1.png", stringId: 'STR_TOPIC_STATUS_PENDING' },
            ACTIVE: { stateId: 2, iconPath: "images/mtg-states/mtg-ag-state-2.png", stringId: 'STR_TOPIC_STATUS_ACTIVE' },
            ABORTED: { stateId: 3, iconPath: "images/mtg-states/mtg-ag-state-3.png", stringId: 'STR_TOPIC_STATUS_ABORTED' },
            READY: { stateId: 4, iconPath: "images/mtg-states/mtg-ag-state-4.png", stringId: 'STR_TOPIC_STATUS_READY' }
        },
        'TOPICSTATUSACTIONS': {
            OPEN: { stringId: 'STR_OPEN', active: [1, 4], hidden: [], actionId: 2 },
            ABORT: { stringId: 'STR_ABORT', active: [2], hidden: [], actionId: 3 },
            CONTINUE: { stringId: 'STR_CONTINUE', active: [3], hidden: [], actionId: 8 },
            CLOSE: { stringId: 'STR_READY', active: [2], hidden: [], actionId: 4 }
        },
        'MTGVOTING': {
            YEA: { id: 1, stringId: 'STR_VOTE_YEA' },
            NAY: { id: 2, stringId: 'STR_VOTE_NAY' },
            EMPTY: { id: 3, stringId: 'STR_VOTE_EMPTY' },
            ABSENT: { id: 4, stringId: 'STR_VOTE_ABSENT' }
        },
        'MOTIONTYPES': {
            'DEFAULT': { id: 0, stringId: 'STR_GROUP_MOTION' },
            'MOTION': { id: 1, stringId: 'STR_MOTION' },
            'BUDGET': { id: 2, stringId: 'STR_BUDGET_MOTION' }
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
            OFFICIAL: { value: 2, stringId: 'STR_SIGNING_DOC_OFFICIAL' },
            POLICYMAKER_MAJOR: { value: 3, stringId: 'STR_SIGNING_DOC_POLICYMAKER_MAJOR' }
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
    })
    .factory('PROPS', function (CONST) {
        return {
            'PUBLISHED': {
                NO: 0,
                YES: 1
            },
            'TYPE': [
                { value: 1, strId: "STR_PROPOSAL_TYPE_1", roles: [] },
                { value: 2, strId: "STR_PROPOSAL_TYPE_2", roles: [], cityCouncilRoles: [], decisionOrder: 1, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 3, strId: "STR_PROPOSAL_TYPE_3", roles: [CONST.MTGROLE.PARTICIPANT_FULL.value], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], decisionOrder: 3, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 4, strId: "STR_PROPOSAL_TYPE_4", roles: [CONST.MTGROLE.PARTICIPANT_FULL.value], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], decisionOrder: 4, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 5, strId: "STR_PROPOSAL_TYPE_5", roles: [CONST.MTGROLE.PARTICIPANT_FULL.value], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], decisionOrder: 5, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 6, strId: "STR_PROPOSAL_TYPE_6", roles: [CONST.MTGROLE.PARTICIPANT_FULL.value], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], decisionOrder: 6, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 7, strId: "STR_PROPOSAL_TYPE_7", roles: [], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], decisionOrder: 7, mgtTypes: [CONST.MTGTYPE.CITYCOUNCIL] },
                { value: 8, strId: "STR_PROPOSAL_TYPE_8", roles: [CONST.MTGROLE.PARTICIPANT_FULL.value], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL.value], mgtTypes: [] },
                { value: 9, strId: "STR_PROPOSAL_TYPE_9", roles: [], cityCouncilRoles: [], mgtTypes: [] },
                { value: 10, strId: "STR_PROPOSAL_TYPE_10", roles: [], cityCouncilRoles: [], decisionOrder: 2, mgtTypes: [CONST.MTGTYPE.DEFAULT, CONST.MTGTYPE.CITYCOUNCIL] }
            ],
            'TOGGLE': 'PROPS.TOGGLE',
            'COUNT': 'PROPS.COUNT',
            'UPDATED': 'PROPS.UPDATED',
            'REMOVE': 'PROPS.REMOVE'
        };
    });
