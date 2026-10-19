package com.aakashacademy.aas

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Bitmap
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout

class MainActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var root: FrameLayout
    private lateinit var urlMask: View 
    private val popups = ArrayList<WebView>()
    private val h = Handler(Looper.getMainLooper())
    private val startUrl = "https://exambro.app/dashboard"
    private val blocked = listOf(
        "youtube.com", "youtu.be", "instagram.com", "t.me", "telegram.me",
        "telegram.org", "facebook.com", "fb.com", "linkedin.com", "wa.me",
        "whatsapp.com", "twitter.com", "x.com"
    )
    // Injects a CSS rule instantly to hide Exambro images before the page is even visible
    private val killFlashJs = "document.documentElement.style.visibility='hidden';" +
            "var s=document.createElement('style');" +
            "s.innerHTML='img[src*=\"exambro\" i], img[alt*=\"exambro\" i], [class*=\"exambro\" i] { display: none !important; opacity: 0 !important; }';" +
            "(document.head || document.documentElement).appendChild(s);"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = FrameLayout(this)
        web = WebView(this)
        root.addView(web, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        
        // --- THE ADVANCED HACK: NATIVE URL MASK ---
        urlMask = View(this)
        urlMask.setBackgroundColor(0xFF202124.toInt()) // Google dark mode background
        // Pushed down to 250px to fully cover the URL text
        val maskParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 250) 
        maskParams.gravity = android.view.Gravity.TOP
        urlMask.visibility = View.GONE
        root.addView(urlMask, maskParams)
        // ------------------------------------------

        setContentView(root)
        val js = assets.open("cleanup.js").bufferedReader().use { it.readText() }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true)
        web.setBackgroundColor(0xFF0B1220.toInt())
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message): Boolean {
                val pop = WebView(this@MainActivity)
                pop.settings.javaScriptEnabled = true
                pop.settings.domStorageEnabled = true
                pop.settings.setSupportMultipleWindows(true)
                pop.settings.javaScriptCanOpenWindowsAutomatically = true
                // FIX: Changed popup background to dark to prevent white flash
                pop.setBackgroundColor(0xFF202124.toInt()) 
                CookieManager.getInstance().setAcceptThirdPartyCookies(pop, true)
                
                pop.webViewClient = object : WebViewClient() {
                    override fun onPageStarted(v: WebView?, url: String?, favicon: Bitmap?) {
                        super.onPageStarted(v, url, favicon)
                        // FIX: Kill flash in popup too
                        v?.evaluateJavascript(killFlashJs, null)
                        h.postDelayed({
                            v?.evaluateJavascript("document.documentElement.style.visibility='visible'", null)
                        }, 3500)

                        if (url != null && url.contains("accounts.google.com")) {
                            urlMask.visibility = View.VISIBLE
                            urlMask.bringToFront()
                        } else {
                            urlMask.visibility = View.GONE
                        }
                    }
                    override fun onPageFinished(v: WebView?, url: String?) {
                        super.onPageFinished(v, url)
                        v?.evaluateJavascript("document.documentElement.style.visibility='visible'", null)
                        if (url != null && !url.contains("accounts.google.com")) {
                            urlMask.visibility = View.GONE
                        }
                    }
                }
                pop.webChromeClient = this
                root.addView(pop, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
                popups.add(pop)
                val t = resultMsg.obj as WebView.WebViewTransport
                t.webView = pop
                resultMsg.sendToTarget()
                return true
            }
            override fun onCloseWindow(window: WebView) {
                root.removeView(window)
                popups.remove(window)
                window.destroy()
                urlMask.visibility = View.GONE 
            }
        }

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(v: WebView, r: WebResourceRequest): Boolean {
                val scheme = r.url.scheme ?: ""
                if (scheme != "http" && scheme != "https") return true
                val host = r.url.host ?: ""
                return blocked.any { host == it || host.endsWith(".$it") }
            }
            override fun onPageStarted(v: WebView, url: String?, favicon: Bitmap?) {
                // FIX: Kill flash in main webview
                v.evaluateJavascript(killFlashJs, null)
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
        if (popups.isNotEmpty()) {
            val p = popups.removeAt(popups.size - 1)
            root.removeView(p)
            p.destroy()
            urlMask.visibility = View.GONE
        } else if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
