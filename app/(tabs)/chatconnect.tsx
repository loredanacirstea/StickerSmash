import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import * as WeshnetExpo from "@berty/weshnet-expo";
import * as base64 from "base64-js";
import * as protocolpb from '@berty/weshnet-expo/build/api/protocoltypes.pb';
import { useRouter } from 'expo-router';

export default function ChatConnectScreen() {
    const router = useRouter();
    const route = useRoute();
    const theme = useTheme();
    const { colors } = theme;

    // Get contactrequest from route params and decode if present
    const contactrequest = route.params?.contactrequest ?
        decodeURIComponent(route.params.contactrequest) : null;

    console.log("--ChatConnectScreen contactrequest--", contactrequest)

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
                    const pk: Uint8Array = decodedContact.contact.pk
                    console.log("---pk", pk)

                    // // @ts-ignore
                    // const weshnettypes = protocolpb.default.nested.weshnet.nested.protocol.nested.v1.nested
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

                    try {
                        const acceptResponse = await weshnetClient.contactRequestAccept({
                            contactPk: pk,
                        });
                        console.log("--acceptResponse--", acceptResponse)
                        router.navigate('/chat', {});
                    } catch (err) {
                        console.error('Error accepting contact request:', err);
                        setError(err instanceof Error ? err.message : 'Failed to accept contact request');
                    }
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
