import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, ChevronRight, ChevronDown, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../../services/api";

export default function E_WorkerUpdateScreen({ navigation, route }) {
  const { workerId } = route.params; // 🔥 전달된 workerId 사용

  const [roles, setRoles] = useState([]);
  const [worker, setWorker] = useState(null);
  const [roleModal, setRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------
      📌 1) 근무자 정보 조회
  ---------------------------------- */
  useEffect(() => {
    loadWorker();
    loadRoles();
  }, []);

  const loadWorker = async () => {
    try {
      const res = await client.get(`/worker/${workerId}`);
      setWorker(res.data);
    } catch (err) {
      console.log("근무자 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
      📌 2) 역할 목록 조회
  ---------------------------------- */
  const loadRoles = async () => {
    try {
      const companyId = await AsyncStorage.getItem("currentCompanyId");
      const res = await client.get(`/companies/${companyId}/roles`);
      setRoles(res.data);
    } catch (err) {
      console.log("역할 조회 실패:", err);
    }
  };

  /* ----------------------------------
      📌 3) 저장 (PUT)
  ---------------------------------- */
  const saveWorker = async () => {
    try {
      await client.put(`/worker/${workerId}`, worker);
      alert("저장되었습니다.");
      navigation.goBack();
    } catch (err) {
      console.log("수정 실패:", err);
      alert("저장 실패");
    }
  };

  if (loading || !worker) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>근무자 관리</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* 이름 */}
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={worker.name}
        onChangeText={(t) => setWorker({ ...worker, name: t })}
      />

      {/* 담당 업무 */}
      <Text style={styles.label}>담당 업무</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setRoleModal(true)}
      >
        <Text style={styles.selectorText}>
          {roles.find((r) => r.roleId === worker.roleId)?.name ?? "선택"}
        </Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      {/* 시급 */}
      <Text style={styles.label}>시급</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(worker.wage)}
        onChangeText={(t) => setWorker({ ...worker, wage: Number(t) })}
      />

      {/* 고정 근무 시간 */}
      <Text style={styles.label}>고정 근무 시간</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() =>
          navigation.navigate("E_WorkerTimeScreen", {
            workerId: workerId,
            fixedTimes: worker.fixedTimes,
          })
        }
      >
        <Text style={styles.selectorText}>
          {worker.fixedTimes?.length > 0
            ? `${worker.fixedTimes[0].weekday} ${worker.fixedTimes[0].start}-${worker.fixedTimes[0].end}`
            : "등록된 시간이 없습니다."}
        </Text>
        <ChevronRight size={20} color="#666" />
      </TouchableOpacity>

      {/* 근무 가능 시간 */}
      <Text style={[styles.label, { marginTop: 20 }]}>근무 가능 시간</Text>
      <View style={styles.availBox}>
        {worker.availableTimes?.map((t, idx) => (
          <Text key={idx} style={styles.availText}>
            {t.weekday} {t.start}~{t.end}
          </Text>
        ))}
      </View>

      {/* 저장 */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveWorker}>
        <Text style={styles.saveText}>저장</Text>
      </TouchableOpacity>

      {/* 역할 선택 모달 */}
      {roleModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setRoleModal(false)}
            >
              <X size={22} color="#333" />
            </TouchableOpacity>

            {roles.map((r) => (
              <TouchableOpacity
                key={r.roleId}
                style={styles.modalItem}
                onPress={() => {
                  setWorker({ ...worker, roleId: r.roleId });
                  setRoleModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{r.name}</Text>
              </TouchableOpacity>
            ))}

          </View>
        </View>
      )}

    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f5", padding: 20, paddingTop: 64 },

  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  label: { marginTop: 16, marginBottom: 6, fontSize: 14, color: "#555" },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },

  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  selectorText: { fontSize: 15 },

  availBox: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  availText: {
    fontSize: 14,
    marginBottom: 4,
  },

  saveBtn: {
    backgroundColor: "#000",
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  closeBtn: { alignSelf: "flex-end", marginBottom: 10 },
  modalItem: { paddingVertical: 12 },
  modalItemText: { fontSize: 16 },
});
