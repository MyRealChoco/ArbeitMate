import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator 
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from "../../services/api";

export default function W_PayScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 보고 있는 월
  const [salaryData, setSalaryData] = useState(null);

  // 월 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchSalary();
  }, [currentDate]);

  const fetchSalary = async () => {
    try {
      setLoading(true);
      const companyId = await AsyncStorage.getItem("currentCompanyId");
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await client.get(`/companies/${companyId}/salary`, {
        params: { year, month }
      });
      
      setSalaryData(response.data);

    } catch (err) {
      console.log("급여 조회 실패:", err);
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // 월 이동 핸들러
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // 금액 포맷
  const formatMoney = (amount) => {
    return (amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 날짜 포맷 (2025-11-26 -> 11.26)
  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // 리스트 아이템 렌더링
  const renderRecordItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View>
        <Text style={styles.recordLeft}>
          {formatDateShort(item.date)} <Text style={styles.recordTime}>({(item.workMinutes / 60).toFixed(1)}시간)</Text>
        </Text>
        <Text style={styles.recordSub}>
          {item.startTime ? item.startTime.slice(0, 5) : ""} ~ {item.endTime ? item.endTime.slice(0, 5) : ""}
        </Text>
      </View>
      <Text style={styles.recordPrice}>{formatMoney(item.dailySalary)} 원</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>급여 관리</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <ArrowRight size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Total Payment Box */}
          <View style={styles.totalBox}>
            <View style={styles.rowBetween}>
              <Text style={styles.totalLabel}>총 급여 (예상)</Text>
              <Text style={styles.totalMoney}>{formatMoney(salaryData?.totalSalary)} 원</Text>
            </View>
            
            {/* 상세 내역 (기본급, 주휴수당) */}
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>기본 급여</Text>
              <Text style={styles.detailValue}>{formatMoney(salaryData?.baseSalary)} 원</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>주휴 수당</Text>
              <Text style={styles.detailValue}>+ {formatMoney(salaryData?.holidayAllowance)} 원</Text>
            </View>
          </View>

          {/* Record Title */}
          <Text style={styles.recordTitle}>상세 기록</Text>

          {/* Record List */}
          <FlatList
            data={salaryData?.details || []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRecordItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#999' }}>근무 기록이 없습니다.</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 24,
    paddingTop: 64,
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
    color: "#000",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 20,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  totalBox: {
    backgroundColor: "#dbeafe", // blue-100
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  totalMoney: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 15,
    color: "#555",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  recordItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  recordLeft: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  recordTime: {
    fontSize: 14,
    fontWeight: "400",
    color: "#555",
  },
  recordSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  recordPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});