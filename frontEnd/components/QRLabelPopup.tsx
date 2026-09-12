import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useState } from "react";
import { Alert } from "react-native";

type QRLabelPopupProps = {
    visible: boolean;
    onClose: () => void;
    containerId: String;
    chemicalName: String;
} // type QRLabelPopupProps

export function QRLabelPopup({
    visible,
    onClose,
    containerId,
    chemicalName
}: QRLabelPopupProps) {
    // Scaling with window dimensions.
    const { width, height } = useWindowDimensions();
    const popupWidth = Math.min(width * 0.88, 420);
    const popupMaxHeight = height * 0.85;
    const qrSize = Math.min(Math.max(width * 0.7, 180), 280);

    return(
        <Modal visible={visible} transparent animationType="fade">
            <View style={styling.container}>
                <Text>{chemicalName}</Text>

                <View
                    style={[
                        styling.qrLabelArea,
                        {width: qrSize, height: qrSize}
                    ]}
                />    
                <Pressable onPress={onClose} style={styling.closeButton}>
                    <Text>Done</Text>
                </Pressable>
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
    },

    qrLabelArea: {
        backgroundColor: '#e5e7eb'
    },

    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 52,
    },
}) // const styling








