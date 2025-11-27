import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import client from "../../services/api";

export default function W_ScheduleAddScreen({ navigation }) {
  const [existingPatterns, setExistingPatterns] = useState([]);
  
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(18, 0, 0, 0)));
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const [selectedDays, setSelectedDays] = useState([]);

  // [수정 1] useEffect 대신 useFocusEffect 사용 (화면이 보일 때마다 실행)
  useFocusEffect(
    useCallback(() => {
      loadExistingPatterns();
      // 화면에 들어올 때 선택된 요일 초기화 (선택 사항)
      setSelectedDays([]); 
    }, [])
  );

  const loadExistingPatterns = async () => {
    try {
      const companyId = await AsyncStorage.getItem("currentCompanyId");
      if (!companyId) return;
      // 서버에서 최신 데이터를 가져와서 existingPatterns를 갱신함
      const res = await client.get(`/companies/${companyId}/schedule/worker/availability-pattern`);
      const items = res.data.items || [];
      // 같은 요일/시간대가 중복으로 들어오는 경우를 방지하기 위해 클라이언트에서 한 번 더 dedupe
      const uniqueItems = [];
      const seen = new Set();
      items.forEach((p) => {
        const key = `${p.dow}-${p.startTime}-${p.endTime}-${p.effectiveFrom}-${p.effectiveTo}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueItems.push(p);
        }
      });
      setExistingPatterns(uniqueItems);
    } catch (e) {
      console.log("기존 패턴 로드 실패:", e);
    }
  };

  const toggleDay = (index) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(selectedDays.filter(d => d !== index));
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  const formatTimeToString = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      Alert.alert("선택 오류", "요일을 하나 이상 선택해주세요.");
      return;
    }
    if (startTime >= endTime) {
        Alert.alert("시간 오류", "종료 시간은 시작 시간보다 늦어야 합니다.");
        return;
    }

    try {
      const companyId = await AsyncStorage.getItem("currentCompanyId");
      if (!companyId) return;

      // 저장 직전에 서버에서 최신 패턴을 다시 가져와서, 항상 최신 상태 기준으로 계산
      const latestRes = await client.get(`/companies/${companyId}/schedule/worker/availability-pattern`);
      const latestItems = (latestRes.data.items || []).map(p => ({
        dow: p.dow,
        startTime: p.startTime,
        endTime: p.endTime,
        effectiveFrom: p.effectiveFrom,
        effectiveTo: p.effectiveTo
      }));

      // 1. 이번에 새로 추가/수정할 데이터 생성
      const newItems = selectedDays.map(day => ({
        dow: day,
        startTime: formatTimeToString(startTime),
        endTime: formatTimeToString(endTime),
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: null
      }));

      // 최신 서버 상태(latestItems) 기준으로,
      // 이번에 선택한 요일(selectedDays)과 겹치는 기존 패턴 제거
      const filteredExisting = latestItems.filter(
        p => !selectedDays.includes(p.dow)
      );

      // 필터링된 기존 데이터 + 새로운 데이터 합치기
      let combined = [...filteredExisting, ...newItems];

      // 혹시 서버에서 중복 데이터가 내려와 combined 안에 같은 패턴이 여러 개 섞여 있을 수 있으므로
      // POST 전에 한 번 더 dedupe 해서 요일/시간대 조합이 하나씩만 가도록 보정
      const deduped = [];
      const seen = new Set();
      combined.forEach((p) => {
        const key = `${p.dow}-${p.startTime}-${p.endTime}-${p.effectiveFrom}-${p.effectiveTo}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(p);
        }
      });
      combined = deduped;

      await client.post(`/companies/${companyId}/schedule/worker/availability-pattern`, {
        items: combined
      });

      Alert.alert("저장 완료", "근무 시간이 추가되었습니다.", [
        { text: "확인", onPress: () => navigation.goBack() }
      ]);

    } catch (err) {
      console.error("저장 실패:", err);
      Alert.alert("저장 실패", "오류가 발생했습니다.");
    }
  };

  const displayTime = (date) => {
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>근무 시간 추가</Text>
      </View>

      <ScrollView>
        <Text style={styles.label}>시간 선택</Text>
        
        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.subLabel}>시작</Text>
            {Platform.OS === 'android' && (
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timeBtn}>
                    <Text style={styles.timeBtnText}>{displayTime(startTime)}</Text>
                </TouchableOpacity>
            )}
            {(Platform.OS === 'ios' || showStartPicker) && (
                <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={(event, date) => {
                        if (Platform.OS === 'android') setShowStartPicker(false);
                        if (date) setStartTime(date);
                    }}
                    style={styles.picker}
                    minuteInterval={10}
                />
            )}
          </View>

          <Text style={{ fontSize: 24, fontWeight: 'bold', marginHorizontal: 10, marginTop: 20 }}>~</Text>

          <View style={styles.timeCol}>
            <Text style={styles.subLabel}>종료</Text>
            {Platform.OS === 'android' && (
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timeBtn}>
                    <Text style={styles.timeBtnText}>{displayTime(endTime)}</Text>
                </TouchableOpacity>
            )}
            {(Platform.OS === 'ios' || showEndPicker) && (
                <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={(event, date) => {
                        if (Platform.OS === 'android') setShowEndPicker(false);
                        if (date) setEndTime(date);
                    }}
                    style={styles.picker}
                    minuteInterval={10}
                />
            )}
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 32 }]}>요일 선택</Text>
        <View style={styles.dayContainer}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDays.includes(index) && styles.dayButtonSelected
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text style={[
                styles.dayText,
                selectedDays.includes(index) && styles.dayTextSelected
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>추가하기</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  subLabel: {
      textAlign: 'center',
      marginBottom: 8,
      color: '#666',
      fontWeight: '500'
  },
  timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', 
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
  },
  timeCol: {
      flex: 1,
      alignItems: 'center',
  },
  picker: {
      width: Platform.OS === 'ios' ? 100 : '100%', 
      height: 120
  },
  timeBtn: {
      backgroundColor: '#f3f4f6',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
  },
  timeBtnText: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd"
  },
  dayButtonSelected: {
    backgroundColor: "#000",
    borderColor: "#000"
  },
  dayText: {
    fontSize: 16,
    color: "#666"
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "bold"
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});