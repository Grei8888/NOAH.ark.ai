/**
 * NOAH ARK Google Forms receiver, v2.
 *
 * Owner-only setup:
 *   1) Open the existing admin Sheet: Extensions > Apps Script.
 *   2) Paste this file, set Script Property NOAH_FEEDBACK_SECRET.
 *   3) Run setupBetaForm() ONCE and grant Google Form + Sheet permissions.
 *   4) Deploy Web App (execute as Me; access Anyone) and configure
 *      NOAH_FEEDBACK_SCRIPT_URL / NOAH_FEEDBACK_SCRIPT_SECRET on Vercel.
 *
 * Respondents NEVER visit the Google Form. FormApp programmatically submits
 * exactly the data entered in the existing NOAH /beta form.
 * The Form response destination is the owner's existing private Google Sheet.
 */

const NOAH_SHEET_ID = "17xpdwM6loH6A_a9lFIerjMFZqWVQjqcwa5g-AA5FUgM";
const NOAH_FORM_ID_PROP = "NOAH_FEEDBACK_FORM_ID";
const MAX_DAILY_SUBMISSIONS = 150;
const MAX_PER_VISITOR_TEN_MIN = 8;
const QUESTION = {
  nickname:"닉네임",
  score:"전반적인 사용 경험 (1~5점)",
  liked:"좋았던 점",
  problems:"불편하거나 개선할 점",
  submissionId:"제출 ID (시스템)",
};

/** Run manually once as form owner; safe to re-run (never creates duplicates). */
function setupBetaForm() {
  const properties = PropertiesService.getScriptProperties();
  const existing = properties.getProperty(NOAH_FORM_ID_PROP);
  if (existing) {
    const form = FormApp.openById(existing);
    console.log("Existing Google Form: " + form.getEditUrl());
    return;
  }
  const form = FormApp.create("NOAH ARK | 베타테스터 의견");
  form.setDescription("NOAH ARK 베타 의견 보관용 설문입니다. NOAH 웹페이지에서 작성된 의견이 자동 기록됩니다. 이메일을 수집하지 않습니다.");
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.addTextItem().setTitle(QUESTION.nickname).setRequired(false);
  form.addMultipleChoiceItem().setTitle(QUESTION.score)
    .setChoiceValues(["1","2","3","4","5"]).setRequired(false);
  form.addParagraphTextItem().setTitle(QUESTION.liked).setRequired(false);
  form.addParagraphTextItem().setTitle(QUESTION.problems).setRequired(false);
  form.addTextItem().setTitle(QUESTION.submissionId).setRequired(false);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, NOAH_SHEET_ID);
  form.setAcceptingResponses(true);
  properties.setProperty(NOAH_FORM_ID_PROP,form.getId());
  console.log("Created Google Form: " + form.getEditUrl());
  console.log("Forms responses are also linked to existing Google Sheet.");
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function safeText_(value,limit) {
  const text = String(value || "").trim().slice(0,limit)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  // Protect the linked response spreadsheet from user-supplied formulas.
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}
function doGet() {
  return json_({ok:false,error:"POST only"});
}
function doPost(e) {
  let x;
  try { x = JSON.parse(e.postData.contents); }
  catch (_) { return json_({ok:false,error:"invalid_json"}); }

  const properties = PropertiesService.getScriptProperties();
  const expected = properties.getProperty("NOAH_FEEDBACK_SECRET");
  const formId = properties.getProperty(NOAH_FORM_ID_PROP);
  if (!expected || !formId || !x || x.secret !== expected)
    return json_({ok:false,error:"unauthorized_or_not_setup"});
  if (!/^[0-9a-f-]{36}$/i.test(String(x.submissionId || "")) ||
      !/^[0-9a-f]{24}$/.test(String(x.visitorKey || "")))
    return json_({ok:false,error:"invalid_id"});
  if (!["","1","2","3","4","5"].includes(String(x.score || "")))
    return json_({ok:false,error:"invalid_score"});
  if (String(x.nickname || "").length > 40 ||
      String(x.liked || "").length > 1500 || String(x.problems || "").length > 1500)
    return json_({ok:false,error:"invalid_length"});
  if (!x.score && !String(x.liked || "").trim() && !String(x.problems || "").trim())
    return json_({ok:false,error:"empty"});

  const id = String(x.submissionId);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(4000)) return json_({ok:false,error:"busy"});
  try {
    const cache = CacheService.getScriptCache();
    const receipt = "receipt:" + id;
    if (cache.get(receipt)) return json_({ok:true,id,duplicate:true});

    const day = Utilities.formatDate(new Date(),"Asia/Seoul","yyyyMMdd");
    const counter = "noahDaily:" + day;
    const daily = Number(properties.getProperty(counter) || "0");
    if (daily >= MAX_DAILY_SUBMISSIONS) return json_({ok:false,error:"rate_limit"});
    const visitor = "v:" + x.visitorKey;
    const count = Number(cache.get(visitor) || "0");
    if (count >= MAX_PER_VISITOR_TEN_MIN) return json_({ok:false,error:"rate_limit"});

    const form = FormApp.openById(formId);
    if (!form.isAcceptingResponses()) return json_({ok:false,error:"closed"});
    const response = form.createResponse();
    const items = form.getItems();
    function getItem_(name) {
      const item = items.find(i=>i.getTitle() === name);
      if(!item) throw new Error("Missing form question: " + name);
      return item;
    }
    if (String(x.nickname || "").trim())
      response.withItemResponse(getItem_(QUESTION.nickname).asTextItem().createResponse(safeText_(x.nickname,40)));
    if (x.score)
      response.withItemResponse(getItem_(QUESTION.score).asMultipleChoiceItem().createResponse(String(x.score)));
    if (String(x.liked || "").trim())
      response.withItemResponse(getItem_(QUESTION.liked).asParagraphTextItem().createResponse(safeText_(x.liked,1500)));
    if (String(x.problems || "").trim())
      response.withItemResponse(getItem_(QUESTION.problems).asParagraphTextItem().createResponse(safeText_(x.problems,1500)));
    response.withItemResponse(getItem_(QUESTION.submissionId).asTextItem().createResponse(id));

    // Official FormApp API submits into Google Forms; setDestination also
    // publishes a response row into the linked private Google Sheet.
    const saved = response.submit();
    if (!saved.getId()) return json_({ok:false,error:"save_not_confirmed"});

    properties.setProperty(counter,String(daily+1));
    cache.put(visitor,String(count+1),600);
    cache.put(receipt,"1",21600);
    return json_({ok:true,id});
  } catch (_) {
    return json_({ok:false,error:"storage_unavailable"});
  } finally {
    lock.releaseLock();
  }
}
