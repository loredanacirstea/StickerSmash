import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WeshnetExpo from "@berty/weshnet-expo";
import * as base64 from "base64-js";
import { ProtocolServiceClient } from '@berty/weshnet-expo/build/weshnet.types.gen';

export default function ChatScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const { colors } = theme;

    const [weshnetClient, setWeshnetClient] = useState<ProtocolServiceClient | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [encodedContact, setEncodedContact] = useState<string | null>(null);

    useEffect(() => {
        async function initializeWeshnet() {
            try {
                // Initialize weshnet client
                const client = await WeshnetExpo.init();
                setWeshnetClient(client);

                // Get configuration
                const info = await client.serviceGetConfiguration({});
                console.log("--info--", info)
                if (info?.peerId) {
                    setPeerId(info.peerId);
                    await client.contactRequestEnable({});
                }

                // Share contact
                const shareInfo = await client.shareContact({});
                console.log("--shareInfo--", shareInfo)
                if (shareInfo?.encodedContact) {
                    const encoded = base64.fromByteArray(shareInfo.encodedContact);
                    setEncodedContact(encoded);
                }
            } catch (err) {
                console.error('Error initializing weshnet:', err);
            }
        }

        initializeWeshnet();
    }, []);

    const handleShareQRCode = () => {
        if (!encodedContact) return;

        const qrcodeUrl = `myapp://chatconnect?contactrequest=${encodeURIComponent(encodedContact)}`;
        console.log("--qrcodeUrl--", qrcodeUrl)
        navigation.navigate('qrcode', { props: { value: qrcodeUrl }});
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            marginTop: 40,
            paddingTop: 40,
        },
        btn: {
            padding: 5,
            margin: 10,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 10
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 20,
            width: '100%'
        }
    });

    return (
        <View style={styles.container}>
            {!peerId ? (
                <Text style={{ color: colors.text }}>Loading Weshnet...</Text>
            ) : (
                <View>
                    <Text style={{ color: colors.text }}>
                        hello my peerid is: {peerId}
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.btn}
                            onPress={handleShareQRCode}
                        >
                            <Ionicons
                                name="share-social-outline"
                                size={18}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
