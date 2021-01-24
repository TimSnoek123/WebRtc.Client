
const peerConnections = {};
const config = {
    "iceServers":
        [
            { "urls": "stun:74.125.142.127:19302" },
            { "urls": "turn:turn.anyfirewall.com:443?transport=tcp", "username": "webrtc", "credential": "webrtc" }
        ]
};

var audio = new Audio();
var localStream;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    
    localStream = stream;
    audio.onloadedmetadata = function (ev) {

        // Play the audio in the 2nd audio 
        // element what is being recorded 
        console.log("PLAYT");
        audio.play();
    }; 
})


export function CreateRTCConnection(id, sendOfferCallback, oneIceCandidateCallback) {
    const peerConnection = new RTCPeerConnection(config);

    peerConnection.oniceconnectionstatechange = event => {
        console.log("connection changed");
        console.log(peerConnection);
    }

    peerConnections[id] = peerConnection;
    console.log("establsishing conn");
    console.log(peerConnections);

    let stream = localStream;

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("Sending candidate");
            oneIceCandidateCallback(id, JSON.stringify(event.candidate));
            // dotnetHelper.invokeMethodAsync("SendCandidateAsync", );
        }
    }

    peerConnection.ontrack = event => {
        console.log("GOT TRACK");
        console.log(event.streams);
        audio.srcObject = event.streams[0];
        console.log(peerConnection.connectionState);
    };

    peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            console.log("Sending offer");
            sendOfferCallback(id, JSON.stringify(peerConnection.localDescription));
            // dotnetHelper.invokeMethodAsync("SendOfferAsync", );
        });

}

export function addCandidate(id, candidate) {
    console.log("ADDING CANDIDATE");
    console.log(peerConnections)
    peerConnections[id].addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
}

export function setRemoteDescription(id, description) {
    console.log("GOT ANSWER");
    peerConnections[id].setRemoteDescription(JSON.parse(description));
}

export function onOffer(id, description, sendAnswerCallback, onCandidateCallback) {
    const peerConnection = new RTCPeerConnection(config);

    peerConnections[id] = peerConnection;
    peerConnection.oniceconnectionstatechange = event => {
        console.log("connection changed");
        console.log(peerConnection);
    }

    let stream = localStream;

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection
        .setRemoteDescription(JSON.parse(description))
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            console.log("Sending answer");
            sendAnswerCallback(/*"SendAnswerAsync",*/ id, JSON.stringify(peerConnection.localDescription));
        });


    peerConnection.ontrack = event => {
        console.log("GOT TRACK");
        console.log(event.streams);
        audio.srcObject = event.streams[0];
        console.log(peerConnection.connectionState);
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("Sending candidate");
            onCandidateCallback(id, JSON.stringify(event.candidate));
            // dotnetHelper.invokeMethodAsync("SendCandidateAsync", id, JSON.stringify(event.candidate));
        }
    }

}