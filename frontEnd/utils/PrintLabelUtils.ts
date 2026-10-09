import * as Print from 'expo-print';

// Constants for (tentative) set printing dimensions.
const LABEL_WIDTH = 144;
const LABEL_HEIGHT = 144;

// Define CSS styling separately.
const labelStyling = `
    @page {
        size: 2in 2in;
        margin: 0;
    }

    body {
        width: 2in;
        height: 2in;
        margin: 0px;
        padding: 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
    }

    .qr {
        width: 95px;
        height: 95px;
        margin-bottom: 6px;
    }

    .chemical-name {
        font-size: 10px;
        font-weight: bold;
        text-align: center;
    }

    .container-id {
        font-size: 8px;
        margin-top: 2px;
    }
`; // const labelStyling


// Define HTML structure for QR label.
const createQRLabelHtml = (
  containerId: number,
  chemicalName: string,
  qrData: string
) => {
  return `
    <html>
      <head>
        <style>
          ${labelStyling}
        </style>
      </head>

      <body>
        <img class="qr" src="${qrData}" />

        <div class="chemical-name">
          ${chemicalName}
        </div>

        <div class="container-id">
          ID: ${containerId}
        </div>
      </body>
    </html>
  `;
}; // const createQRLabelHtml


/*
 * Define label printing handler.
 * General flow: Acquire id, name, and qr data; define dimensions and
 * send them along with html structure of label format, which includes margins and padding.
 */
export const handlePrintLabel = async (
    containerId: number,
    chemicalName: string,
    qrData: string
) => {
    const labelWidth = LABEL_WIDTH; // Tentative: Define set label dimensions.
    const labelHeight = LABEL_HEIGHT; // 144 x 144 at 72 PPI.

    try {
        const html = createQRLabelHtml(
            containerId,
            chemicalName,
            qrData
        );
        
        // Provide html, defined width and height.
        await Print.printAsync({
            html: html,
            width: labelWidth,
            height: labelHeight,
        });
    } catch (error) { // Notify of print failure. 
        console.error("QR label failed to print:", error);
    } // try/catch 
}; // const handlePrintLabel





