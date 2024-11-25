import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WeshnetExpo from "@berty/weshnet-expo";
import * as protocolpb from '@berty/weshnet-expo/build/api/protocoltypes.pb';
import * as base64 from "base64-js";
import { ProtocolServiceClient } from '@berty/weshnet-expo/build/weshnet.types.gen';
import { ownMetadata } from '@/components/utils';

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
                if (!info) {
                    console.error('Error initializing weshnet: could not get service configuration');
                    return;
                }

                setPeerId(info.peerId);

                const resp = await client.contactRequestEnable({});
                console.log("--initiator contactRequestEnable resp--", resp)

                // Share contact
                const shareInfo = await client.shareContact({});
                console.log("--shareInfo--", shareInfo)
                if (shareInfo?.encodedContact) {
                    const encoded = base64.fromByteArray(shareInfo.encodedContact);
                    setEncodedContact(encoded);
                }

                // @ts-ignore
                const weshnettypes = protocolpb.default.nested.weshnet.nested.protocol.nested.v1.nested
                const weshnetEventTypes = weshnettypes.EventType.values

                // subscribe to group
                console.log("--initiator groupMetadataList--")
                let metadataStream;
                try {
                    metadataStream = await client.groupMetadataList({
                        groupPk: info.accountGroupPk,
                    })
                    metadataStream.onMessage(async (resp, err) => {
                        console.log("--initiator metadataStream onMessage--", err, resp);
                        if (err != null) {
                            console.error("initiator group metadata on message error", err)
                        }
                        console.log("--initiator metadataStream onMessage metadata--", resp.metadata);
                        console.log("--initiator metadataStream onMessage eventType--", resp.metadata.eventType, weshnetEventTypes.EventTypeAccountContactRequestIncomingReceived)
                        if (resp.metadata.eventType == weshnetEventTypes.EventTypeAccountContactRequestIncomingReceived) {
                            console.log("--initiator AccountContactRequestIncomingReceived--", resp.event)
                            const rresp = weshnettypes.AccountContactRequestIncomingReceived.decode(resp.event);
                            console.log("--initiator AccountContactRequestIncomingReceived--", rresp)

                            console.log("--initiator contactRequestAccept--")
                            try {
                                const acceptResponse = await client.contactRequestAccept({
                                    // TODO: rresp.ContactPK ????
                                    contactPk: rresp.devicePk,
                                });
                                console.log("--initiator acceptResponse--", acceptResponse)
                            } catch (err) {
                                console.error('Error accepting contact request:', err);
                                // setError(err instanceof Error ? err.message : 'Failed to accept contact request');
                                return;
                            }

                            console.log("--initiator GroupInfo--")
                            let groupInfo
                            try {
                                groupInfo = await client.groupInfo({
                                    // TODO: rresp.ContactPK ????
                                    contactPk: rresp.devicePk,
                                });
                                console.log("--initiator GroupInfo--", groupInfo)
                            } catch (err) {
                                console.error('Error groupInfo request:', err);
                                // setError(err instanceof Error ? err.message : 'Failed to accept contact request');
                                return;
                            }

                            console.log("--initiator ActivateGroup--")
                            try {
                                await client.activateGroup({
                                    // TODO: rresp.ContactPK ????
                                    groupPk: groupInfo.group.publicKey,
                                });
                            } catch (err) {
                                console.error('Error ActivateGroup request:', err);
                                // setError(err instanceof Error ? err.message : 'Failed to accept contact request');
                                return;
                            }

                            console.log("--initiator groupMessageList--")
                            let msgStream;
                            try {
                                msgStream = await client.groupMessageList({
                                    groupPk: groupInfo.group.publicKey,
                                })
                                msgStream.onMessage((rep, err) => {
                                    console.log("--initiator msgStream onMessage--", err, rep);

                                })
                                await msgStream.start();
                            } catch (e) {
                                console.error('Error subscribing to groupMessageList: ', e);
                                return;
                            }
                        }
                    })
                    await metadataStream.start();
                } catch (e) {
                    console.error('Error subscribing to groupMetadataList: ', e);
                    return;
                }


            } catch (err) {
                console.error('Error initializing weshnet:', err);
            }
        }

        initializeWeshnet();
    }, []);

    const handleShareQRCode = () => {
        if (!encodedContact) return;

        const qrcodeUrl = `myapp://chatconnect?metadata=${ownMetadata}&contactrequest=${encodeURIComponent(encodedContact)}`;
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
