/*
 * name: nwjs-analytics -Node-Webkit Google Analytics integration
 * version: 1.0.2
 * github: https://github.com/Daaru00/nwjs-analytics
 */


var analytics = {
    apiVersion: '1',
    trackID: 'UA-106148524-1',
    clientID: null,
    userID: null,
	appName: 'omgrpc',
	appVersion: 'v0.1.2-beta',
	debug: false,
	performanceTracking: true,
	errorTracking: true,
	userLanguage: "en",
    currency: "USD",
    lastScreenName: '',

    sendRequest: function(data, callback){
        if(!this.clientID || this.clientID == null)
            this.clientID = this.generateClientID();

        if(!this.userID || this.userID == null)
            this.userID = this.generateClientID();

        var postData = "v="+this.apiVersion
                        +"&tid="+this.trackID
                        +"&cid="+this.clientID
                        +"&uid="+this.userID
                        +"&an="+this.appName
                        +"&av="+this.appVersion
                        +"&sr="+this.getScreenResolution()
                        +"&vp="+this.getViewportSize()
                        +"&sd="+this.getColorDept()
                        +"&ul="+this.userLanguage
                        +"&ua="+this.getUserAgent()
                        +"&ds=app";

        Object.keys(data).forEach(function(key) {
            var val = data[key];
            if(typeof val != "undefined")
                postData += "&"+key+"="+val;
        });

        var http = new XMLHttpRequest();
        var url = "https://www.google-analytics.com";
        if(!this.debug)
            url += "/collect";
        else
            url += "/debug/collect";

        http.open("POST", url, true);

        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
            if(analytics.debug)
                console.log(http.response);

            if(http.readyState == 4 && http.status == 200) {
                if(callback)
                    callback(true);
            }
            else
            {
                if(callback)
                    callback(false);
            }
        }
        http.send(postData);
    },
    generateClientID: function()
    {
        var id = "";
        var possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            id += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
        return id;
    },
    getScreenResolution: function(){
        return screen.width+"x"+screen.height;
    },
    getColorDept: function(){
        return screen.colorDepth+"-bits";
    },
    getUserAgent: function(){
        return navigator.userAgent;
    },
    getViewportSize: function(){
        return window.screen.availWidth+"x"+window.screen.availHeight;
    },

    /*
     * Measurement Protocol
     * [https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide]
     */

    screenView: function(screename){
        var data = {
			't' : 'screenview',
			'cd' : screename
		}
		this.sendRequest(data);
        this.lastScreenName = screename;
    },
    event: function(category, action, label, value){
        var data = {
			't' : 'event',
			'ec' : category,
			'ea' : action,
			'el' : label,
			'ev' : value,
            'cd' : this.lastScreenName,
		}
		this.sendRequest(data);
    },
    exception: function(msg, fatal){
        var data = {
			't' : 'exception',
			'exd' : msg,
			'exf' : fatal || 0
		}
		this.sendRequest(data);
    },
    timing: function(category, variable, time, label){

        var data = {
			't' : 'timing',
			'utc' : category,
			'utv' : variable,
			'utt' : time,
			'utl' : label,
		}
		this.sendRequest(data);
    },
    ecommerce:{
        transactionID: false,
        generateTransactionID: function()
        {
            var id = "";
            var possibilities = "0123456789";
            for( var i=0; i < 5; i++ )
                id += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
            return id;
        },
        transaction: function(total, items){
            var t_id = "";
            if(!this.ecommerce.transactionID)
                t_id = this.ecommerce.generateTransactionID();
            else
                t_id = this.ecommerce.transactionID;

            var data = {
                't' : 'transaction',
                'ti' : t_id,
                'tr' : total,
                'cu' : this.currency,
            }
            this.sendRequest(data);

            items.forEach(function(item){
                var data = {
                    't' : 'item',
                    'ti' : t_id,
                    'in' : item.name,
                    'ip' : item.price,
                    'iq' : item.qty,
                    'ic' : item.id,
                    'cu' : this.currency
                }
                this.sendRequest(data);
            })
        }
    },
    custom: function(data){
        this.sendRequest(data);
    }
}

/*
 * Performance Tracking
 */

window.addEventListener("load", function() {

    if(analytics.performanceTracking)
    {
        setTimeout(function() {
            var timing = window.performance.timing;
            var userTime = timing.loadEventEnd - timing.navigationStart;

            analytics.timing("performance", "pageload", userTime);

          }, 0);
    }

}, false);

/*
 * Error Reporting
 */

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var message = [
        'Message: ' + msg,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
    ].join(' - ');

    if(analytics.errorTracking)
    {
        setTimeout(function() {
            analytics.exception(message.toString());
        }, 0);
    }

    return false;
};