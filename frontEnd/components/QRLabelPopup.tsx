import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions, Platform, } from "react-native";
import { useState, useRef } from "react";
import QRCode from 'react-native-qrcode-svg';
import { handlePrintLabel } from "../utils/PrintLabelUtils";
console.log("handlePrintLabel:", handlePrintLabel);

type QRLabelPopupProps = {
    visible: boolean;
    onClose: () => void;
    containerId: number;
    chemicalName: string;
} // type QRLabelPopupProps

export function QRLabelPopup({
    visible,
    onClose,
    containerId,
    chemicalName
}: QRLabelPopupProps) {
    // Scaling with window dimensions.
    const qrRef = useRef<any>(null);
    const { width, height } = useWindowDimensions();
    const popupWidth = Math.min(width * 0.88, 420);
    const popupMaxHeight = height * 0.85;
    const qrSize = Math.min(Math.max(popupWidth * 0.7, 180), 280);

    // Call print handler; pass id, name, and qr data, which is further converted into base64 text
    // that is embedded into printable HTML.
    const onPrintPress = () => {
        if (!qrRef.current) {
        return;
        }

        qrRef.current.toDataURL((data: string) => {
            const qrData = `data:image/png;base64,${data}`;

            handlePrintLabel(
                containerId,
                chemicalName,
                qrData
            );
        });
    }; // const onPrintPress

    return(
        <Modal visible={visible} transparent animationType="fade">
            <View style={styling.overlay}>

                <View
                    style={[
                        styling.container,
                        {
                        width: popupWidth,
                        maxHeight: popupMaxHeight,
                        },
                    ]}
                >

                <Text>{chemicalName}</Text>
                <View
                    style={[
                        styling.qrLabelArea,
                        {width: qrSize, height: qrSize, alignItems: "center", justifyContent: "center"}
                    ]}
                >
            
                <QRCode value={String(containerId)} 
                    size={qrSize - 20}
                    getRef={(ref) => {
                        qrRef.current = ref;
                    }}
                />
                </View>   
                
                <Pressable onPress={onClose} style={styling.closeButton}>
                    <Text>Done</Text> 
                </Pressable>

                <Pressable onPress={onPrintPress}style={styling.printLabelButton}>
                    <Text style={styling.printLabelButtonText}>Print this QR label</Text>
                </Pressable>
                
                </View>
            </View>
        </Modal>
    )
} // export function QRLabelPopup

const styling = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingTop: 38,
        paddingHorizontal: 20,
        paddingBottom: 45,            
        alignItems: "center",
    },

    qrLabelArea: {
        backgroundColor: '#e5e7eb'
    },

    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
    },

    printLabelButton: {
        backgroundColor: '#6e99ef',
        alignSelf: 'center',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 16,
    },

    printLabelButtonText: {
        textAlign: 'center',
        color: 'white',
    },
}) // const styling








