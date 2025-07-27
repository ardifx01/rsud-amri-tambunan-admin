import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";
import readline from "readline";

// Path token.json
const TOKEN_PATH = path.resolve(__dirname, "../../config/token.json");

// Fungsi untuk membaca kredensial dari file token.json
function loadCredentialsFromFile(): Record<string, any> {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Token file not found at ${TOKEN_PATH}`);
  }

  const fileContent = fs.readFileSync(TOKEN_PATH, "utf8");
  const credentials = JSON.parse(fileContent);

  if (!credentials.web) {
    throw new Error("Invalid credentials format: 'web' object missing");
  }

  return credentials.web;
}

// Load kredensial dari file atau .env jika tidak ada
const credentials = loadCredentialsFromFile();

// Konfigurasi OAuth2 untuk Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const oAuth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Fungsi untuk menyimpan token ke file
function saveToken(token: Record<string, any>) {
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
    console.log(`Token saved to ${TOKEN_PATH}`);
  } catch (error) {
    console.error("Failed to save token:", error);
  }
}

// Fungsi untuk membaca token dari file
function loadToken(): Record<string, any> | null {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch (error) {
    console.error("Error loading token:", error);
    return null;
  }
}

// Fungsi untuk mendapatkan token akses
export async function getAccessToken() {
  try {
    // Coba muat token dari file jika sudah ada
    const existingToken = loadToken();
    if (existingToken) {
      oAuth2Client.setCredentials(existingToken);
      console.log("Using existing token.");
      return existingToken;
    }

    // Jika token tidak ada, minta kode otorisasi baru
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this URL:", authUrl);

    // Minta kode otorisasi dari pengguna menggunakan readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise<string>((resolve) => {
      rl.question("Enter the authorization code: ", (code: string) => {
        rl.close();
        resolve(code.trim());
      });
    });

    if (!code) {
      throw new Error("Authorization code is required.");
    }

    // Dapatkan token menggunakan kode otorisasi
    const response = await oAuth2Client.getToken(code);

    // Validasi respons
    if (!response || !response.tokens) {
      throw new Error("Invalid token response");
    }

    // Set kredensial OAuth2
    oAuth2Client.setCredentials(response.tokens);
    saveToken(response.tokens); // Simpan token ke file
    console.log("Access token retrieved and saved successfully.");
    return response.tokens;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    throw error;
  }
}

// Ekspor oAuth2Client agar dapat digunakan di file lain
export { oAuth2Client };
