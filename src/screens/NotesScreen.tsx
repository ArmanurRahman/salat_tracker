import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function NotesScreen() {
    const [note, setNote] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notes & Reflections</Text>
            <TextInput
                style={styles.input}
                placeholder='Write your reflection...'
                value={note}
                onChangeText={setNote}
                multiline
            />
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
        height: 120,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
});
