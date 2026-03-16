import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import React, { useState, useCallback } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';

type User = {
  name: string;
  email: string;
  accountType: string;
  image?: string | null;
};

type SettingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  danger?: boolean;
};

export default function Profile() {

  const router = useRouter();

  const [updateVisible,setUpdateVisible]=useState(false)
  const [aboutVisible,setAboutVisible]=useState(false)
  const [logoutVisible,setLogoutVisible]=useState(false)
  const [refreshing, setRefreshing] = useState(false);

  const [localUser, setLocalUser] = useState<User>({
    name: 'Loading...',
    email: '',
    accountType: 'Admin Account',
    image: null,
  });

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('adminUser');
      console.log('AsyncStorage adminUser:', storedUser); // Debugging log
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setLocalUser({
          name: parsed.name || 'Admin',
          email: parsed.email || 'No email provided',
          accountType: parsed.role || 'Admin Account',
          image: null,
        });
      } else {
        setLocalUser({
          name: 'Not available',
          email: 'Please log in again',
          accountType: 'Admin Account',
          image: null,
        });
      }
    } catch (e) {
      console.log('Error loading user data', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const settings: SettingItem[] = [
    {
      id: '1',
      icon: 'refresh',
      title: 'App Update',
      subtitle: 'Check for latest updates',
    },
    {
      id: '2',
      icon: 'information-circle-outline',
      title: 'About Us',
      subtitle: 'Learn more about our company',
    },
    {
      id: '3',
      icon: 'log-out-outline',
      title: 'Logout',
      danger: true,
    },
  ];

  const handlePress = (item: SettingItem) => {

    if(item.id==='1'){
      setUpdateVisible(true)
    }

    if(item.id==='2'){
      setAboutVisible(true)
    }

    if(item.id==='3'){
      setLogoutVisible(true)
    }

  };

  const SettingRow = ({
    item,
    isLast,
  }: {
    item: SettingItem;
    isLast: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !isLast && styles.divider,
      ]}
      activeOpacity={0.7}
      onPress={() => handlePress(item)}
    >

      <View style={styles.iconContainer}>
        <Ionicons
          name={item.icon}
          size={22}
          color={item.danger ? '#D32F2F' : COLORS.primary}
        />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.settingTitle,
            item.danger && { color: '#D32F2F' },
          ]}
        >
          {item.title}
        </Text>

        {item.subtitle && (
          <Text style={styles.settingSubtitle}>
            {item.subtitle}
          </Text>
        )}
      </View>

      {!item.danger && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#aaa"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
            />
        }
    >

      {/* PROFILE HEADER */}

      <View style={styles.profileHeader}>
        {localUser.image ? (
          <Image source={{ uri: localUser.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color={COLORS.textSecondary} />
          </View>
        )}

        <Text style={styles.name}>{localUser.name}</Text>
        <Text style={styles.email}>{localUser.email}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {localUser.accountType}
          </Text>
        </View>
      </View>

      {/* SETTINGS */}

      <View style={styles.section}>
        {settings.map((item, index) => (
          <SettingRow
            key={item.id}
            item={item}
            isLast={index === settings.length - 1}
          />
        ))}
      </View>


{/* ================= APP UPDATE MODAL ================= */}

<Modal transparent visible={updateVisible} animationType="fade">

<View style={styles.overlay}>
<View style={styles.modalCard}>

<Ionicons name="checkmark-circle" size={70} color={COLORS.success}/>

<Text style={styles.modalTitle}>No Updates</Text>

<Text style={styles.modalText}>
You are using the latest version
</Text>

<TouchableOpacity
style={styles.modalBtn}
onPress={()=>setUpdateVisible(false)}
>
<Text style={styles.btnText}>OK</Text>
</TouchableOpacity>

</View>
</View>

</Modal>



{/* ================= ABOUT MODAL ================= */}

<Modal transparent visible={aboutVisible} animationType="fade">

<View style={styles.overlay}>
<View style={styles.modalCard}>

<View style={styles.aboutHeader}>
<Text style={styles.aboutTitle}>About</Text>

<TouchableOpacity
onPress={()=>setAboutVisible(false)}
>
<Ionicons name="close" size={24} color={COLORS.text}/>
</TouchableOpacity>
</View>

<View style={styles.logoCircle}>
<Text style={styles.logoText}>AB</Text>
</View>

<Text style={styles.appName}>AnushaBazaar</Text>

<Text style={styles.appSub}>
AnushaBazaar Business App
</Text>

<Text style={styles.version}>Version 1.0.0</Text>

<Text style={styles.copy}>
©2026 AnushaBazaar. All Rights Reserved
</Text>

</View>
</View>

</Modal>



{/* ================= LOGOUT MODAL ================= */}

<Modal transparent visible={logoutVisible} animationType="fade">

<View style={styles.overlay}>
<View style={styles.modalCard}>

<View style={styles.logoCircle}>
  <Ionicons name="log-out-outline" size={32} color={COLORS.background} />
</View>

<Text style={styles.modalTitle}>Log Out?</Text>

<Text style={styles.modalText}>
You will be signed out of your account and redirected to the login screen
</Text>

<View style={styles.btnRow}>

<TouchableOpacity
style={styles.cancelBtn}
onPress={()=>setLogoutVisible(false)}
>
<Text style={styles.cancelText}>Cancel</Text>
</TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                await AsyncStorage.multiRemove(['adminToken', 'adminUser']);
                router.replace('/login');
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

</View>

</View>
</View>

</Modal>


    </ScrollView>
  );
}

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:COLORS.background},

