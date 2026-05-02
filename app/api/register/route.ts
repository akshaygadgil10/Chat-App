import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

async function getSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, mobile, consentGiven } = await req.json();

    if (!name || !email || !mobile) {
      return NextResponse.json(
        { error: "Name, email and mobile are required" },
        { status: 400 }
      );
    }

    const sheets = await getSheet();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Get all data starting from row 2 (skip header row 1)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!B2:B1000", // Skip header, only email column
    });

    const emails = (existing.data.values ?? []).flat().map((e) => e.toLowerCase().trim());
    const alreadyExists = emails.includes(email.toLowerCase().trim());

    if (alreadyExists) {
      return NextResponse.json({ success: true, isExisting: true });
    }

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            name,
            email,
            mobile,
            consentGiven ? "Yes" : "No",
            new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, isExisting: false });
  } catch (err) {
    console.error("Google Sheets error:", err);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}