package com.example.tonedetector

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.greenrobot.eventbus.EventBus

class MessageAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        val info = serviceInfo
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or 
                          AccessibilityEvent.TYPE_VIEW_SCROLLED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.notificationTimeout = 100
        info.packageNames = arrayOf("com.whatsapp", "com.facebook.orca", "com.google.android.apps.messaging")
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val rootNode = rootInActiveWindow ?: return
        
        // Extract text from messaging apps
        when (event.packageName) {
            "com.whatsapp" -> processWhatsAppMessages(rootNode)
            "com.facebook.orca" -> processMessengerMessages(rootNode)
            "com.google.android.apps.messaging" -> processGoogleMessages(rootNode)
        }
        
        rootNode.recycle()
    }

    private fun processWhatsAppMessages(rootNode: AccessibilityNodeInfo) {
        // Find message containers in WhatsApp
        val messageNodes = rootNode.findAccessibilityNodeInfosByViewId("com.whatsapp:id/conversation_text")
        
        if (messageNodes.isNotEmpty()) {
            // Get the last message (most recent)
            val lastMessage = messageNodes.last()
            val messageText = lastMessage.text?.toString() ?: return
            
            // Only process if the message is not empty
            if (messageText.isNotEmpty()) {
                // Send the message text to the overlay service
                EventBus.getDefault().post(MessageEvent(messageText))
            }
            
            lastMessage.recycle()
        }
    }

    private fun processMessengerMessages(rootNode: AccessibilityNodeInfo) {
        // Similar implementation for Facebook Messenger
        // This is a simplified version and may need adjustment
        val messageNodes = rootNode.findAccessibilityNodeInfosByViewId("com.facebook.orca:id/message_text")
        
        if (messageNodes.isNotEmpty()) {
            val lastMessage = messageNodes.last()
            val messageText = lastMessage.text?.toString() ?: return
            
            if (messageText.isNotEmpty()) {
                EventBus.getDefault().post(MessageEvent(messageText))
            }
            
            lastMessage.recycle()
        }
    }

    private fun processGoogleMessages(rootNode: AccessibilityNodeInfo) {
        // Similar implementation for Google Messages
        val messageNodes = rootNode.findAccessibilityNodeInfosByViewId("com.google.android.apps.messaging:id/message_text")
        
        if (messageNodes.isNotEmpty()) {
            val lastMessage = messageNodes.last()
            val messageText = lastMessage.text?.toString() ?: return
            
            if (messageText.isNotEmpty()) {
                EventBus.getDefault().post(MessageEvent(messageText))
            }
            
            lastMessage.recycle()
        }
    }

    override fun onInterrupt() {
        // Service interrupted
    }
}

// Event class for passing messages between components
data class MessageEvent(val message: String)
