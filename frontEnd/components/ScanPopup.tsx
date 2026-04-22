import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native"

type ScanPopupProps = {
    visible: boolean;
    onClose: () => void;
    scanResult: ScanData | null;
};

export function ScanPopup({
    visible,
    onClose,
    scanResult,
}: ScanPopupProps) {
    const { width, height } = useWindowDimensions();

    const popupWidth = Math.min(width * 0.88, 420);
    const popupMaxHeight = height * 0.85;
    const qrSize = Math.min(Math.max(width * 0.22, 72), 100);

    return (
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
                    <Pressable onPress={onClose} style={styling.closeButton}>
                        <Text>X</Text>
                    </Pressable>

                    <View style={styling.top}>
                        <View
                            style={[
                                styling.qrPlaceholder,
                                {
                                    width: qrSize,
                                    height: qrSize,
                                },
                            ]}
                        />
                        <View style={styling.topTextArea}>
                            <Text style={styling.chemicalNameText}>
                                {scanResult?.chemicalName}
                            </Text>

                            <Text style={styling.casText}>
                                CAS: {scanResult?.cas}
                            </Text>
                        </View>
                    </View>

                    <View style={styling.partition}/>

                    <View style={styling.body}>
                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>ID:</Text>
                            <Text style={styling.infoValue}>{scanResult?.id}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Purchase Date:</Text>
                            <Text style={styling.infoValue}>{scanResult?.purchaseDate}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Expiration Date:</Text>
                            <Text style={styling.infoValue}>{scanResult?.expDate}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>School:</Text>
                            <Text style={styling.infoValue}>{scanResult?.school}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Room:</Text>
                            <Text style={styling.infoValue}>{scanResult?.roomNumber}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Cabinet:</Text>
                            <Text style={styling.infoValue}>{scanResult?.cabinet}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Shelf:</Text>
                            <Text style={styling.infoValue}>{scanResult?.shelf}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Status:</Text>
                            <Text style={styling.infoValue}>{scanResult?.status}</Text>
                        </View>

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Quantity:</Text>
                            <Text style={styling.infoValue}>{scanResult?.quantity}</Text>
                        </View>
                    </View>

                    <View style={styling.partition}/>

                    <View style={styling.footer}>
                        <Pressable style={styling.actionButton}>
                            <Text style={styling.actionButtonText}>View SDS</Text>
                        </Pressable>

                        <Pressable style={styling.actionButton}>
                            <Text style={styling.actionButtonText}>Download QR Label</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


const styling = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
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
        alignItems: "flex-start",
        paddingBottom: 16,
        paddingRight: 28,
        minHeight: 100,
    },

    topTextArea: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
    },

    chemicalNameText: {
        fontSize: 13,
        color: "#000000",
        marginBottom: 6,
        flexShrink: 1,
    },

    casText: {
        fontSize: 13,
        color: "#000000",
    },

    qrPlaceholder: {
        width: 90,
        height: 90,
        marginRight: 16,
        backgroundColor: "#E5E7EB",
        borderWidth: 1,
        borderColor: "#000000",
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

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    infoLabel: {
        fontSize: 12,
        color: "#000000",
        fontWeight: "600",
    },

    infoValue: {
        fontSize: 12,
        color: "#000000",
        textAlign: "right",
        flexShrink: 1,
        marginLeft: 12,
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
        backgroundColor: "#FFFFFF",
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
};






