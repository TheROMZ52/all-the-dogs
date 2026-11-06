package com.levelup.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object Scheduler {
    fun nextTime(days: Int, hour: Int, minute: Int, after: Long): Long {
        val c = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour); set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        var guard = 0
        while ((c.timeInMillis <= after || (days and (1 shl (c.get(Calendar.DAY_OF_WEEK) - 1))) == 0) && guard++ < 16) {
            c.add(Calendar.DAY_OF_YEAR, 1)
        }
        return c.timeInMillis
    }

    private fun pending(context: Context, id: Int, flags: Int): PendingIntent? =
        PendingIntent.getBroadcast(
            context, id, Intent(context, ReminderReceiver::class.java).putExtra("id", id),
            flags or PendingIntent.FLAG_IMMUTABLE
        )

    fun schedule(context: Context, t: TaskItem, delayMs: Long = 0L) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = pending(context, t.id, PendingIntent.FLAG_UPDATE_CURRENT) ?: return
        val at = nextTime(t.days, t.hour, t.minute, System.currentTimeMillis() + delayMs)
        try {
            if (Build.VERSION.SDK_INT < 31 || alarm.canScheduleExactAlarms()) {
                alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            } else {
                alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }
        } catch (_: SecurityException) {
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }

    fun cancel(context: Context, id: Int) {
        val pi = pending(context, id, PendingIntent.FLAG_NO_CREATE) ?: return
        (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).cancel(pi)
    }
}
