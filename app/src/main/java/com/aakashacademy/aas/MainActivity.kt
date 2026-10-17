package com.aakashacademy.aas

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Bitmap
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    private lateinit var web: WebView
    private val h = Handler(Looper.getMainLooper())
    private val startUrl = "https://exambro.app/dashboard"
    private val blocked = listOf(
        "youtube.com", "youtu.be", "instagram.com", "t.me", "telegram.me",
        "telegram.org", "facebook.com", "fb.com", "linkedin.com", "wa.me",
        "whatsapp.com", "twitter.com", "x.com"
    )

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        setContentView(web)
        val js = assets.open("cleanup.js").bufferedReader().use { it.readText() }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true)
        web.setBackgroundColor(0xFF0B1220.toInt())
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(v: WebView, r: WebResourceRequest): Boolean {
                val scheme = r.url.scheme ?: ""
                if (scheme != "http" && scheme != "https") return true
                val host = r.url.host ?: ""
                return blocked.any { host == it || host.endsWith(".$it") }
            }
            override fun onPageStarted(v: WebView, url: String?, favicon: Bitmap?) {
                v.evaluateJavascript("document.documentElement.style.visibility='hidden'", null)
                h.postDelayed({
                    v.evaluateJavascript("document.documentElement.style.visibility='visible'", null)
                }, 3500)
            }
            override fun onPageFinished(v: WebView, url: String?) {
                v.evaluateJavascript(js, null)
            }
        }
        web.loadUrl(startUrl)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
