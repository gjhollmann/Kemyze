import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from "react-native"

type ScanPopupProps = {
    visible: boolean;
    onClose: () => void;
    scanResult: ScanData | null;
};

export function ScanPopup({
    visible,
    onClose,
}: ScanPopupProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styling.overlay}>
                <View style={styling.container}>
                    <Pressable onPress={onClose} style={styling.closeButton}>
                        <Text>X</Text>
                    </Pressable>

                    <Text>Chemical Name:</Text>
                    <Text>CAS:</Text>

                </View>
            </View>
        </Modal>
    );
}


const styling = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0, 0)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
        width: "88%",
        maxWidth: 420,
        backgroundColor: "white",
        borderRadius: 18,
        borderWidth: 2,
        borderColor:"#1480AE",
        padding: 20,
    },

    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
    },
});


type ScanData = {
    chemicalName: string;
    cas: string;

    id: string;
    purchaseDate: string;
    expDate: string;
    
    school: string;
    roomNumber: string;
    cabinet: string;
    shelf: string;

    status: string;
    quantity: string;
}






