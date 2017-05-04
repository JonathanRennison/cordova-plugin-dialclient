var exec = require('cordova/exec');
var terminalCounter = 1;
var discoveredTerminals = {};


// window.onbeforeunload = confirmExit;
//   function confirmExit()
//   {
//     return "You have attempted to leave this page.  If you have made any changes to the fields without clicking the Save button, your changes will be lost.  Are you sure you want to exit this page?";
//   }

/**
 * A Device object shall have the following properties:
 *  - readonly Number enum_id: A unique ID for a discovered HbbTV terminal
 *  - readonly String friendly_name: A discovered terminal may provide a friendly name, e.g. “Muttleys TV”, for an HbbTV application to make use of.
 * 	- readonly String X_HbbTV_App2AppURL: The remote service endpoint on the discovered HbbTV terminal for application to application communication
 * 	- readonly String X_HbbTV_InterDevSyncURL: The remote service endpoint on the discovered HbbTV terminal for inter-device synchronisation
 * 	- readonly String X_HbbTV_UserAgent: The User Agent string of the discovered HbbTV terminal
 */
var DiscoveredTerminal = function(enum_id, friendly_name, X_HbbTV_App2AppURL, X_HbbTV_InterDevSyncURL, X_HbbTV_UserAgent, appXML){
    Object.defineProperty(this, "enum_id", {
        get: function () {
            return enum_id;
        }
    });
    Object.defineProperty(this, "friendly_name", {
        get: function () {
            return friendly_name;
        }
    });
    Object.defineProperty(this, "X_HbbTV_App2AppURL", {
        get: function () {
            return X_HbbTV_App2AppURL;
        }
    });
    Object.defineProperty(this, "X_HbbTV_InterDevSyncURL", {
        get: function () {
            return X_HbbTV_InterDevSyncURL;
        }
    });
    Object.defineProperty(this, "X_HbbTV_UserAgent", {
        get: function () {
            return X_HbbTV_UserAgent;
        }
    });
    Object.defineProperty(this, "appXML", {
        get: function () {
            return appXML;
        }
    });
};

/**
 * @constructor
 */
var dialClient = function(){


    Object.defineProperty(this, "startDiscovery", {
        get: function () {
            return startDiscovery;
        }
    });

    Object.defineProperty(this, "stopDiscovery", {
        get: function () {
            return stopDiscovery;
        }
    });


    Object.defineProperty(this, "getDevices", {
        get: function () {
            return getDevices;
        }
    });
};

var handleDeviceListSuccess = function(onDeviceListChanged) {
    return function (deviceListJSON) {
        var deviceList = JSON && JSON.parse(deviceListJSON);

        var res = [];
        for(var i=0;i<deviceList.length; i++){
            var terminal = deviceList[i];
            var launchUrl = terminal.launchUrl;
            var oldTerminal = discoveredTerminals[launchUrl];
            var enumId = oldTerminal && oldTerminal.enum_id || terminalCounter++;
            var newTerminal = new DiscoveredTerminal(enumId, terminal.friendlyName, terminal.HbbTV_App2AppURL, terminal.HbbTV_InterDevSyncURL, terminal.HbbTV_UserAgent, terminal.appXML);
            discoveredTerminals[launchUrl] = newTerminal;
            discoveredTerminals[enumId] = terminal;
            res.push(newTerminal);
        }
        onDeviceListChanged && onDeviceListChanged.call(null,res,null);
    };
};

var handleDeviceListError = function(onDeviceListChanged) {
    return function (code) {
        onDeviceListChanged && onDeviceListChanged.call(null, [], code);
    };
};

/**
 * Boolean startDiscovery(function onTerminalDiscovery)
 * callback onDeviceListChanged (deviceList[])
 */
var startDiscovery = function(onDeviceListChanged){
    exec(handleDeviceListSuccess(onDeviceListChanged), handleDeviceListError(onDeviceListChanged), "DIALClient", "startDiscovery", ["HbbTV"]);
    return true;
};

/**
 * Boolean stopDiscovery()
 * callback onCompletion ()
 */
var stopDiscovery = function(onCompletion){
    if (!onCompletion) onCompletion = function() { };
    exec(onCompletion, onCompletion, "DIALClient", "stopDiscovery", []);
    return true;
};

/**
 * Boolean getDevices()
 * callback deviceListCallback (deviceList[])
 */
var getDevices = function(deviceListCallback){
    exec(handleDeviceListSuccess(deviceListCallback), handleDeviceListError(deviceListCallback), "DIALClient", "getDevices", []);
    return true;
};

exports.getDIALClient = function(){
    return new dialClient();
};
