import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native"

type ScanPopupProps = {
    visible: boolean;
    onClose: () => void;
    //scanResult: ScanData | null;
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

                    <View style={styling.top}>
                        <Text>Chemical Name:</Text>
                        <Text>CAS:</Text>
                    </View>

                    <View style={styling.partition}/>

                    <View style={styling.body}>
                        <Text>ID:</Text>
                        <Text>Purchase Date:</Text>
                        <Text>Expiration Date:</Text>
                        <Text>School:</Text>
                        <Text>Room:</Text>
                        <Text>Cabinet:</Text>
                        <Text>Shelf:</Text>
                        <Text>Status:</Text>
                        <Text>Quantity:</Text>
                    </View>

                    <View style={styling.partition}/>

                    <View style={styling.footer}>
                        <Text>View SDS</Text>
                        <Text>Download QR Label</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


const styling = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0, 0.5)",
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

    partition: {
       height: 1,
       backgroundColor: "#D5EAF2", 
    },

    qrImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
        marginRight: 16,
    },

    top: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 16
    },

    body: {
        paddingVertical: 12,
    },

    styledText: {
        fontSize: 12,
        color: "#000000"
    },

    styledRow: {
        marginBottom: 8,
    },

    actionButton: {
        width: "100%",
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#0B5C7A",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    actionButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0B5C7A",
    },

    footer: {
        paddingTop: 14,
    }
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






