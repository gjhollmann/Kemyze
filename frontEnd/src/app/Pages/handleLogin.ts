// // --- handleLogin.ts ---
// // This function handles the login logic for KM-131.
// // It receives email and password from KM-130's input boxes via the onLogin prop in login.tsx,
// // validates them, and sends a GET request to the backend as specified in KM-127.

// // TODO: Replace this with the actual backend base URL from KM-127
// const BASE_URL = "https://kemyze.vercel.app";

// // The shape of a successful login response from the backend
// interface LoginSuccess {
//   userID: number;
//   accessLevel: string;
// }

// // The shape of the result this function returns back to the UI
// interface LoginResult {
//   success: boolean;
//   message: string;
//   data?: LoginSuccess;
// }

// // --- handleLogin ---
// // Called by the onLogin prop in login.tsx when the user presses "Log In".
// // Validates inputs, sends GET request to backend, and returns a result object.
// export async function handleLogin(email: string, password: string): Promise<LoginResult> {

//   // --- Validation ---
//   // Check for null or empty inputs before sending anything to the backend.
//   // This satisfies the acceptance requirement: "Invalid inputs are not allowed."
//   if (!email || email.trim() === "") {
//     return { success: false, message: "Email is required." };
//   }

//   if (!password || password.trim() === "") {
//     return { success: false, message: "Password is required." };
//   }

//   // --- Build Request ---
//   // Backend expects GET request with "User" and "Password" as query parameters.
//   // Format confirmed from KM-127's views.py: request.GET.get("User") and request.GET.get("Password")
//   const params = new URLSearchParams({
//     User: email.trim(),
//     Password: password.trim(),
//   });

//   try {
//     // --- Send GET Request ---
//     const response = await fetch(`${BASE_URL}/login/?${params.toString()}`, {
//       method: "GET",
//     });

//     // --- Handle Response ---
//     if (response.ok) {
//       // Backend returned 200 — login successful
//       // Response contains { userID, accessLevel } as defined in KM-127's views.py
//       const data: LoginSuccess = await response.json();
//       return { success: true, message: "Login successful.", data };
//     } else {
//       // Backend returned an error (e.g. 400 Bad Request — wrong credentials or missing params)
//       const errorText = await response.text();
//       return { success: false, message: errorText || "Login failed." };
//     }

//   } catch (error) {
//     // Network error — backend unreachable
//     return { success: false, message: "Could not connect to server. Please try again." };
//   }
// }
const BASE_URL = "https://kemyze.vercel.app";

interface LoginSuccess {
  userID: number;
  accessLevel: string;
}

interface LoginResult {
  success: boolean;
  message: string;
  data?: LoginSuccess;
}

export async function handleLogin(email: string, password: string): Promise<LoginResult> {
  if (!email || email.trim() === "") {
    return { success: false, message: "Email is required." };
  }

  if (!password || password.trim() === "") {
    return { success: false, message: "Password is required." };
  }

  const params = new URLSearchParams({
    User: email.trim(),
    Password: password.trim(),
  });

  try {
    const response = await fetch(`${BASE_URL}/login/?${params.toString()}`, {
      method: "GET",
    });

    if (response.ok) {
      const data: LoginSuccess = await response.json();

      console.log("Login response received:", data);

      return { success: true, message: "Login successful.", data };
    } else {
      const errorText = await response.text();
      return { success: false, message: errorText || "Login failed." };
    }
  } catch (error) {
    return {
      success: false,
      message: "Could not connect to server. Please try again.",
    };
  }
}