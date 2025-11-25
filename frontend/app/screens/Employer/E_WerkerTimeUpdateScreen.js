import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

export default function E_WerkerTimeUpdateScreen({ navigation }) {
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>근무 시간 등록</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* 시간 */}
      <Text style={styles.label}>시간</Text>
      <View style={styles.box}>
        <TextInput
          placeholder="예: 12:00 - 14:00"
          value={time}
          onChangeText={setTime}
          style={styles.input}
        />
      </View>

      {/* 요일 */}
      <Text style={styles.label}>요일</Text>
      <View style={styles.box}>
        <TextInput
          placeholder="예: 월"
          value={day}
          onChangeText={setDay}
          style={styles.input}
        />
      </View>

      {/* 등록 버튼 */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7E7E8",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },

  /* Labels */
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
    marginTop: 10,
  },

  /* Input box */
  box: {
    backgroundColor: "#fff",
    height: 52,
    borderRadius: 28,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: "#000",
  },

  /* 등록 버튼 */
  saveBtn: {
    backgroundColor: "#000",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  saveText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
