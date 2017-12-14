function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function SipInit() {
    var _proxy = getRegisterData('sipAddress')+':45678';
    var _user = getRegisterData('sipUsername');
    var _secret = getRegisterData('sipPassword');

    var _area = getRegisterData('loginArea');
    var _uri = 'https://rtc.uuutel.com:8889/janus';

    Sip = new Sip(_proxy,_user,_secret,_uri);
    Sip.on('message.registered',function(){
        console.log('message.registered');
    });
    Sip.on('message.registration_failed',function(){
        console.log('message.registration_failed');
    });
    Sip.on('message.calling',function(){
        console.log('message.calling');
        if (typeof onSipCall === 'function') {
            onSipCall();
        }
    });
    Sip.on('message.incomingcall',function(number){
        console.log('message.incomingcall',number)
        if (typeof onSipIncomingCall === 'function') {
            onSipIncomingCall(number);
        }
    });
    Sip.on('message.accepted',function(number){
        console.log('message.accepted',number)
        if (typeof onSipDialNumber === 'function') {
            onSipDialNumber(number, number);
        }
    });
    Sip.on('message.hangup',function(number){
        ring.pause();
        ring.load();
        console.log('message.hangup',number)
        if(Sip._isHangup === true){
            return false;
        }
        Sip._isHangup = true;
        if (typeof onSipHangUp === 'function') {
            onSipHangUp(number);
        }
    });
    Sip.on('sip.destroy',function(){
        console.log('sip.destroy')
        ring.pause();
        ring.load();
        if (mainDialObj._phase === '2' || mainDialObj._phase === '3') {
            mainDialObj.goPhase('0');
        }
    });
    Sip.on('sip.error',function(){
        console.log('sip.error')
        if (mainDialObj._phase === '2' || mainDialObj._phase === '3') {
            mainDialObj.goPhase('0');
        }
    });
    Sip.on('sip.jsepError',function(error){
        console.log('sip.jsepError' + error);
        if (typeof onSipJsepError === 'function') {
            if(error.name){
                onSipJsepError(error.name);
            }else{
                onSipJsepError(error);
            }
        }
    })
}

cordova.commandProxy.add("Sip", {
    call:function(successCallback, errorCallback, strInput) {
        if(!strInput || !strInput.length) {
            console.log('exec error : sip::call');
        }
        else {
            Sip.call(strInput[0]);
        }
    },
    dial:function(successCallback, errorCallback, strInput) {
        if(!strInput || !strInput.length) {
            console.log('exec error : sip::call');
        }
        else {
            Sip.dial(strInput[0]);
        }
    },
    answer:function(successCallback, errorCallback) {
        Sip.answer();
    },
    hangup:function(successCallback, errorCallback) {
        Sip.hangup();
    }
});

loadScript('plugins/cordova-browser-ubiix/src/adapter.min.js', function() {
    loadScript('plugins/cordova-browser-ubiix/src/sip.min.js', SipInit);
})