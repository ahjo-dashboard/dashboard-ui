/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';
angular.module('FileHistory', [])
.factory('FileHistory', function(ENV, $log) {
	$log.debug("FileHistory.factory");

	var files = []; // FileItem

	// PRIVATE FUNCTIONS

	// For identifying duplicate entires for now this service requires item to have a distinct non-null
	// desc and url/blob
	function validateItem(aItem) {
		var valid = false;
		if (aItem && (aItem.desc && aItem.desc.length) && ( aItem.blob || (aItem.url && aItem.url.length))) {
			valid = true;
		}
		return valid;
	}

	// Returns true if arguments are considered duplicate content-wise
	function compareItems(aItem1, aItem2) {
		var res = false;
		if (aItem1.url && aItem2.url && aItem1.url === aItem2.url) {
			res = true;
		} else if (aItem1.blob && aItem2.blob && aItem1.desc && aItem2.desc && aItem1.desc === aItem2.desc) {
			res = true;
		}
		return res;
	}

	// A matching item is removed from list
	function removeItem(aItem, aList) {
		var res = false;
		for(var i = 0; !res && i < aList.length ; i++) {
			if (compareItems(aItem, aList[i])) {
				aList.splice(i, 1);
				res = true;
			}
		}
		return res;
	}

	function addItem(aItem) {
		$log.debug("FileHistory.addItem: url=" +aItem.url +" desc=" +aItem.desc +" type=" +aItem.type +" blob=" +(aItem.blob));
		if (!validateItem(aItem)) {
			$log.error("FileHistory.addItem: bad args");
			return;
		}

		removeItem(aItem, files);
		if (files.length > ENV.FileHistory_MaxCount) {
			files.splice(0, 1);
		}
		files.push(aItem);
	}

	function clearFiles() {
		$log.debug("FileHistory.clearFiles: removed " +files.length);
		files.splice(0, files.length);
	}

	// PUBLIC FUNCTIONS

	var self = this;
	self.list = files;
	self.add = addItem;
	self.clearList = clearFiles;
	self.FileItem = function(url, desc, type, blob) {
		this.url = url;
		this.desc = desc;
		this.type = type;
		this.blob = blob;
	};

	return self;
});
