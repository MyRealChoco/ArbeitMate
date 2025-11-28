import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../../services/api";

export default function E_NoticeDetailScreen({ route, navigation }) {
  const { noticeId, companyId } = route.params;

  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const res = await client.get(`/companies/${companyId}/notices/${noticeId}`);
      setNotice(res.data);
    } catch (err) {
      console.log("공지 상세 조회 실패:", err);
      Alert.alert("오류", "공지 상세 정보를 불러오지 못했습니다.");
    }
  };

  /** 📌 공지 삭제하기 */
  const deleteNotice = () => {
    Alert.alert(
      "삭제 확인",
      "정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete(`/companies/${companyId}/notices/${noticeId}`);
              Alert.alert("삭제 완료", "공지사항이 삭제되었습니다.");
              navigation.goBack();
            } catch (err) {
              console.log("공지 삭제 실패:", err);
              Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  if (!notice) return null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={32} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>공지 상세</Text>

        {/* 편집 / 삭제 버튼 */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              navigation.navigate("E_NoticeEditScreen", {
                noticeId,
                companyId,
                prevTitle: notice.title,
                prevContent: notice.content,
              })
            }
          >
            <Pencil size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={deleteNotice}>
            <Trash2 size={26} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.date}>{notice.createdAt?.slice(0, 10)}</Text>
        <Text style={styles.content}>{notice.content}</Text>
      </ScrollView>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  content: {
    fontSize: 18,
    lineHeight: 24,
  },
});
