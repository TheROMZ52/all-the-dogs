package com.levelup.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Store.load(context).forEach { Scheduler.schedule(context, it) }
    }
}
