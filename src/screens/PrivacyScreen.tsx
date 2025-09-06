import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Privacy & Security</Text>
            <Text>
                Option to lock the app with a passcode or biometrics (coming
                soon)...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
});
