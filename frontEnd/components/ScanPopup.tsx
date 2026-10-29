import React from "react";
import { Modal, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import GradientButton from './GradientButton';

type ScanPopupProps = {
    visible: boolean;
    onClose: () => void;
    scanResult: ScanData | null;
    editPrivilege: boolean;
    onViewSds: () => void;
    onQrLabel: () => void; // KM-63: opens the QR label popup
    onEdit: () => void;
}; // type ScanPopupProps


export function ScanPopup({
    visible,
    onClose,
    scanResult,
    editPrivilege,
    onViewSds,
    onQrLabel,
    onEdit
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
                    <GradientButton
                        title="Done"
                        onPress={onClose}
                        width={68}
                        height={34}
                        style={styling.closeButton}
                        textStyle={styling.closeButtonText}
                    />

                    <View style={styling.top}>
                        {/*KM-191: QR code for the container, same value the QR label popup encodes.*/}
                        <View
                            style={[
                                styling.qrBox,
                                {
                                    width: qrSize,
                                    height: qrSize,
                                },
                            ]}
                        >
                            {scanResult?.id ? (
                                <QRCode value={String(scanResult.id)} size={qrSize - 8} />
                            ) : null}
                        </View>

                        {/*Top section holds image of QR code, chemical name field, and CAS. */}
                        <View style={styling.topTextArea}>
                            <Text style={styling.chemicalNameText}>
                                {scanResult?.chemicalName}
                            </Text>

                            <Text style={styling.casText}>
                                CAS: {scanResult?.cas}
                            </Text>
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
                            <Text style={styling.infoLabel}>Location:</Text>
                            <Text style={styling.infoValue}>{scanResult?.location}</Text>
                        </View>


                        {/*}
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
                        </View>*/}

                        <View style={styling.infoRow}>
                            <Text style={styling.infoLabel}>Quantity:</Text>
                            <Text style={styling.infoValue}>{scanResult?.quantity}</Text>
                        </View>
                    </View>

                    <View style={styling.partition}/>

                    {/*Footer, or bottom section, holds buttons for */}
                    <View style={styling.footer}>
                        <GradientButton
                            title="View SDS"
                            onPress={onViewSds}
                            width="100%"
                            height={44}
                            style={styling.actionButton}
                        />

                        <GradientButton
                            title="Download QR Label"
                            onPress={onQrLabel}
                            width="100%"
                            height={44}
                            style={styling.actionButton}
                            
                        />

                        {/*Third button 'Edit Information' should only be presented to privileged user. Toggled by 'editPrivilege' boolean.*/}
                        {editPrivilege && (
                            <GradientButton
                                title="Edit Information"
                                onPress={onEdit}
                                width="100%"
                                height={44}
                                style={styling.actionButton}
                            />
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

    closeButtonText: {
        fontSize: 12,
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

    qrBox: {
        width: 90,
        height: 90,
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
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
        marginBottom: 10,
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
    location: string;
    
    /*school: string;
    roomNumber: string;
    cabinet: string;
    shelf: string;*/

    //status: string;
    quantity: string;
}; // type ScanData



