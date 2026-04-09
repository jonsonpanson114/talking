/**
 * Web Push Notification Storage and Scheduler for "Talking" App
 *
 * 1. GASプロジェクトに貼り付けてください
 * 2. 公開 > ウェブアプリとしてデプロイ (アクセス制限: 全員)
 * 3. デプロイURLを Vercelの GAS_WEBHOOK_URL に設定
 * 4. checkAndSendPushes を5分ごとの時限トリガーに設定
 */

const VERBOSE_LOGGING = true;
const VERCEL_SEND_API = "https://talking-rosy.vercel.app/api/push/send";
const MAX_BATCH_PER_RUN = 25;
const SEND_WINDOW_MINUTES = 2;

const SHEET_NAME = "Subscriptions";
const HEADER = [
  "Endpoint",
  "Subscription JSON",
  "Hour",
  "Minute",
  "Enabled",
  "Last Updated",
  "User Agent",
  "Last Notified Key",
];

function ensureSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
    return sheet;
  }

  const firstRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADER.length)).getValues()[0];
  if (firstRow[0] !== "Endpoint") {
    sheet.clear();
    sheet.appendRow(HEADER);
  } else if (sheet.getLastColumn() < HEADER.length) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  }

  return sheet;
}

function safeJsonParse_(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function nowJst_() {
  return new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
}

function toMinuteKey_(dateObj) {
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getUTCDate()).padStart(2, "0");
  const h = String(dateObj.getUTCHours()).padStart(2, "0");
  const min = String(dateObj.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${d}${h}${min}`;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "empty body" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = safeJsonParse_(e.postData.contents);
    if (!data) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "invalid json" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = ensureSheet_();
    const action = data.action;

    if (action !== "subscribe") {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "unknown action" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const subObj = typeof data.subscription === "string" ? safeJsonParse_(data.subscription) : data.subscription;
    if (!subObj || !subObj.endpoint) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "invalid subscription" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const endpoint = subObj.endpoint;
    const settings = data.settings || {};

    const lastRow = sheet.getLastRow();
    const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues() : [];

    let foundRow = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === endpoint) {
        foundRow = i + 2;
        break;
      }
    }

    const record = [
      endpoint,
      JSON.stringify(subObj),
      Number(settings.hour ?? 20),
      Number(settings.minute ?? 0),
      settings.enabled ? "TRUE" : "FALSE",
      new Date().toISOString(),
      data.userAgent || "",
      "",
    ];

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, HEADER.length).setValues([record]);
    } else {
      sheet.appendRow(record);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err && err.message ? err.message : err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function checkAndSendPushes() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    if (VERBOSE_LOGGING) console.log("skip: another run is in progress");
    return;
  }

  try {
    const sheet = ensureSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    const rows = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();

    const jst = nowJst_();
    const currentHour = jst.getUTCHours();
    const currentMinute = jst.getUTCMinutes();
    const minuteKey = toMinuteKey_(jst);

    if (VERBOSE_LOGGING) {
      console.log(`checkAndSendPushes start JST=${currentHour}:${String(currentMinute).padStart(2, "0")}`);
    }

    const targets = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const endpoint = row[0];
      const subJson = row[1];
      const hour = Number(row[2]);
      const minute = Number(row[3]);
      const enabled = row[4] === "TRUE" || row[4] === true;
      const lastNotifiedKey = String(row[7] || "");

      if (!enabled) continue;
      if (!endpoint || !subJson) continue;

      const minuteDiff = Math.abs(minute - currentMinute);
      if (hour !== currentHour || minuteDiff > SEND_WINDOW_MINUTES) continue;

      // 同じ分に複数回送らない
      if (lastNotifiedKey === minuteKey) continue;

      const parsed = safeJsonParse_(subJson);
      if (!parsed || !parsed.endpoint) {
        continue;
      }

      targets.push({ sheetRow: i + 2, endpoint, subscription: parsed });
      if (targets.length >= MAX_BATCH_PER_RUN) break;
    }

    if (targets.length === 0) {
      if (VERBOSE_LOGGING) console.log("No targets found");
      return;
    }

    const requests = targets.map((t) => ({
      url: VERCEL_SEND_API,
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      payload: JSON.stringify({
        subscription: t.subscription,
        data: {
          title: "Talking - 練習の時間です！",
          body: "今日も5分間、自分磨きの会話練習をしましょう。",
          url: "/roleplay",
        },
      }),
    }));

    const responses = UrlFetchApp.fetchAll(requests);
    const rowsToDelete = [];

    responses.forEach((res, idx) => {
      const code = res.getResponseCode();
      const target = targets[idx];
      const body = res.getContentText();

      if (VERBOSE_LOGGING) {
        console.log(`send row=${target.sheetRow} code=${code} endpoint=${target.endpoint}`);
      }

      if (code === 200) {
        sheet.getRange(target.sheetRow, 8).setValue(minuteKey);
      } else if (code === 410 || code === 404) {
        rowsToDelete.push(target.sheetRow);
      } else {
        // 送信失敗時でもループは継続。必要ならログだけ残す。
        console.log(`send failed code=${code} body=${body}`);
      }
    });

    // 行削除は下から
    rowsToDelete.sort((a, b) => b - a).forEach((r) => sheet.deleteRow(r));
  } catch (e) {
    console.error(`checkAndSendPushes fatal: ${e && e.message ? e.message : e}`);
    throw e;
  } finally {
    lock.releaseLock();
  }
}
