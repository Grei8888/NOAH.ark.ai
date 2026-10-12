# NOAH ARK · 지속적인 베타 피드백 접수 (Google Forms)

### Goal
Trusted testers can leave a nickname and one sentence any time, without registration, and can send new suggestions repeatedly. Actual submissions go **directly to Google Forms** and its private linked Google Sheet, not to Vercel/Neon. The owner records triage decisions in a separate private tab. No paid AI or database.

## Owner-only Google Form setup — one-time

1. Sign in with **the already verified Google Drive account owning the management spreadsheet** and open https://forms.google.com.
2. Create a new blank form named **NOAH ARK · 의견 남기기**. Description:
   `테스트 중 떠오른 생각을 언제든 남겨 주세요. 짧은 의견도 환영합니다. 이름, 이메일, 연락처는 필요 없습니다. 새 의견은 여러 번 제출할 수 있습니다. 응답은 서비스 개선 목적으로만 검토하며 외부에 공개하지 않습니다. 민감정보를 입력하지 말아 주세요.`
3. Add exactly three questions in this exact order:
   - **닉네임** — short text, **optional**
   - **어떤 의견인가요?** — multiple choice, required, options **사용 중 불편함 / 오류 제보 / 개선 아이디어 / 좋았던 점**
   - **의견** — paragraph, required; prompt `한 줄만 적어도 됩니다. 무엇이 불편했나요? 무엇이 좋았나요?`
4. Under Settings, set **collect email = do not collect**, **limit to 1 response = OFF**, **respondents require login / organization limit = OFF**, and do not ask for a file upload. Turn on **show link to submit another response** if available. Only collect minimal responses; collecting email is not needed.
5. **Publish** and check an incognito browser: the respondent link must load without login, all fields can be used, and another response can be sent after first. DO NOT send a real test response with sensitive data.
6. In Forms → **Responses → Link to Sheets → select existing spreadsheet**; choose the prepared private NOAH ARK response-management sheet. The form automatically creates its own responses tab. Do not rename/disrupt its output headers or publish sharing permissions.
7. In Forms, select **More → Get pre-filled link**, fill dummy answers (nickname `N_TEST`, category `개선 아이디어`, opinion `FORM_TEST`), and copy the **prefilled URL**. Send only that respondent prefilled link to the NOAH developer. Never share edit/admin URLs or linked sheet with testers. The three `entry.XXXXXXXX` IDs are extracted from that URL and configured as server-side Vercel variables.
8. Configure Vercel **Production-only**, encrypted where possible:
   - `NOAH_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/<realFormId>/viewform`
   - `NOAH_FEEDBACK_NICKNAME_FIELD=entry.<numericId>`
   - `NOAH_FEEDBACK_KIND_FIELD=entry.<numericId>`
   - `NOAH_FEEDBACK_MESSAGE_FIELD=entry.<numericId>`
9. Only after the link and field mapping are verified, deploy the vetted code. Existing **/beta** and **/feedback** URLs remain stable. Test one non-sensitive submission and verify it appears in the actual Form Responses and connected Sheet before inviting others.

**DO NOT** invent a URL or field ID, configure a fake form on production, or claim feedback is being recorded while unconnected.

## Tester experience

- `/beta`: five simple checks; a visible 30-second CTA appears **only once a real Form has been configured**. Otherwise the existing share-to-friend option remains.
- `/feedback`: short form (optional nickname remembered *only* in localStorage on the tester's device; category + comment). After filling it, the person clicks **Google 양식에서 제출 완료하기** and then confirms **Submit** on Google Forms. Every submission is independent and can be repeated. Data is NOT sent merely by typing on the NOAH site.
- Respondents do not need to create NOAH accounts or upload files. Form response access and management sheet access remain restricted to the owner.
- Owner: use the Sheet `개선 관리` tab to group suggestions, set P0/P1/P2/P3 and progress stages; use Form-created response tab as immutable raw intake. Do not share edit access outside the development team.
- For abusive/spam responses, use Google Forms' own reporting/access settings; the submission URL is open to people who know it. "Shared with trusted acquaintances" is invitation distribution, **not a guarantee of a technically private form**.

## Technical/cost and privacy limits
- No server submissions, Google OAuth credentials, fake CORS fetches, Google API billing, new Vercel writes, Neon tables or external analytics.
- Only `docs.google.com/forms/d/.../viewform` HTTPS responder URLs and numeric `entry.` field identifiers are accepted; incomplete configuration degrades to the existing share-to-owner option without pretending to collect.
- Each time someone uses prefill, their nickname and comment are included in the Google Forms URL query string. Avoid entering sensitive data. That URL may appear in browser history or Google logs. This is acceptable for intentionally non-sensitive short product feedback **only**. A later direct embedded Google Form is preferable if confidential feedback is required.
- User-submitted issue text is third-party content; never put it in prompts to AI or automatic GitHub issues without review and confidentiality safeguards.
- Forms + Sheets remains covered by Google account quotas. Overall NOAH public beta spending policy still requires **monthly total under KRW 50,000**.
