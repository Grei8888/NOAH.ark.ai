/**
 * NOAH ARK Google Sheets receiver, v1
 * Paste into https://script.google.com while logged in as grei3888@gmail.com.
 * Deploy Web App: Execute as Me; access Anyone. Never share the secret with testers.
 *
 * Script property to create: NOAH_FEEDBACK_SECRET = same random secret stored
 * server-side in Vercel as NOAH_FEEDBACK_SCRIPT_SECRET.
 */
const SHEET_ID = "17xpdwM6loH6A_a9lFIerjMFZqWVQjqcwa5g-AA5FUgM";
const TAB = "피드백 원본";
const MAX_DAILY_SUBMISSIONS = 150;
const MAX_PER_VISITOR_TEN_MIN = 8;

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function safeCell_(value, limit) {
  const text = String(value || "").trim().slice(0, limit)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  // Avoid spreadsheet formula injection from untrusted user input.
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}
function doGet() {
  return json_({ok:false, error:"POST only"});
}
function doPost(e) {
  let x;
  try { x = JSON.parse(e.postData.contents); } catch (_) {
    return json_({ok:false,error:"invalid_json"});
  }
  const expected = PropertiesService.getScriptProperties().getProperty("NOAH_FEEDBACK_SECRET");
  if (!expected || !x || x.secret !== expected) return json_({ok:false,error:"unauthorized"});
  if (!/^[0-9a-f-]{36}$/i.test(String(x.submissionId || "")) ||
      !/^[0-9a-f]{24}$/.test(String(x.visitorKey || ""))) return json_({ok:false,error:"invalid_id"});
  if (!["","1","2","3","4","5"].includes(String(x.score || ""))) return json_({ok:false,error:"invalid_score"});
  if (String(x.nickname || "").length > 40 || String(x.liked || "").length > 1500 ||
      String(x.problems || "").length > 1500) return json_({ok:false,error:"invalid_length"});
  if (!x.score && !String(x.liked || "").trim() && !String(x.problems || "").trim()) return json_({ok:false,error:"empty"});
  const id = String(x.submissionId);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(4000)) return json_({ok:false,error:"busy"});
  try {
    const cache = CacheService.getScriptCache();
    const seen = "receipt:" + id;
    if (cache.get(seen)) return json_({ok:true,id,duplicate:true});
    const day = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd");
    const props = PropertiesService.getScriptProperties();
    const dailyKey = "daily:" + day;
    const daily = Number(props.getProperty(dailyKey) || "0");
    if (daily >= MAX_DAILY_SUBMISSIONS) return json_({ok:false,error:"rate_limit"});
    const visitorKey = "v:" + x.visitorKey;
    const count = Number(cache.get(visitorKey) || "0");
    if (count >= MAX_PER_VISITOR_TEN_MIN) return json_({ok:false,error:"rate_limit"});

    const book = SpreadsheetApp.openById(SHEET_ID);
    let sheet = book.getSheetByName(TAB);
    if (!sheet) {
      sheet = book.insertSheet(TAB);
      sheet.appendRow(["접수일시","닉네임","사용경험(1~5)","좋았던 점","불편·개선 의견","제출 ID","유입 경로"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,7).setBackground("#152B47").setFontColor("#FFFFFF").setFontWeight("bold");
    }
    sheet.appendRow([
      new Date(), safeCell_(x.nickname,40), safeCell_(x.score,1),
      safeCell_(x.liked,1500), safeCell_(x.problems,1500),
      id, "NOAH ARK /beta",
    ]);
    SpreadsheetApp.flush();
    props.setProperty(dailyKey,String(daily+1));
    cache.put(visitorKey,String(count+1),600);
    cache.put(seen,"1",21600);
    return json_({ok:true,id});
  } catch (_) {
    return json_({ok:false,error:"storage_unavailable"});
  } finally {
    lock.releaseLock();
  }
}