profileHeader:{
alignItems:'center',
paddingTop:40,
paddingBottom:25
},

avatar:{
width:110,
height:110,
borderRadius:55,
marginBottom:15
},

avatarPlaceholder:{
width:110,
height:110,
borderRadius:55,
backgroundColor:COLORS.surface,
justifyContent:'center',
alignItems:'center',
marginBottom:15
},

name:{
color:COLORS.text,
fontSize:20,
fontWeight:'bold'
},

email:{
color:COLORS.textSecondary,
marginTop:4
},

badge:{
marginTop:8,
backgroundColor:COLORS.primary,
paddingHorizontal:12,
paddingVertical:4,
borderRadius:20
},

badgeText:{
fontWeight:'bold',
color:COLORS.background,
fontSize:12
},

section:{
backgroundColor:COLORS.surface,
marginHorizontal:15,
borderRadius:15,
paddingVertical:5
},

settingRow:{
flexDirection:'row',
alignItems:'center',
paddingVertical:18,
paddingHorizontal:15
},

divider:{
borderBottomWidth:1,
borderBottomColor:COLORS.border
},

iconContainer:{
width:35,
alignItems:'center'
},

textContainer:{
flex:1,
marginLeft:10
},

settingTitle:{
color:COLORS.text,
fontSize:16,
fontWeight:'600'
},

settingSubtitle:{
color:COLORS.textSecondary,
fontSize:12,
marginTop:2
},

overlay:{
flex:1,
backgroundColor:'rgba(0,0,0,0.7)',
justifyContent:'center',
alignItems:'center'
},

modalCard:{
width:'85%',
backgroundColor:COLORS.background,
borderRadius:15,
padding:25,
alignItems:'center',
borderWidth: 1,
borderColor: COLORS.border,
},

modalTitle:{
fontSize:20,
color:COLORS.text,
fontWeight:'bold',
marginTop:10
},

modalText:{
color:COLORS.textSecondary,
textAlign:'center',
marginTop:10
},

modalBtn:{
backgroundColor:COLORS.primary,
marginTop:20,
paddingVertical:10,
paddingHorizontal:25,
borderRadius:8
},

btnText:{
fontWeight:'bold',
color:COLORS.background
},

aboutHeader:{
width:'100%',
flexDirection:'row',
justifyContent:'space-between',
marginBottom:10
},

aboutTitle:{
color:COLORS.text,
fontSize:18,
fontWeight:'bold'
},

logoCircle:{
width:70,
height:70,
borderRadius:35,
backgroundColor:COLORS.primary,
justifyContent:'center',
alignItems:'center',
marginVertical:10
},

logoText:{
fontSize:24,
fontWeight:'bold',
color:COLORS.background
},

appName:{
color:COLORS.text,
fontSize:20,
fontWeight:'bold'
},

appSub:{
color:COLORS.textSecondary,
marginTop:4
},

version:{
color:COLORS.primary,
marginTop:6
},

copy:{
color:COLORS.textSecondary,
fontSize:12,
marginTop:10
},

btnRow:{
flexDirection:'row',
marginTop:20
},

cancelBtn:{
marginRight:20
},

cancelText:{
color:COLORS.textSecondary
},

logoutBtn:{
backgroundColor:COLORS.error,
paddingVertical:8,
paddingHorizontal:18,
borderRadius:6
},

logoutText:{
color:COLORS.white,
fontWeight:'bold'
}

});