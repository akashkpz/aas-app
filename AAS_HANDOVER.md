# AAS – AAKASH ACADEMY OF SCIENCE – Project Handover
Date: 17 Oct 2026

## 1. What this is
Android WebView app that loads https://exambro.app/dashboard, with Exambro branding, social links and selected sections hidden. Owner states it is their own app. App name: AAKASH ACADEMY OF SCIENCE. Short form / launcher label: AAS.

## 2. Identity and locations
- Package: com.aakashacademy.aas (v1.0.0, versionCode 1)
- minSdk 24, targetSdk/compileSdk 34
- Termux project dir: ~/AAS_App (every command starts with: cd ~/AAS_App)
- GitHub repo: https://github.com/akashkpz/aas-app (public), branch main
- Build: GitHub Actions only (.github/workflows/build-apk.yml), debug APK, artifact name AAS-APK
- Downloads: /storage/emulated/0/Download/AAS_APK/run_<HHMMSS>/app-debug.apk (a new run folder each time)
- Not related to /storage/emulated/0/mcq_project, the CR Academy MCQ repo or the Vedclass V2 repo. Do not touch those.

## 3. Stack
- Kotlin, framework Activity, zero third-party dependencies (no AndroidX libs)
- AGP 8.5.2, Kotlin 1.9.24, Gradle 8.9 (installed by the workflow, no wrapper), JDK 17 (Temurin)
- Theme: android:Theme.Material.NoActionBar, dark #0B1220
- Launcher icon: placeholder vector (blue "A" on dark). Activity label "AAS", application label full name.

## 4. File map
- settings.gradle.kts, build.gradle.kts, gradle.properties, .gitignore
- app/build.gradle.kts
- app/src/main/AndroidManifest.xml (INTERNET permission, cleartext off, configChanges for rotation)
- app/src/main/res/values/strings.xml, themes.xml; res/drawable/ic_launcher.xml
- app/src/main/java/com/aakashacademy/aas/MainActivity.kt
- app/src/main/assets/cleanup.js  (all hiding rules live here; this is the file edited most)
- .github/workflows/build-apk.yml

## 5. MainActivity.kt behaviour
- WebView in a FrameLayout; JS, DOM storage, cookies and third-party cookies on
- Start URL: https://exambro.app/dashboard
- setSupportMultipleWindows(true) + onCreateWindow/onCloseWindow: popups (Google/Firebase login) open as an overlay WebView and close themselves. This fixed the blank screen after Google login.
- shouldOverrideUrlLoading: blocks non-http(s) schemes and these domains: youtube.com, youtu.be, instagram.com, t.me, telegram.me, telegram.org, facebook.com, fb.com, linkedin.com, wa.me, whatsapp.com, twitter.com, x.com
- onPageStarted: page set to visibility:hidden, with a 3.5 s fail-safe reveal. onPageFinished: injects cleanup.js.
- Back button: closes popup first, then WebView history, then exits.

## 6. cleanup.js rules (text-based, the site's DOM is unknown)
Helpers: smallest-element-by-text finder, safe hide() (never hides anything containing "Hey," or "PYQ Bank", body, or direct body children), auto-restore if the page text drops under 30 chars, MutationObserver (60 ms debounce) plus re-runs at 450 ms and 1600 ms, reveal after the first hide (>400 ms) or 1.5 s.
- Dashboard: hides from the "Toolbox" heading to the social icons, EXCEPT the "Join Online Mock Tests" row (kept). The sweep never hides ancestors of the heading or of the kept row.
- Header: hides the "Teacher App" button and notification bell.
- Bottom nav: hides the "Premium" and "Tests" tabs (only Home and Profile remain).
- MHT CET page: hides the purple "Unlock & continue" banner.
- Login page: hides the Exambro logo and the "EXAMBRO" text.
- Profile page: hides the edit "Profile" button, the Role / Switch to Teacher row, View My Purchases and Exam Info.
- Misc: hides links to social domains, img elements with exambro in src/alt/title, text "EXAMBRO"/"EXAMBRO PREMIUM", and sets document.title to the app name.
- Floating logo: hides a small (30 to 150 px) fixed image/svg at bottom-left with no text (the B logo on chapter pages). Heuristic, may need tuning.

## 7. Known limits / not done
- "exambro-4a11b.firebaseapp.com" on Google's account chooser is NOT hidden. It is Google's own page and tells the user where the sign-in goes. Proper fix is on the site's Firebase side (custom auth domain and consent-screen app name).
- Icon is a placeholder. A custom image can replace it.
- Pages not yet reviewed: Tests tab inner pages, other exam pages, chapter/question screens, settings gear, any other Exambro text.
- Hiding is text-based. If the site changes wording or layout, rules may stop matching.
- Google login only works because of popup support. If it breaks again, check onCreateWindow first.
- APK is debug-signed (fine for sideloading, not for Play Store).

## 8. Status
- Repo created, builds succeed on GitHub Actions, app installs, Google login works.
- Latest change (cleanup.js with the extra hide rules and "keep Join Online Mock Tests") was pushed on 17 Oct 2026. Result on device not yet confirmed.

## 9. Everyday commands
Edit rules: rewrite app/src/main/assets/cleanup.js, then:
  cd ~/AAS_App && git add -A && git commit -m "msg" && git push
Watch + download:
  cd ~/AAS_App && sleep 12 && gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status && gh run download $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') -n AAS-APK -D /storage/emulated/0/Download/AAS_APK/run_$(date +%H%M%S)
Failure log:
  cd ~/AAS_App && gh run view --log-failed | tail -40
Rollback one commit:
  cd ~/AAS_App && git revert --no-edit HEAD && git push
Make repo private:
  cd ~/AAS_App && gh repo edit akashkpz/aas-app --visibility private --accept-visibility-change-consequences

## 10. Working style
Short copy-pasteable Termux commands, each starting with cd ~/AAS_App. Install new APK over the old one (login persists). For problems, send a screenshot plus the page name.
