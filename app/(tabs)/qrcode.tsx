import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRoute, useTheme } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';

type QRCodeModalProps = {
    uitype?: string;
    codetype?: string;
    props?: {
        value?: string;
        size?: number;
    };
};

export default function QRCodeModal() {
    const route = useRoute();
    const theme = useTheme();
    const { colors } = theme;

    // Get parameters from route
    const params = route.params as QRCodeModalProps;
    const qrValue = params?.props?.value || '';
    const qrSize = params?.props?.size || 200;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        qrContainer: {
            padding: 20,
            backgroundColor: colors.card,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.qrContainer}>
                { qrValue && <QRCode
                    value={qrValue}
                    size={qrSize}
                    backgroundColor={colors.card}
                    color={colors.text}
                />}
                {!qrValue && <ThemedText>no url to show</ThemedText>}
            </View>
        </View>
    );
}
