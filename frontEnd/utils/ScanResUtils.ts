/**
 * Define types for expected backend JSON responses. Assess
 * the type of response received by searching/comparing keys.
 * In other words, assess whether only the SDS or 
 * or all of the expected container data fields have been 
 * returned.
 */

type ContainerData = {
    container: string;
    chemical_name: string;
    cas_number: string;
    expr_date: string
    acqn_date: string;
    location: string;
    quantity: string;
    sds_sheet: string;
}; // type containerData


type SdsResponse = {
    sds_sheet: string;
}; // type sdsData

// Assess JSON response structure type.
type ContainerResponse = ContainerData | SdsResponse;


type PopupData = {
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
}; // type PopupData

// if ()

// Parse data from JSON object. 
/*function handleContainerResponse(data) {
    


} */ // function handleContainerResponse



