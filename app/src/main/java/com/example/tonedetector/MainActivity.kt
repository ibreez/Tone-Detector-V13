package com.example.tonedetector

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Check if accessibility service is enabled
        val serviceEnabled = isAccessibilityServiceEnabled()
        updateServiceStatus(serviceEnabled)

        // Setup enable service button
        findViewById<Button>(R.id.enableServiceButton).setOnClickListener {
            if (!serviceEnabled) {
                // Open accessibility settings
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                startActivity(intent)
                Toast.makeText(
                    this,
                    "Please enable 'Tone Detector' in Accessibility Services",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

        // Start the overlay service
        startService(Intent(this, OverlayService::class.java))
    }

    override fun onResume() {
        super.onResume()
        // Update service status when returning to the app
        updateServiceStatus(isAccessibilityServiceEnabled())
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val accessibilityEnabled = Settings.Secure.getInt(
            contentResolver,
            Settings.Secure.ACCESSIBILITY_ENABLED, 0
        )
        
        if (accessibilityEnabled == 1) {
            val serviceString = Settings.Secure.getString(
                contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            
            return serviceString?.contains("${packageName}/.MessageAccessibilityService") == true
        }
        
        return false
    }

    private fun updateServiceStatus(enabled: Boolean) {
        val statusButton = findViewById<Button>(R.id.serviceStatusButton)
        if (enabled) {
            statusButton.text = "Service Status: Enabled"
            statusButton.setBackgroundColor(resources.getColor(android.R.color.holo_green_light))
        } else {
            statusButton.text = "Service Status: Disabled"
            statusButton.setBackgroundColor(resources.getColor(android.R.color.holo_red_light))
        }
    }
}
