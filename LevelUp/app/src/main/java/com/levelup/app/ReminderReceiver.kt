package com.levelup.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra("id", -1)
        val task = Store.load(context).firstOrNull { it.id == id } ?: return

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = "level_up_reminders"
        manager.createNotificationChannel(
            NotificationChannel(channel, "یادآورهای LEVEL UP", NotificationManager.IMPORTANCE_HIGH)
        )
        val open = PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val pushes = listOf("وقتشه قهرمان! 👑", "یه قدم دیگه تا سطح بعد 🔥", "بزن بریم! 💪", "این کار منتظرته ⏰")
        val notification = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_stat_crown)
            .setContentTitle(pushes.random())
            .setContentText(task.title)
            .setColor(0xFF6D4AFF.toInt())
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        manager.notify(id, notification)

        // Schedule the next matching day.
        Scheduler.schedule(context, task, delayMs = 60_000L)
    }
}
