import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";

export default function Index() {
  const [data, setData] = useState("if you see this, the fetch failed");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getDBTest = async () => {
    try {
      const response = await fetch("https://kemyze.vercel.app/dbtest");
      console.log(response);
      const text = await response.text();
      setData(text);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDBTest();
  }, []);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSuccessMessage("");
      setErrorMessage("Please enter your email.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch("https://kemyze.vercel.app/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || "Password reset email has been sent.");
      } else {
        setErrorMessage(result.error || result.message || "Request failed.");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setErrorMessage("Request timed out. Please try again.");
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    }
  };

  return (
    <View style={styles.backgroundGradient}>
      <Text style={styles.text}>
        Edit src/app/index.tsx to edit this screen.
      </Text>

      <Text style={styles.text}>{data}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Forgot Password</Text>
      </TouchableOpacity>

      {successMessage !== "" && (
        <Text style={styles.successText}>{successMessage}</Text>
      )}

      {errorMessage !== "" && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    marginBottom: 10,
  },
  backgroundGradient: {
    width: "100%",
    height: "100%",
    padding: 20,
    justifyContent: "center",
    experimental_backgroundImage:
      "linear-gradient(to left, #09091C 0%, #131338 33%, #131338 66%, #09091C 100%)",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4C6FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  successText: {
    color: "#4CFF88",
    marginTop: 15,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 15,
  },
});