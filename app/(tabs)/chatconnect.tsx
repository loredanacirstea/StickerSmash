import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import * as WeshnetExpo from "@berty/weshnet-expo";
import * as base64 from "base64-js";
import * as protocolpb from '@berty/weshnet-expo/build/api/protocoltypes.pb';
import { useRouter } from 'expo-router';
import { TextEncoder } from 'text-encoding';
import { ownMetadata } from '@/components/utils';

export default function ChatConnectScreen() {
    const router = useRouter();
    const route = useRoute();
    const theme = useTheme();
    const { colors } = theme;

    // Get contactrequest from route params and decode if present
    const contactrequest = route.params?.contactrequest ?
        decodeURIComponent(route.params.contactrequest) : null;

    const metadata = route.params?.metadata ?
    decodeURIComponent(route.params.metadata) : null;

    const encoder = new TextEncoder(); // Default encoding is UTF-8
    const metadataarr = encoder.encode(metadata);

    console.log("--ChatConnectScreen contactrequest--", metadata, contactrequest)

    const [isProcessing, setIsProcessing] = useState(false); // Add state for processing status
    const [error, setError] = useState<string | null>(null); // Add error state


    useEffect(() => {
        async function handleContactRequest() {
            if (!contactrequest) return;

            setIsProcessing(true);
            setError(null);

            try {
                // Initialize weshnet
                const weshnetClient = await WeshnetExpo.init();
                await weshnetClient.contactRequestEnable({});

                const info = await weshnetClient.serviceGetConfiguration({});
                console.log("--info--", info)

                const contactreq = decodeURIComponent(contactrequest)

                console.log("-contactreq-", contactreq)

                // Decode the base64 contact request first
                const decodedBase64 = base64.toByteArray(contactreq);

                // Decode the contact request
                const decodedContact = await weshnetClient.decodeContact({
                    encodedContact: decodedBase64
                });

                console.log("-decodedContact-", decodedContact)

                // Accept the contact request
                if (decodedContact?.contact?.pk) {
                    console.log("---decodedContact", decodedContact.contact)

                    // @ts-ignore
                    const weshnettypes = protocolpb.default.nested.weshnet.nested.protocol.nested.v1.nested
                    // const accreq = weshnettypes.ContactRequestAccept.create({
                    //     contactPk: pk
                    // })
                    // console.log("---accreq", accreq)
                    // const encoded = weshnettypes.ContactRequestAccept.encode(accreq).finish()
                    // console.log("---encoded", encoded)
                    // const encoded2 = weshnettypes.ContactRequestAccept.encode({
                    //     contactPk:pk
                    // }).finish()
                    // console.log("---encoded2", encoded2)

                    const contact = weshnettypes.ShareableContact.create({
                        pk: decodedContact.contact.pk,
                        publicRendezvousSeed: decodedContact.contact.publicRendezvousSeed,
                        metadata: metadataarr,
                    })

                    console.log("--contactRequestSend---")

                    try {
                        const contactReq = await weshnetClient.contactRequestSend({
                            contact: contact,
                            ownMetadata: ownMetadata,
                        });
                        console.log("--contactReq---", contactReq)
                        // router.navigate('/chat', {});
                    } catch (err) {
                        console.error('Error sending contact request:', err);
                        setError(err instanceof Error ? err.message : 'Failed to send contact request');
                    }

                    console.log("--groupMetadataList--")

                    const metadataStream = await weshnetClient.groupMetadataList({
                        groupPk: info.accountGroupPk, // decodedContact.contact.pk,
                    })
                    metadataStream.onMessage((rep, err) => {
                        console.log("--metadataStream accountGroupPk onMessage--", err, rep);

                    })
                    await metadataStream.start();

                    // const metadataStream2 = await weshnetClient.groupMetadataList({
                    //     groupPk: decodedContact.contact.pk,
                    // })
                    // metadataStream2.onMessage((rep, err) => {
                    //     console.log("--metadataStream2 decodedContact onMessage--", err, rep);

                    // })
                    // await metadataStream2.start();

                    // console.log("--groupMessageList--")

                    // const msgStream = await weshnetClient.groupMessageList({
                    //     groupPk: decodedContact.contact.pk,
                    // })
                    // msgStream.onMessage((rep, err) => {
                    //     console.log("--msgStream onMessage--", err, rep);

                    // })
                    // await msgStream.start();



                    // console.log("--contactRequestAccept--")
                    // try {
                    //     const acceptResponse = await weshnetClient.contactRequestAccept({
                    //         contactPk: decodedContact.contact.pk,
                    //     });
                    //     console.log("--acceptResponse--", acceptResponse)
                    //     router.navigate('/chat', {});
                    // } catch (err) {
                    //     console.error('Error accepting contact request:', err);
                    //     setError(err instanceof Error ? err.message : 'Failed to accept contact request');
                    // }

                    // try {
                    //     const msgResp = await weshnetClient.appMessageSend({
                    //         group_pk: decodedContact.contact.pk,
                    //         payload: encoder.encode("hello"),
                    //     });
                    //     console.log("--msgResp--", msgResp)
                    //     // router.navigate('/chat', {});
                    // } catch (err) {
                    //     console.error('Error sending contact request:', err);
                    //     setError(err instanceof Error ? err.message : 'Failed to send contact request');
                    // }
                }
            } catch (err) {
                console.error('Error processing contact request:', err);
                setError(err instanceof Error ? err.message : 'Failed to process contact request');
            } finally {
                setIsProcessing(false);
            }
        }

        handleContactRequest();
    }, [contactrequest, router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40, paddingTop: 40 }}>
            <Text>Processing contact request: {contactrequest}</Text>
        {isProcessing ? (
            <Text style={{ color: colors.text }}>Processing contact request...</Text>
        ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
            <Text style={{ color: colors.text }}>Ready to connect</Text>
        )}
        </View>
    );
}
