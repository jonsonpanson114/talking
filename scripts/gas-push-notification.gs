/**
 * Web Push Notification Storage and Scheduler for "Talking" App
 * 
 * 1. GASプロジェクトに貼り付けてください
 * 2. 公開 > ウェブアプリとしてデプロイ (アクセス制限: 全員)
 * 3. デプロイURLを Vercelの GAS_WEBHOOK_URL に設定
 * 4. checkAndSendPushes を1分〜5分ごとの時限トリガーに設定
 */

const VERBOSE_LOGGING = true;
const VERCEL_SEND_API = "https://your-app.vercel.app/api/push/send"; // ← あなたのアプリのURLに書き換えてください
const SECRET_TOKEN = "your-secret-token"; // 必要なら追加の認証用

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Subscriptions");
    
    if (!sheet) {
      sheet = ss.insertSheet("Subscriptions");
      sheet.appendRow(["Endpoint", "Subscription JSON", "Hour", "Minute", "Enabled", "Last Updated", "User Agent"]);
    }
    
    const action = data.action;
    
    if (action === "subscribe") {
      const subscription = data.subscription;
      const settings = data.settings;
      const subObj = JSON.parse(subscription);
      const endpoint = subObj.endpoint;
      
      const rows = sheet.getDataRange().getValues();
      let foundIndex = -1;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === endpoint) {
          foundIndex = i + 1;
          break;
        }
      }
      
      const newRow = [
        endpoint,
        subscription,
        settings.hour,
        settings.minute,
        settings.enabled ? "TRUE" : "FALSE",
        new Date().toISOString(),
        data.userAgent || ""
      ];
      
      if (foundIndex > 0) {
        sheet.getRange(foundIndex, 1, 1, newRow.length).setValues([newRow]);
      } else {
        sheet.appendRow(newRow);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * トリガーで実行：通知が必要なユーザーを探して Vercel API を叩く
 */
function checkAndSendPushes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Subscriptions");
  if (!sheet) return;
  
  const now = new Date();
  // JST (UTC+9) に合わせる
  const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const currentHour = now.getHours(); // GASのスクリプトタイムゾーンに依存
  const currentMinute = now.getMinutes();
  
  if (VERBOSE_LOGGING) console.log(`Checking pushes for ${currentHour}:${currentMinute}`);
  
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    const [endpoint, subJson, hour, minute, enabledStr] = rows[i];
    const enabled = enabledStr === "TRUE" || enabledStr === true;
    
    // 時間が一致し、有効な場合
    if (enabled && Number(hour) === currentHour && Math.abs(Number(minute) - currentMinute) <= 2) {
      sendPushViaVercel(subJson);
      // 連続で送らないために少し間隔を開けるか、送信済みフラグを管理しても良い
    }
  }
}

function sendPushViaVercel(subscriptionJson) {
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify({
      subscription: JSON.parse(subscriptionJson),
      data: {
        title: "Talking - 練習の時間です！",
        body: "今日も5分間、自分磨きの会話練習をしましょう。",
        url: "/roleplay"
      }
    }),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(VERCEL_SEND_API, options);
    const code = response.getResponseCode();
    if (VERBOSE_LOGGING) console.log(`Sent to ${VERCEL_SEND_API}: ${code} - ${response.getContentText()}`);
    
    // 期限切れ (410) の場合はシートから削除してもよい
    if (code === 410) {
      cleanupExpiredSubscription(JSON.parse(subscriptionJson).endpoint);
    }
  } catch (e) {
    console.error("Fetch error: " + e.message);
  }
}

function cleanupExpiredSubscription(endpoint) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Subscriptions");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === endpoint) {
      sheet.deleteRow(i + 1);
      console.log(`Cleaned up expired subscription: ${endpoint}`);
      break;
    }
  }
}
