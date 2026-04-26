import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// Capture base64 encoded blob.
export async function openBase64Pdf(base64: string) {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("No PDF data was provided.");
  }

  if (Platform.OS === "web") {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length); 

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers); // Convert to byte arrays.
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
    return;
  }

  try {
    const fileUri = `${FileSystem.cacheDirectory}container-sds.pdf`;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // File share.
    const canShare = await Sharing.isAvailableAsync();
    
    if (!canShare) {
      throw new Error("PDF viewing is not available on this device.");
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: "Open SDS PDF",
      UTI: "com.adobe.pdf",
    });
  
  } catch {
    throw new Error("Failed to open SDS PDF.");
  
  } // try ...
} // export async function openBase64Pdf

