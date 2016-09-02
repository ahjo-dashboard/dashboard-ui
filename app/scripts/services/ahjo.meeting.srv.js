/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoMeetingSrv
* @description
* # AhjoMeetingSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .service('AhjoMeetingSrv', ['$log', '$http', 'ENV', '$q', '$timeout', function ($log, $http, ENV, $q, $timeout) {
        $log.log("AhjoMeetingSrv: SERVICE");
        var self = this;

        self.getMeeting = function (guid) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Meeting.replace('{GUID}', guid)
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    $log.error("AhjoMeetingSrv: getMeeting error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

        self.getEvents = function (eventId, meetingGuid) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Events.replace(':id', eventId).replace(':meetingGuid', meetingGuid)
                }).then(function (response) {
                    if (response.data.objects instanceof Array) {
                        deferred.resolve(response.data.objects);
                    }
                    else {
                        deferred.reject();
                    }
                }, function (error) {
                    $log.error("AhjoMeetingSrv: getEvents error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

        self.getDecisions = function (topicGuid) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});

                if (angular.isString(ENV.AhjoApi_Decisions) && ENV.AhjoApi_Decisions.length) {
                    $http({
                        method: 'GET',
                        cache: false,
                        url: ENV.AhjoApi_Decisions.replace(':topicGuid', topicGuid)
                    }).then(function (response) {
                        // todo: response handling
                        deferred.resolve(response);
                    }, function (error) {
                        $log.error("AhjoMeetingSrv: getDecisions");
                        deferred.reject(error);
                    });
                }
                else {
                    $timeout(function () {
                        // some mock data should be implemented as a response
                        var data = {
                            "meta": {},
                            "objects": {
                                "record": [
                                    {
                                        "typeDescription": "Vastaehd.",
                                        "decisionType": null,
                                        "minuteEntryGuid": "2e654da9-93b4-4580-81b1-ac32f64c068f",
                                        "type": 7,
                                        "text": "jjhhhh muoks \npal -> vast",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "85b2ed51-8846-4002-8e8b-648d6008019e",
                                        "publicity": 0,
                                        "firstname": "Riitta",
                                        "sukunimi": "Aejmelaeus",
                                        "name": "Aejmelaeus Riitta",
                                        "authorGuid": "95f5799d-2a56-41a5-83e4-7c2932762215",
                                        "language": "fi",
                                        "insertDateTime": "2012-10-01T15:45:55",
                                        "typedescriptionAuthorTextCombination": "Vastaehd.  / Aejmelaeus Riitta{0} / jjhhhh muoks \npal -> vast",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    },
                                    {
                                        "typeDescription": "Vastaehd.",
                                        "decisionType": null,
                                        "minuteEntryGuid": "2e654da9-93b4-4580-81b1-ac32f64c068f",
                                        "type": 3,
                                        "text": "jjhhhh muoks \npal -> vast",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "85b2ed51-8846-4002-8e8b-648d6008019e",
                                        "publicity": 0,
                                        "firstname": "Riitta",
                                        "sukunimi": "Aejmelaeus",
                                        "name": "Aejmelaeus Riitta",
                                        "authorGuid": "95f5799d-2a56-41a5-83e4-7c2932762215",
                                        "language": "fi",
                                        "insertDateTime": "2012-10-01T15:45:55",
                                        "typedescriptionAuthorTextCombination": "Vastaehd.  / Aejmelaeus Riitta{0} / jjhhhh muoks \npal -> vast",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    },
                                    {
                                        "typeDescription": "Vastaehd.",
                                        "decisionType": null,
                                        "minuteEntryGuid": "2e654da9-93b4-4580-81b1-ac32f64c068f",
                                        "type": 5,
                                        "text": "jjhhhh muoks \npal -> vast",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "85b2ed51-8846-4002-8e8b-648d6008019e",
                                        "publicity": 0,
                                        "firstname": "Riitta",
                                        "sukunimi": "Aejmelaeus",
                                        "name": "Aejmelaeus Riitta",
                                        "authorGuid": "95f5799d-2a56-41a5-83e4-7c2932762215",
                                        "language": "fi",
                                        "insertDateTime": "2012-10-01T15:45:55",
                                        "typedescriptionAuthorTextCombination": "Vastaehd.  / Aejmelaeus Riitta{0} / jjhhhh muoks \npal -> vast",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    },
                                    {
                                        "typeDescription": "Ponsi",
                                        "decisionType": null,
                                        "minuteEntryGuid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                        "type": 7,
                                        "text": "Jaanan ponsi muutettu pal.ehd",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "aa37e761-9d4d-49d2-b69f-f65fc504f53a",
                                        "publicity": 0,
                                        "firstname": "Jaana",
                                        "sukunimi": "Aalto",
                                        "name": "Aalto Jaana",
                                        "authorGuid": "0eb84a31-3828-42cc-a458-8f6c17952ee9",
                                        "language": "fi",
                                        "insertDateTime": "2012-09-27T15:46:30.387",
                                        "typedescriptionAuthorTextCombination": "Ponsi  / Aalto Jaana{0} / Jaanan ponsi muutettu pal.ehd",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    },
                                    {
                                        "typeDescription": "Ponsi",
                                        "decisionType": null,
                                        "minuteEntryGuid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                        "type": 7,
                                        "text": "Jaanan ponsi muutettu pal.ehd",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "aa37e761-9d4d-49d2-b69f-f65fc504f53a",
                                        "publicity": 0,
                                        "firstname": "Jaana",
                                        "sukunimi": "Aalto",
                                        "name": "Aalto Jaana",
                                        "authorGuid": "0eb84a31-3828-42cc-a458-8f6c17952ee9",
                                        "language": "fi",
                                        "insertDateTime": "2012-09-27T15:46:30.387",
                                        "typedescriptionAuthorTextCombination": "Ponsi  / Aalto Jaana{0} / Jaanan ponsi muutettu pal.ehd",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    },
                                    {
                                        "typeDescription": "Ponsi",
                                        "decisionType": null,
                                        "minuteEntryGuid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                        "type": 3,
                                        "text": "Jaanan ponsi muutettu pal.ehd",
                                        "translationText": "",
                                        "translationTime": null,
                                        "translationTaskGuid": "aa37e761-9d4d-49d2-b69f-f65fc504f53a",
                                        "publicity": 0,
                                        "firstname": "Jaana",
                                        "sukunimi": "Aalto",
                                        "name": "Aalto Jaana",
                                        "authorGuid": "0eb84a31-3828-42cc-a458-8f6c17952ee9",
                                        "language": "fi",
                                        "insertDateTime": "2012-09-27T15:46:30.387",
                                        "typedescriptionAuthorTextCombination": "Ponsi  / Aalto Jaana{0} / Jaanan ponsi muutettu pal.ehd",
                                        "decisionTypeText": null,
                                        "proposalOrdernumber": null
                                    }
                                ],
                                "voting": [
                                    {
                                        "iD": "04597d6f-c9b7-4b5f-9708-e537af290435",
                                        "proposal1Guid": "2e654da9-93b4-4580-81b1-ac32f64c068f",
                                        "proposal2Guid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                        "topicGuid": "39ec0be8-7b37-4d10-b163-08fdead5d90c",
                                        "proposal1Code": "",
                                        "proposal2Code": "",
                                        "sequencenumber": 7,
                                        "proposal1OrderNumber": null,
                                        "proposal2OrderNumber": null,
                                        "yesProposals": {},
                                        "noProposals": {},
                                        "hasVotes": true
                                    }
                                ],
                                "supporter": [
                                    // {
                                    //     "minuteEntryGuid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                    //     "personGuid": "c2fa2e0a-3740-444d-ad64-b9b456786fe5",
                                    //     "firstName": "Mukhtar Junior",
                                    //     "lastName": "Abib",
                                    //     "name": "Abib Mukhtar Junior"
                                    // },
                                    {
                                        "minuteEntryGuid": "f1c45a14-8620-4f71-98a7-eefbc9c048aa",
                                        "personGuid": "c2fa2e0a-3740-444d-ad64-b9b456786fe4",
                                        "firstName": "Mukhtar",
                                        "lastName": "Abib",
                                        "name": "Abib Mukhtar"
                                    }
                                ]
                            }
                        };

                        deferred.resolve(data);
                    }, 1000);
                }
            }, 0);

            return deferred.promise;
        };

        self.meetingLogin = function (meetingGuid, meetingRole, personGuid) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                data: {
                    'meetingGuid': meetingGuid,
                    'meetingRole': meetingRole,
                    'personGuid': personGuid
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogin
            }).then(function () {
                deferred.resolve();
            }, function (error) {
                $log.error("AhjoMeetingSrv: login");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        self.meetingLogout = function (meetingGuid, meetingRole, personGuid) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                data: {
                    'meetingGuid': meetingGuid,
                    'meetingRole': meetingRole,
                    'personGuid': personGuid
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogout
            }).then(function () {
                deferred.resolve();
            }, function (error) {
                $log.error("AhjoMeetingSrv: logout");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        self.setTopicStatus = function (topicGuid, meetingGuid, stateId) {
            var deferred = $q.defer();

            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'POST',
                    cache: false,
                    url: ENV.AhjoApi_TopicStatus.replace(':stateId', stateId).replace(':meetingGuid', meetingGuid).replace(':topicGuid', topicGuid)
                }).then(function (response) {
                    if (angular.isObject(response) && angular.isObject(response.data)) {
                        deferred.resolve(response.data);
                    }
                    else {
                        deferred.reject({}); // todo: update error
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            }, 0);

            return deferred.promise;
        };

        self.setMeetingStatus = function (meetingGuid, stateId) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'POST',
                    cache: false,
                    url: ENV.AhjoApi_MeetingStatus.replace(':stateId', stateId).replace(':meetingGuid', meetingGuid)
                }).then(function (response) {
                    if (angular.isObject(response) && angular.isObject(response.data)) {
                        deferred.resolve(response.data);
                    }
                    else {
                        deferred.reject({}); // todo: update error
                    }
                }, function (error) {
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

    }]);
