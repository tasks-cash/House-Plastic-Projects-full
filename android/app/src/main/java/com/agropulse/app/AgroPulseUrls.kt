package com.agropulse.app

import android.net.Uri

object AgroPulseUrls {
    const val LOGIN_URL = "https://agro.rafalszelenc.store/login"
    private const val ALLOWED_HOST = "agro.rafalszelenc.store"

    fun isAllowedUrl(url: String?): Boolean {
        if (url.isNullOrBlank()) return false
        return try {
            val host = Uri.parse(url).host ?: return false
            host == ALLOWED_HOST || host.endsWith(".$ALLOWED_HOST")
        } catch (_: Exception) {
            false
        }
    }
}
