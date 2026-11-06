package com.levelup.app

import android.app.*
import android.content.*
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

data class TaskItem(
    val id: Int, val title: String, val hour: Int, val minute: Int,
    val profile: String, val days: Int, val done: Boolean = false
)

class MainActivity : ComponentActivity() {
    private val prefs by lazy { getSharedPreferences("levelup", MODE_PRIVATE) }
    private val tasks = mutableStateListOf<TaskItem>()
    private var nextId = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        loadTasks()
        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 10)
        }
        setContent { LevelUpScreen() }
    }

    private fun loadTasks() {
        val arr = try { JSONArray(prefs.getString("tasks", "[]")) } catch (_: Exception) { JSONArray() }
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            tasks.add(TaskItem(o.getInt("id"), o.getString("title"), o.getInt("hour"), o.getInt("minute"),
                o.getString("profile"), o.optInt("days", 127), o.optBoolean("done", false)))
            nextId = maxOf(nextId, o.getInt("id") + 1)
        }
    }

    private fun saveTasks() {
        val arr = JSONArray()
        tasks.forEach { t ->
            arr.put(JSONObject().put("id", t.id).put("title", t.title).put("hour", t.hour)
                .put("minute", t.minute).put("profile", t.profile).put("days", t.days).put("done", t.done))
        }
        prefs.edit().putString("tasks", arr.toString()).apply()
    }

    private fun schedule(t: TaskItem) {
        val alarm = getSystemService(ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, ReminderReceiver::class.java).apply {
            putExtra("title", t.title); putExtra("id", t.id); putExtra("days", t.days)
            putExtra("hour", t.hour); putExtra("minute", t.minute); putExtra("profile", t.profile)
        }
        val pi = PendingIntent.getBroadcast(this, t.id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val now = Calendar.getInstance()
        val next = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, t.hour); set(Calendar.MINUTE, t.minute); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            while (timeInMillis <= now.timeInMillis || (t.days and (1 shl (get(Calendar.DAY_OF_WEEK)-1))) == 0) add(Calendar.DAY_OF_YEAR, 1)
        }
        if (Build.VERSION.SDK_INT < 31 || alarm.canScheduleExactAlarms()) {
            alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.timeInMillis, pi)
        } else alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.timeInMillis, pi)
    }

    private fun cancel(t: TaskItem) {
        val pi = PendingIntent.getBroadcast(this, t.id, Intent(this, ReminderReceiver::class.java),
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE)
        if (pi != null) (getSystemService(ALARM_SERVICE) as AlarmManager).cancel(pi)
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    private fun LevelUpScreen() {
        var profile by remember { mutableStateOf("school") }
        var showAdd by remember { mutableStateOf(false) }
        var title by remember { mutableStateOf("") }
        var hour by remember { mutableStateOf("18") }
        var minute by remember { mutableStateOf("00") }
        var selectedDays by remember { mutableIntStateOf(127) }
        var showStats by remember { mutableStateOf(false) }
        val visible = tasks.filter { it.profile == profile }

        MaterialTheme(colorScheme = darkColorScheme(primary = androidx.compose.ui.graphics.Color(0xFFB69CFF))) {
            Scaffold(
                topBar = { TopAppBar(title = { Text("LEVEL UP 👑") }, actions = {
                    TextButton(onClick = { showStats = !showStats }) { Text("آمار") }
                }) },
                floatingActionButton = { FloatingActionButton(onClick = { showAdd = true }) { Icon(Icons.Default.Add, "افزودن") } }
            ) { padding ->
                Column(Modifier.padding(padding).padding(16.dp)) {
                    Text("هر روز، یک قدم بهتر.", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(selected = profile == "school", onClick = { profile = "school" }, label = { Text("روز مدرسه") })
                        FilterChip(selected = profile == "holiday", onClick = { profile = "holiday" }, label = { Text("تعطیلات") })
                    }
                    if (showStats) {
                        val completed = tasks.count { it.done }
                        Text("کارهای ثبت‌شده: ${tasks.size}   |   انجام‌شده: $completed")
                    }
                    Spacer(Modifier.height(8.dp))
                    if (visible.isEmpty()) Text("هنوز کاری ثبت نکردی. با دکمه + اولین یادآور را بساز.")
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(visible, key = { it.id }) { task ->
                            Card {
                                Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Column(Modifier.weight(1f)) {
                                        Text(task.title, style = MaterialTheme.typography.titleMedium)
                                        Text("%02d:%02d".format(task.hour, task.minute) + "  •  " + if (task.profile == "school") "روز مدرسه" else "تعطیلات")
                                    }
                                    Checkbox(checked = task.done, onCheckedChange = { checked ->
                                        val i = tasks.indexOfFirst { it.id == task.id }
                                        if (i >= 0) tasks[i] = tasks[i].copy(done = checked)
                                        saveTasks()
                                    })
                                    IconButton(onClick = { cancel(task); tasks.remove(task); saveTasks() }) { Icon(Icons.Default.Delete, "حذف") }
                                }
                            }
                        }
                    }
                }
            }
            if (showAdd) {
                AlertDialog(
                    onDismissRequest = { showAdd = false },
                    title = { Text("یادآور جدید") },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(title, { title = it }, label = { Text("عنوان کار") }, singleLine = true)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(hour, { hour = it.filter(Char::isDigit).take(2) }, label = { Text("ساعت") }, modifier = Modifier.weight(1f))
                                OutlinedTextField(minute, { minute = it.filter(Char::isDigit).take(2) }, label = { Text("دقیقه") }, modifier = Modifier.weight(1f))
                            }
                            Text("روزهای تکرار:")
                            val labels = listOf("یک","دو","سه","چهار","پنج","جمعه","شنبه")
                            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                labels.forEachIndexed { index, label ->
                                    FilterChip(selected = (selectedDays and (1 shl ((index+1)%7))) != 0,
                                        onClick = { selectedDays = selectedDays xor (1 shl ((index+1)%7)) },
                                        label = { Text(label) })
                                }
                            }
                            Text("این یادآور برای: ${if (profile == "school") "روز مدرسه" else "تعطیلات"}")
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = {
                            val h = hour.toIntOrNull(); val m = minute.toIntOrNull()
                            if (title.isNotBlank() && h != null && m != null && h in 0..23 && m in 0..59 && selectedDays != 0) {
                                val t = TaskItem(nextId++, title.trim(), h, m, profile, selectedDays)
                                tasks.add(t); saveTasks(); schedule(t); title = ""; showAdd = false
                            }
                        }) { Text("ذخیره و فعال‌سازی") }
                    },
                    dismissButton = { TextButton(onClick = { showAdd = false }) { Text("لغو") } }
                )
            }
        }
    }
}
