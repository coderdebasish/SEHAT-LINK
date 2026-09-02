import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { localDB, SyncQueueItem } from './src/lib/offline/db';
import { syncEngine, SyncProgress } from './src/lib/offline/sync';

type Role = 'health_worker' | 'patient' | 'doctor' | 'pharmacy';

export default function App() {
  const [role, setRole] = useState<Role>('health_worker');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  // Form states for Health Worker
  const [patientId, setPatientId] = useState('SL-MH-2026-000001');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('74');
  const [spo2, setSpo2] = useState('98');

  // Form states for Registration
  const [regName, setRegName] = useState('');
  const [regVillage, setRegVillage] = useState('Nimgaon');

  // Active view tab inside role
  const [activeTab, setActiveTab] = useState<'roster' | 'vitals' | 'register' | 'sync'>('roster');

  useEffect(() => {
    refreshQueue();
  }, []);

  const refreshQueue = async () => {
    const queue = await localDB.getAllQueue();
    setPendingItems(queue);
  };

  const toggleNetwork = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    syncEngine.setOnlineStatus(newStatus);

    if (newStatus) {
      handleSync();
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'Cannot sync while network is disabled.');
      return;
    }

    setSyncing(true);
    await syncEngine.flushQueue((progress) => {
      setSyncProgress(progress);
    });
    await refreshQueue();
    setSyncing(false);
    Alert.alert('Sync Complete', 'All offline records have been pushed to Supabase cloud!');
  };

  const handleSaveVitals = async () => {
    if (!patientId) {
      Alert.alert('Error', 'Please enter a valid SEHAT ID.');
      return;
    }

    const payload = {
      sehat_id: patientId,
      bp_systolic: parseInt(bpSystolic),
      bp_diastolic: parseInt(bpDiastolic),
      pulse: parseInt(pulse),
      spo2: parseInt(spo2),
      recorded_at: new Date().toISOString(),
    };

    await localDB.enqueue('RECORD_VITALS', payload);
    await refreshQueue();

    if (isOnline) {
      handleSync();
    } else {
      Alert.alert(
        'Saved Offline 📦',
        'Vitals saved to device local database. It will auto-sync when network is connected.'
      );
    }
  };

  const handleRegisterPatient = async () => {
    if (!regName) {
      Alert.alert('Error', 'Please enter patient name.');
      return;
    }

    const fakeSeq = Math.floor(100000 + Math.random() * 900000);
    const newSehatId = `SL-MH-2026-${fakeSeq}`;

    const payload = {
      sehat_id: newSehatId,
      full_name: regName,
      village: regVillage,
      registered_at: new Date().toISOString(),
    };

    await localDB.enqueue('REGISTER_PATIENT', payload);
    await refreshQueue();

    Alert.alert(
      'Registered Offline 🎉',
      `Patient registered offline with SEHAT ID: ${newSehatId}`
    );

    setRegName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Network Status Header */}
      <View style={[styles.netHeader, isOnline ? styles.bgOnline : styles.bgOffline]}>
        <View style={styles.netInfo}>
          <Text style={styles.netDot}>{isOnline ? '🟢' : '🔴'}</Text>
          <Text style={styles.netText}>
            {isOnline ? 'Network Online — Realtime Sync Active' : 'Offline Mode — Local Cache Active'}
          </Text>
        </View>
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleNetwork}>
          <Text style={styles.toggleBtnText}>{isOnline ? 'Simulate Offline' : 'Connect Network'}</Text>
        </TouchableOpacity>
      </View>

      {/* App Header & Role Switcher */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appTitle}>SEHAT-LINK Mobile</Text>
          <Text style={styles.appSubtitle}>Offline-First Rural Healthcare Platform</Text>
        </View>

        <TouchableOpacity style={styles.syncBadge} onPress={handleSync}>
          {syncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncBadgeText}>
              📦 {pendingItems.filter(i => i.status === 'PENDING').length} Pending
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Role Picker Tabs */}
      <View style={styles.roleTabs}>
        <TouchableOpacity
          style={[styles.roleTab, role === 'health_worker' && styles.roleTabActiveHW]}
          onPress={() => setRole('health_worker')}
        >
          <Text style={[styles.roleTabText, role === 'health_worker' && styles.roleTabTextActive]}>Health Worker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === 'patient' && styles.roleTabActivePt]}
          onPress={() => setRole('patient')}
        >
          <Text style={[styles.roleTabText, role === 'patient' && styles.roleTabTextActive]}>Patient App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === 'doctor' && styles.roleTabActiveDoc]}
          onPress={() => setRole('doctor')}
        >
          <Text style={[styles.roleTabText, role === 'doctor' && styles.roleTabTextActive]}>Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === 'pharmacy' && styles.roleTabActivePharma]}
          onPress={() => setRole('pharmacy')}
        >
          <Text style={[styles.roleTabText, role === 'pharmacy' && styles.roleTabTextActive]}>Pharmacy</Text>
        </TouchableOpacity>
      </View>

      {/* Main Body per Role */}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {role === 'health_worker' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👩‍⚕️ Health Worker Field Companion</Text>
            <Text style={styles.cardDesc}>Collect vitals, enroll village patients, and manage high-risk cases without network dependence.</Text>

            <View style={styles.subTabs}>
              <TouchableOpacity
                style={[styles.subTab, activeTab === 'vitals' && styles.subTabActive]}
                onPress={() => setActiveTab('vitals')}
              >
                <Text style={styles.subTabText}>Record Vitals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTab, activeTab === 'register' && styles.subTabActive]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={styles.subTabText}>Enroll Patient</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTab, activeTab === 'sync' && styles.subTabActive]}
                onPress={() => setActiveTab('sync')}
              >
                <Text style={styles.subTabText}>Sync Queue ({pendingItems.length})</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'vitals' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Patient SEHAT ID</Text>
                <TextInput
                  style={styles.inputFontMono}
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholder="SL-MH-2026-000001"
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Systolic BP (mmHg)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={bpSystolic} onChangeText={setBpSystolic} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Diastolic BP (mmHg)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={bpDiastolic} onChangeText={setBpDiastolic} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Pulse (bpm)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={pulse} onChangeText={setPulse} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>SpO2 (%)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={spo2} onChangeText={setSpo2} />
                  </View>
                </View>

                <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveVitals}>
                  <Text style={styles.btnPrimaryText}>Save Vitals Record {isOnline ? '(Sync Now)' : '(Queue Offline)'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'register' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Patient Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="e.g. Shantaram Shinde"
                />

                <Text style={styles.label}>Village / Gram Panchayat</Text>
                <TextInput
                  style={styles.input}
                  value={regVillage}
                  onChangeText={setRegVillage}
                  placeholder="Nimgaon"
                />

                <TouchableOpacity style={styles.btnPrimary} onPress={handleRegisterPatient}>
                  <Text style={styles.btnPrimaryText}>Generate SEHAT ID & Register</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'sync' && (
              <View style={styles.queueContainer}>
                <Text style={styles.queueTitle}>Pending Local Sync Queue</Text>
                {pendingItems.length === 0 ? (
                  <Text style={styles.emptyText}>All local records are in sync with Supabase!</Text>
                ) : (
                  pendingItems.map((item) => (
                    <View key={item.id} style={styles.queueItem}>
                      <View>
                        <Text style={styles.queueAction}>{item.action}</Text>
                        <Text style={styles.queueTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                      </View>
                      <Text style={[styles.statusBadge, item.status === 'SYNCED' ? styles.stSynced : styles.stPending]}>
                        {item.status}
                      </Text>
                    </View>
                  ))
                )}
                <TouchableOpacity style={styles.btnSecondary} onPress={handleSync}>
                  <Text style={styles.btnSecondaryText}>Force Push All to Supabase</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {role === 'patient' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 Patient SEHAT Digital Pass</Text>
            <View style={styles.sehatCard}>
              <Text style={styles.sehatLabel}>SEHAT HEALTH ID</Text>
              <Text style={styles.sehatId}>SL-MH-2026-000001</Text>
              <Text style={styles.sehatName}>Priya Ramesh Patil</Text>
              <Text style={styles.sehatSub}>Blood Group: B+ · Nimgaon, Khed, Pune</Text>
            </View>

            <Text style={styles.sectionHeader}>Active Prescriptions</Text>
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>Rx-2026-0901-01 (Dr. Rajesh Sharma)</Text>
              <Text style={styles.listSub}>Amoxicillin 500mg · Paracetamol 650mg</Text>
              <Text style={styles.listBadge}>Fulfilled at LifeCare Pharmacy</Text>
            </View>
          </View>
        )}

        {role === 'doctor' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👨‍⚕️ Doctor Field Consultation</Text>
            <Text style={styles.cardDesc}>Lookup SEHAT ID & scan handwritten paper prescriptions using mobile camera.</Text>

            <Text style={styles.label}>Enter Patient SEHAT ID</Text>
            <TextInput style={styles.inputFontMono} value={patientId} onChangeText={setPatientId} />

            <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert('Camera Launched', 'Paper prescription scanner active.')}>
              <Text style={styles.btnPrimaryText}>📷 Scan & Upload Prescription</Text>
            </TouchableOpacity>
          </View>
        )}

        {role === 'pharmacy' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💊 Pharmacy Dispensing Terminal</Text>
            <Text style={styles.cardDesc}>Patient presents SEHAT ID → Unlock & Dispense prescribed medicines.</Text>

            <Text style={styles.label}>Patient SEHAT ID</Text>
            <TextInput style={styles.inputFontMono} value={patientId} onChangeText={setPatientId} />

            <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert('Verification Success', 'Active prescription unlocked for SL-MH-2026-000001.')}>
              <Text style={styles.btnPrimaryText}>Verify & Dispense Items</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  netHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bgOnline: {
    backgroundColor: '#065f46',
  },
  bgOffline: {
    backgroundColor: '#991b1b',
  },
  netInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netDot: {
    fontSize: 12,
  },
  netText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  appBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  appSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  syncBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  roleTabActiveHW: { backgroundColor: '#059669' },
  roleTabActivePt: { backgroundColor: '#0284c7' },
  roleTabActiveDoc: { backgroundColor: '#7c3aed' },
  roleTabActivePharma: { backgroundColor: '#d97706' },
  roleTabText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  body: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bodyContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 18,
  },
  subTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  subTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  subTabActive: {
    backgroundColor: '#2563eb',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  formGroup: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  inputFontMono: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
    gap: 4,
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  queueContainer: {
    gap: 8,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  queueAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  queueTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stPending: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  stSynced: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  sehatCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sehatLabel: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sehatId: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  sehatName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sehatSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  listSub: {
    fontSize: 11,
    color: '#64748b',
    marginVertical: 2,
  },
  listBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
});
