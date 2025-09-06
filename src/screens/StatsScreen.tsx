import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatsScreen() {
    // Placeholder values
    const weeklyCompletion = 85;
    const monthlyCompletion = 90;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stats & Insights</Text>
            <Text style={styles.stat}>
                Weekly Completion: {weeklyCompletion}%
            </Text>
            <Text style={styles.stat}>
                Monthly Completion: {monthlyCompletion}%
            </Text>
            <Text>See which prayers you miss most often (coming soon)...</Text>
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
    stat: { fontSize: 18, marginVertical: 8 },
});
