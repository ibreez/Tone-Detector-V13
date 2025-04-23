package com.example.tonedetector

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode
import org.json.JSONObject

class OverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private lateinit var webView: WebView
    private lateinit var resultTextView: TextView
    private lateinit var emotionTextView: TextView
    private lateinit var confidenceTextView: TextView
    private lateinit var toneTextView: TextView
    private lateinit var intentionTextView: TextView

    override fun onCreate() {
        super.onCreate()
        
        // Register with EventBus
        EventBus.getDefault().register(this)
        
        // Initialize window manager
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        // Inflate overlay layout
        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_layout, null)
        
        // Get references to UI elements
        resultTextView = overlayView.findViewById(R.id.resultTextView)
        emotionTextView = overlayView.findViewById(R.id.emotionTextView)
        confidenceTextView = overlayView.findViewById(R.id.confidenceTextView)
        toneTextView = overlayView.findViewById(R.id.toneTextView)
        intentionTextView = overlayView.findViewById(R.id.intentionTextView)
        
        // Setup WebView
        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        
        // Add JavaScript interface for communication
        webView.addJavascriptInterface(WebAppInterface(), "Android")
        
        // Load the web app
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Web app is loaded and ready
            }
        }
        
        // Load your web app URL
        webView.loadUrl("https://your-tone-detector-app.netlify.app")
        
        // Add overlay to window
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) 
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY 
            else 
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        
        params.gravity = Gravity.TOP or Gravity.END
        params.x = 0
        params.y = 100
        
        windowManager.addView(overlayView, params)
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onMessageEvent(event: MessageEvent) {
        // When a new message is detected, analyze it
        analyzeMessage(event.message)
    }

    private fun analyzeMessage(message: String) {
        // Call the web app's analyze function
        val jsCode = """
            (function() {
                // Call your web app's analyze function
                const result = window.analyzeTone('${message.replace("'", "\\'")}');
                // Send the result back to Android
                Android.receiveAnalysisResult(JSON.stringify(result));
            })();
        """
        
        webView.evaluateJavascript(jsCode, null)
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun receiveAnalysisResult(resultJson: String) {
            try {
                val result = JSONObject(resultJson)
                
                // Update the overlay UI with the analysis result
                val emotion = result.getString("emotion")
                val confidence = result.getDouble("confidence")
                val tone = if (result.has("tone")) result.getString("tone") else null
                val intention = if (result.has("intention")) result.getString("intention") else null
                
                // Update UI on main thread
                runOnUiThread {
                    emotionTextView.text = "Emotion: $emotion"
                    confidenceTextView.text = "Confidence: ${(confidence * 100).toInt()}%"
                    
                    if (tone != null) {
                        toneTextView.visibility = View.VISIBLE
                        toneTextView.text = "Tone: $tone"
                    } else {
                        toneTextView.visibility = View.GONE
                    }
                    
                    if (intention != null) {
                        intentionTextView.visibility = View.VISIBLE
                        intentionTextView.text = "Intention: $intention"
                    } else {
                        intentionTextView.visibility = View.GONE
                    }
                    
                    // Make overlay visible
                    overlayView.visibility = View.VISIBLE
                    
                    // Hide overlay after 5 seconds
                    overlayView.postDelayed({
                        overlayView.visibility = View.GONE
                    }, 5000)
                }
                
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun runOnUiThread(action: () -> Unit) {
        overlayView.post(action)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized && overlayView.isAttachedToWindow) {
            windowManager.removeView(overlayView)
        }
        EventBus.getDefault().unregister(this)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
