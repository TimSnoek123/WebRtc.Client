import { HubConnectionBuilder } from '@aspnet/signalr';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as webRtcClient from './webRtc/WebRtcClient'

const hubUrl = 'https://localhost:44385/WebRtc'



export default function App() {
  const hubConnection = new HubConnectionBuilder()
    .withUrl(hubUrl)
    .build();


  hubConnection.on("OnNewUser", (username, connectionId) => {
    console.log("New user connected");
    webRtcClient.CreateRTCConnection(connectionId, (id, localDescription) => {
      hubConnection.send("OnOfferAsync", id, localDescription);
    },
      (id, candidate) => {
        hubConnection.send("OnCandidateAsync", id, candidate);
      });
  })

  hubConnection.start().then(() => hubConnection.send("OnNewUserAsync", "TestUserName"));

  hubConnection.on("OnOffer", (id, localDescription) => {
    webRtcClient.onOffer(id, localDescription, 
      (id, localDescription) => hubConnection.send("OnAnswerAsync", id, localDescription),
      (id, localDescription) => hubConnection.send("OnCandidateAsync", id, localDescription));
  })

  hubConnection.on("OnCandidate", (id, candidate) => {
    webRtcClient.addCandidate(id, candidate);
  })

  hubConnection.on("OnAnswer", (id, localDescription) => {
    webRtcClient.setRemoteDescription(id, localDescription);
  })

  console.log(hubConnection)

  return (
    <View style={styles.container}>
      <Text>Test123</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
