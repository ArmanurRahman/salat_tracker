import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function GoalsScreen() {
    const [goal, setGoal] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Customizable Goals</Text>
            <TextInput
                style={styles.input}
                placeholder='Set your goal (e.g., never miss Fajr for a week)'
                value={goal}
                onChangeText={setGoal}
            />
            <Button title='Save Goal' onPress={() => {}} />
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
    input: {
        width: 300,
        height: 48,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        marginBottom: 16,
    },
});
