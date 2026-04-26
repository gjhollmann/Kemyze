/**
 * Define types for expected backend JSON responses. Assess
 * the type of response received by searching/comparing keys.
 * In other words, assess whether only the SDS or 
 * or all of the expected container data fields have been 
 * returned.
 */

import { Alert } from "react-native";

type ContainerData = {
    container: string;
    chemical_name: string;
    cas_number: string;
    expr_date: string
    acqn_date: string;
    location: string
    quantity: string;
    sds_sheet: string;
}; // type containerData


type SdsResponse = {
    sds_sheet: string;
}; // type SdsResponse

// Assess JSON response structure type.
type ContainerResponse = ContainerData | SdsResponse;


type PopupData = {
    chemicalName: string;
    cas: string;
    id: string;
    purchaseDate: string;
    expDate: string;
    location: string
    quantity: string;
}; // type PopupData


type ContainerResult =
  | {
      resType: "invalid";
      message: string;
    }
  | {
      resType: "sds_only";
      pdfBase64: string;
    }
  | {
      resType: "all_info";
      popupData: PopupData;
      pdfBase64: string;
    }; // type ContainerResult


try {
    const containerResponse = await fetch("/containers/getContainer?kemID=<kemIDInput>&accessLevel=<accessLevelInput>");

    if (!containerResponse.ok) {
        Alert.alert("Error: The container does not exist or the request was invalid.");
    }

    const data = await containerResponse.json();
    const result = handleContainerResponse(data);

    if (result.resType === "invalid") {
        Alert.alert("Invalid Information", result.message);
    
    } else if (result.resType === "sds_only") {
        
    
    } else if (result.resType === "all_info") {

    
    } else {
        Alert.alert("Error: Unexpected response.");
    
    }

} catch (error: any) {
    if (error.name === "AbortError") {
        Alert.alert("Request timed out: The server took too long to respond.");
  
    } else if (error instanceof SyntaxError) {
        Alert.alert("Invalid response: The server returned malfomed data.");
  
    } else {
        Alert.alert("Network error: Unable to reach server.");
    
    }
} // try ...

// Parse data from JSON object. 
export function handleContainerResponse(data: any): ContainerResult {
    if (typeof data !== "object" || !data) {
        return {
            resType: "invalid",
            message: "No container data returned."
        };
    }

    // Boolean for checking whether only SDS has been returned.
    let hasOnlySds = typeof data.sds_sheet === "string" && !data.chemical_name && !data.container_id;
    
    if (hasOnlySds) {
        return {
            resType: "sds_only",
            pdfBase64: data.sds_sheet, 
        };
    }

    // Use chemical_name, cas, and ID as criteria to assess whether all 
    // container information has been returned. 
    let hasAllInfo = 
        typeof data.chemical_name === "string"
        && typeof data.cas_number === "string"
        && typeof data.container_id === "string"
        && typeof data.sds_sheet === "string";

    if (hasAllInfo) {
        return {
            resType: "all_info",
            pdfBase64: data.sds_sheet,

            popupData: {
                id: data.container_id,
                chemicalName: data.chemical_name,
                cas: data.cas_number,
                purchaseDate: data.acqn_date,
                expDate: data.expr_date,
                location: data.location,
                quantity: data.quantity
            },
        };
    } // if (hasAllInfo) { ... }

    return {
        resType: "invalid",
        message: "Invalid container response format."
    }
} // export function handleContainerResponse



