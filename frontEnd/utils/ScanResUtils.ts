/**
 * Define types for expected backend JSON responses. Assess
 * the type of response received by searching/comparing keys.
 * In other words, assess whether only the SDS or 
 * or all of the expected container data fields have been 
 * returned.
 */

// Expected container data.
type ContainerData = {
    container_id: string;
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
        data.container_id != null 
        && data.chemical_name != null 
        && data.cas_number != null 
        && data.sds_sheet != null;

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



