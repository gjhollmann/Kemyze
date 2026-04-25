import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native"


type ScanPopupProps = {
    visible: boolean;
    onClose: () => void;
    scanResult: ScanData | null;
    editPrivilege: boolean;
}; // type ScanPopupProps


export function ScanPopup({
    visible,
    onClose,
    scanResult,
    editPrivilege
}: ScanPopupProps) {
    // Start with window dimensions for scaling.
    const { width, height } = useWindowDimensions();
    const popupWidth = Math.min(width * 0.88, 420);
    const popupMaxHeight = height * 0.85;
    const qrSize = Math.min(Math.max(width * 0.22, 72), 100);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styling.overlay}>
                <View
                    style={[
                        styling.container, // Assert with window dimensions.
                        {
                        width: popupWidth,
                        maxHeight: popupMaxHeight,
                        },
                    ]}
                    >
                    <Pressable onPress={onClose} style={styling.closeButton}>
                        <Text>Done</Text>
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

                        {/*Top section holds image of QR code, chemical name field, CAS, and quantity indicator. */}
                        <View style={styling.topTextArea}> {}
                            <Text style={styling.chemicalNameText}>
                                {scanResult?.chemicalName}
                            </Text>

                            <Text style={styling.casText}>
                                CAS: {scanResult?.cas}
                            </Text>

                            <View style={styling.quantityIndicator} />
                        </View>
                    </View>
                    
                    {/*Insert partition between each section.*/}
                    <View style={styling.partition}/>
                    
                    {/*Body, or middle section, holds most textual information (i.e., ID, room, shelf, building.*/}
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

                    {/*Footer, or bottom section, holds buttons for */}
                    <View style={styling.footer}>
                        <Pressable style={styling.actionButton}>
                            <Text style={styling.actionButtonText}>View SDS</Text>
                        </Pressable>

                        <Pressable style={styling.actionButton}>
                            <Text style={styling.actionButtonText}>Download QR Label</Text>
                        </Pressable>

                        {/*Third button 'Edit Information' should only be presented to privileged user. Toggled by 'editPrivilege' boolean.*/}
                        {editPrivilege && (
                            <Pressable style={styling.actionButton}>
                            <Text style={styling.actionButtonText}>Edit Information</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
} // export function ScanPopup({ ... }: ScanPopupProps) { ... }


// Styling for each layer and section: overlay, container, top section, etc.
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

    quantityIndicator: {
        width: 42,
        height: 42,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
        alignSelf: "flex-start",
    },

    footer: {
        paddingTop: 14,
    }
}); // const styling ... 


// All text fields to be included in scan popup; 'chemicalName' and 'cas' to be included in top section. 
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
}; // type ScanData



