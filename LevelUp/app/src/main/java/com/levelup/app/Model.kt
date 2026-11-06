package com.levelup.app

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class TaskItem(
    val id: Int, val title: String, val hour: Int, val minute: Int,
    val profile: String, val days: Int, val done: Boolean = false
)

fun String.fa(): String = buildString {
    for (c in this@fa) append(if (c in '0'..'9') '۰' + (c - '0') else c)
}

fun Int.fa(): String = toString().fa()

object Store {
    fun load(context: Context): MutableList<TaskItem> {
        val out = mutableListOf<TaskItem>()
        val prefs = context.getSharedPreferences("levelup", Context.MODE_PRIVATE)
        val arr = try { JSONArray(prefs.getString("tasks", "[]")) } catch (_: Exception) { JSONArray() }
        for (i in 0 until arr.length()) {
            try {
                val o = arr.getJSONObject(i)
                out.add(
                    TaskItem(
                        o.getInt("id"), o.getString("title"), o.getInt("hour"), o.getInt("minute"),
                        o.getString("profile"), o.optInt("days", 127), o.optBoolean("done", false)
                    )
                )
            } catch (_: Exception) { }
        }
        return out
    }

    fun save(context: Context, tasks: List<TaskItem>) {
        val arr = JSONArray()
        tasks.forEach { t ->
            arr.put(
                JSONObject().put("id", t.id).put("title", t.title).put("hour", t.hour)
                    .put("minute", t.minute).put("profile", t.profile).put("days", t.days).put("done", t.done)
            )
        }
        context.getSharedPreferences("levelup", Context.MODE_PRIVATE).edit().putString("tasks", arr.toString()).apply()
    }
}
