import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EncouragementScreen() {
    // Placeholder for encouragement
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gentle Encouragement</Text>
            <Text>
                Celebrate milestones and encourage you if you miss a day (coming
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
