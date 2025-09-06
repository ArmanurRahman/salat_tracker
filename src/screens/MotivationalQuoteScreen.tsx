import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MotivationalQuoteScreen() {
    // Placeholder quote
    const quote =
        "The best among you are those who have the best manners and character.";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Motivational Quote</Text>
            <Text style={styles.quote}>{quote}</Text>
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
    quote: {
        fontSize: 18,
        fontStyle: "italic",
        marginVertical: 8,
        textAlign: "center",
    },
});
