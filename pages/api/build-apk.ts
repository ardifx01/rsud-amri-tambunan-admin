import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { oAuth2Client, getAccessToken } from "./getAccessToken";
import type { NextApiRequest, NextApiResponse } from "next";

// Fungsi untuk upload file ke Google Drive
export async function uploadFileToDrive(filePath: string, fileName: string, folderId: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist.");
    }

    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: "application/vnd.android.package-archive",
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    if (!response.data || !response.data.id) {
      throw new Error("File ID not found in the response.");
    }

    console.log(`File uploaded successfully. File ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
}

// Fungsi untuk membuat link unduhan publik
async function generatePublicLink(fileId: string): Promise<string> {
  try {
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    console.log(`Public download link: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error generating public link:", error);
    throw error;
  }
}

// Handler API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { serverIp, serverPort, isProduction, phoneNumber } = req.body;

  const flutterProjectPath = "D:/AndroidAPP/cosaapp";
  const configFilePath = path.join(flutterProjectPath, "lib/config/api_config.dart");

  if (!fs.existsSync(configFilePath)) {
    return res.status(500).json({ success: false, message: "API config file not found!" });
  }

  // Backup file konfigurasi asli
  const backupFilePath = `${configFilePath}.backup`;
  fs.copyFileSync(configFilePath, backupFilePath);

  // Update konfigurasi
  let configContent = fs.readFileSync(configFilePath, "utf8");
  configContent = configContent.replace(
    /static const String devBaseUrl = '.*';/,
    `static const String devBaseUrl = 'http://${serverIp}:${serverPort}';`
  );
  configContent = configContent.replace(
    /static const bool isProduction = .*;/,
    `static const bool isProduction = ${isProduction};`
  );
  fs.writeFileSync(configFilePath, configContent, "utf8");

  const command = `
    cd ${flutterProjectPath} && 
    flutter clean && 
    flutter pub get && 
    flutter build apk --release
  `;

  exec(command, async (error, stdout, stderr) => {
    // Restore konfigurasi asli
    fs.copyFileSync(backupFilePath, configFilePath);

    if (error) {
      console.error(`❌ Build Error: ${stderr}`);
      return res.status(500).json({ success: false, message: stderr });
    }

    // Cari APK di lokasi yang mungkin
    const possiblePaths = [
      path.join(flutterProjectPath, "build/app/outputs/flutter-apk/app-release.apk"),
      path.join(flutterProjectPath, "build/app/outputs/apk/release/app-release.apk"),
    ];

    let foundApkPath = "";
    for (const apkPath of possiblePaths) {
      if (fs.existsSync(apkPath)) {
        foundApkPath = apkPath;
        break;
      }
    }

    if (!foundApkPath) {
      return res.status(500).json({ success: false, message: "APK file not found after build." });
    }

    // Upload APK ke Google Drive
    try {
      if (!oAuth2Client.credentials) {
        await getAccessToken();
      }
      const fileName = "Cosaapp.apk";
      const folderId = "1WsYkd8n0Do47omhWaUrTquGMEBzA4LE8"; // Folder ID di Google Drive
      const fileId = await uploadFileToDrive(foundApkPath, fileName, folderId);
      const publicLink = await generatePublicLink(fileId);

      // Kirim tautan ke WhatsApp
      if (phoneNumber) {
        const message = `Your APK has been built successfully! Download it here: ${publicLink}`;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        // Gantilah require() dengan import
        import("open").then((open) => open.default(whatsappLink));
      }

      return res.status(200).json({ success: true, message: "Build APK Success", outputPath: publicLink });
    } catch (uploadError) {
      console.error("Error uploading APK:", uploadError);
      return res.status(500).json({ success: false, message: "Failed to upload APK to Google Drive." });
    }
  });
}