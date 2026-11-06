package com.levelup.app

import android.app.AlarmManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimeInput
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import kotlinx.coroutines.launch
import java.util.Calendar

private val dayOrder = listOf(6 to "ش", 0 to "ی", 1 to "د", 2 to "س", 3 to "چ", 4 to "پ", 5 to "ج")
private val CardBg = Color(0xFF241D3B)

private fun daysText(days: Int): String =
    if (days == 127) "هر روز" else dayOrder.filter { (days and (1 shl it.first)) != 0 }.joinToString("، ") { it.second }

class MainActivity : ComponentActivity() {
    private val prefs by lazy { getSharedPreferences("levelup", MODE_PRIVATE) }
    private val tasks = mutableStateListOf<TaskItem>()
    private var nextId = 1
    private var xp by mutableIntStateOf(0)
    private var streak by mutableIntStateOf(0)
    private var exactOk by mutableStateOf(true)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT)
        )
        tasks.addAll(Store.load(this))
        nextId = (tasks.maxOfOrNull { it.id } ?: 0) + 1
        xp = prefs.getInt("xp", 0)
        streak = prefs.getInt("streak", 0)
        dailyReset()
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 10)
        }
        setContent { LevelUpApp() }
    }

    override fun onResume() {
        super.onResume()
        dailyReset()
        exactOk = Build.VERSION.SDK_INT < 31 ||
            (getSystemService(ALARM_SERVICE) as AlarmManager).canScheduleExactAlarms()
        tasks.forEach { Scheduler.schedule(this, it) }
    }

    // ---------- data helpers ----------
    private fun dayKey(offset: Int = 0): String {
        val c = Calendar.getInstance()
        c.add(Calendar.DAY_OF_YEAR, offset)
        val m = (c.get(Calendar.MONTH) + 1).toString().padStart(2, '0')
        val d = c.get(Calendar.DAY_OF_MONTH).toString().padStart(2, '0')
        return "${c.get(Calendar.YEAR)}$m$d"
    }

    private fun dailyReset() {
        val today = dayKey()
        if (prefs.getString("lastDay", "") == today) return
        for (i in tasks.indices) if (tasks[i].done) tasks[i] = tasks[i].copy(done = false)
        val last = prefs.getString("lastActive", "")
        if (last != today && last != dayKey(-1)) streak = 0
        prefs.edit().putString("lastDay", today).putInt("streak", streak).apply()
        Store.save(this, tasks)
    }

    private fun savePrefs() {
        prefs.edit().putInt("xp", xp).putInt("streak", streak).apply()
    }

    /** Returns true when this toggle pushed the player to a new level. */
    private fun toggle(task: TaskItem, checked: Boolean): Boolean {
        val i = tasks.indexOfFirst { it.id == task.id }
        if (i < 0) return false
        tasks[i] = tasks[i].copy(done = checked)
        val oldLevel = xp / 100
        if (checked) {
            xp += 10
            val today = dayKey()
            val last = prefs.getString("lastActive", "")
            if (last != today) {
                streak = if (last == dayKey(-1)) streak + 1 else 1
                prefs.edit().putString("lastActive", today).apply()
            }
        } else {
            xp = maxOf(0, xp - 10)
        }
        Store.save(this, tasks)
        savePrefs()
        return checked && xp / 100 > oldLevel
    }

    private fun upsert(id: Int?, title: String, h: Int, m: Int, days: Int, profile: String) {
        if (id == null) {
            val t = TaskItem(nextId++, title, h, m, profile, days)
            tasks.add(t)
            Scheduler.schedule(this, t)
        } else {
            val i = tasks.indexOfFirst { it.id == id }
            if (i >= 0) {
                val t = tasks[i].copy(title = title, hour = h, minute = m, days = days)
                tasks[i] = t
                Scheduler.schedule(this, t)
            }
        }
        Store.save(this, tasks)
    }

    private fun removeTask(t: TaskItem) {
        Scheduler.cancel(this, t.id)
        tasks.remove(t)
        Store.save(this, tasks)
    }

    private fun restoreTask(t: TaskItem) {
        tasks.add(t)
        Scheduler.schedule(this, t)
        Store.save(this, tasks)
    }

    // ---------- UI ----------
    @Composable
    private fun LevelUpApp() {
        val scheme = darkColorScheme(
            primary = Color(0xFFB69CFF), onPrimary = Color(0xFF1B1530),
            background = Color(0xFF14101F), onBackground = Color(0xFFECE6FF),
            surface = Color(0xFF14101F), onSurface = Color(0xFFECE6FF),
            surfaceVariant = Color(0xFF2A2244), onSurfaceVariant = Color(0xFFC9BEE8),
            secondaryContainer = Color(0xFF3B2F66), onSecondaryContainer = Color(0xFFECE6FF)
        )
        MaterialTheme(colorScheme = scheme) {
            CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                Screen()
            }
        }
    }

    @Composable
    private fun Screen() {
        var profile by remember { mutableStateOf("school") }
        var dialogOpen by remember { mutableStateOf(false) }
        var editing by remember { mutableStateOf<TaskItem?>(null) }
        val snack = remember { SnackbarHostState() }
        val scope = rememberCoroutineScope()
        val visible = tasks.filter { it.profile == profile }.sortedBy { it.hour * 60 + it.minute }

        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            snackbarHost = { SnackbarHost(snack) },
            floatingActionButton = {
                ExtendedFloatingActionButton(
                    onClick = { editing = null; dialogOpen = true },
                    icon = { Icon(Icons.Default.Add, contentDescription = null) },
                    text = { Text("یادآور جدید") }
                )
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item { Header(visible.count { it.done }, visible.size) }
                if (!exactOk) {
                    item {
                        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF4A3B12))) {
                            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "برای اینکه یادآورها سر ساعت دقیق بیان، اجازه‌ی «هشدار و یادآور» رو فعال کن.",
                                    modifier = Modifier.weight(1f), fontSize = 13.sp
                                )
                                TextButton(onClick = {
                                    startActivity(
                                        Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName"))
                                    )
                                }) { Text("فعال‌سازی") }
                            }
                        }
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = profile == "school", onClick = { profile = "school" },
                            label = { Text("🎒 روز مدرسه") }, modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = profile == "holiday", onClick = { profile = "holiday" },
                            label = { Text("🏖️ تعطیلات") }, modifier = Modifier.weight(1f)
                        )
                    }
                }
                if (visible.isEmpty()) {
                    item {
                        Column(
                            Modifier.fillMaxWidth().padding(vertical = 32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🌱", fontSize = 48.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("هنوز کاری نداری!", style = MaterialTheme.typography.titleMedium)
                            Text(
                                "با دکمه‌ی پایین اولین یادآور رو بساز و امتیاز جمع کن.",
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
                items(visible, key = { it.id }) { task ->
                    TaskCard(
                        task = task,
                        onToggle = {
                            val up = toggle(task, !task.done)
                            if (up) scope.launch {
                                snack.currentSnackbarData?.dismiss()
                                snack.showSnackbar("🎉 LEVEL UP! رسیدی به سطح ${(xp / 100 + 1).fa()}")
                            }
                        },
                        onEdit = { editing = task; dialogOpen = true },
                        onDelete = {
                            removeTask(task)
                            scope.launch {
                                snack.currentSnackbarData?.dismiss()
                                val r = snack.showSnackbar(
                                    "«${task.title}» حذف شد", actionLabel = "برگردان", duration = SnackbarDuration.Short
                                )
                                if (r == SnackbarResult.ActionPerformed) restoreTask(task)
                            }
                        }
                    )
                }
                item { Spacer(Modifier.height(80.dp)) }
            }
        }

        if (dialogOpen) {
            TaskDialog(initial = editing, onDismiss = { dialogOpen = false }) { t, h, m, d ->
                upsert(editing?.id, t, h, m, d, profile)
                dialogOpen = false
            }
        }
    }

    @Composable
    private fun Header(done: Int, total: Int) {
        val level = xp / 100 + 1
        val titles = listOf("تازه‌کار", "جنگجو", "قهرمان", "استاد", "افسانه")
        val rank = titles[minOf((level - 1) / 2, titles.lastIndex)]
        val prog by animateFloatAsState((xp % 100) / 100f, label = "xp")
        Card(shape = RoundedCornerShape(24.dp)) {
            Column(
                Modifier.fillMaxWidth()
                    .background(Brush.linearGradient(listOf(Color(0xFF6D4AFF), Color(0xFF3B82F6))))
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("👑", fontSize = 38.sp)
                    Spacer(Modifier.size(12.dp))
                    Column {
                        Text("سطح ${level.fa()}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(rank, color = Color.White.copy(alpha = 0.85f))
                    }
                    Spacer(Modifier.weight(1f))
                    Text("🔥 ${streak.fa()} روز", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
                Spacer(Modifier.height(14.dp))
                LinearProgressIndicator(
                    progress = { prog },
                    modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)),
                    color = Color(0xFFFFD166),
                    trackColor = Color.White.copy(alpha = 0.25f)
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    "${(xp % 100).fa()} از ۱۰۰ امتیاز تا سطح بعد",
                    fontSize = 12.sp, color = Color.White.copy(alpha = 0.85f)
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    if (total > 0 && done == total) "همه‌ی کارها انجام شد 🎉 افسانه‌ای!"
                    else "امروز: ${done.fa()} از ${total.fa()} کار",
                    color = Color.White, fontWeight = FontWeight.Medium
                )
            }
        }
    }

    @Composable
    private fun TaskCard(task: TaskItem, onToggle: () -> Unit, onEdit: () -> Unit, onDelete: () -> Unit) {
        Card(
            colors = CardDefaults.cardColors(containerColor = CardBg),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).clickable { onEdit() }
        ) {
            Row(Modifier.padding(horizontal = 6.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onToggle) {
                    Icon(
                        if (task.done) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                        contentDescription = "انجام شد",
                        tint = if (task.done) Color(0xFF6EE7A8) else MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(30.dp)
                    )
                }
                Column(Modifier.weight(1f)) {
                    Text(
                        task.title,
                        style = MaterialTheme.typography.titleMedium,
                        textDecoration = if (task.done) TextDecoration.LineThrough else null,
                        color = if (task.done) Color(0xFF9B93B8) else MaterialTheme.colorScheme.onSurface
                    )
                    val time = "${task.hour.toString().padStart(2, '0')}:${task.minute.toString().padStart(2, '0')}".fa()
                    Text(
                        "⏰ $time  •  ${daysText(task.days)}",
                        fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "حذف", tint = Color(0xFFFF8A9B))
                }
            }
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    private fun TaskDialog(initial: TaskItem?, onDismiss: () -> Unit, onSave: (String, Int, Int, Int) -> Unit) {
        var title by remember { mutableStateOf(initial?.title ?: "") }
        var days by remember { mutableIntStateOf(initial?.days ?: 127) }
        val time = rememberTimePickerState(initialHour = initial?.hour ?: 18, initialMinute = initial?.minute ?: 0, is24Hour = true)
        val valid = title.isNotBlank() && days != 0

        Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = CardBg),
                modifier = Modifier.fillMaxWidth(0.92f)
            ) {
                Column(
                    Modifier.padding(20.dp).verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        if (initial == null) "یادآور جدید ✨" else "ویرایش یادآور ✏️",
                        style = MaterialTheme.typography.titleLarge
                    )
                    OutlinedTextField(
                        value = title, onValueChange = { title = it },
                        label = { Text("عنوان کار") }, singleLine = true, modifier = Modifier.fillMaxWidth()
                    )
                    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { TimeInput(state = time) }
                    }
                    Text("روزهای تکرار")
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        dayOrder.forEach { (bit, label) ->
                            val on = (days and (1 shl bit)) != 0
                            Box(
                                Modifier.size(34.dp).clip(CircleShape)
                                    .background(if (on) MaterialTheme.colorScheme.primary else Color(0xFF3A3158))
                                    .clickable { days = days xor (1 shl bit) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(label, color = if (on) Color(0xFF1B1530) else Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)) {
                        TextButton(onClick = onDismiss) { Text("لغو") }
                        Button(
                            onClick = { if (valid) onSave(title.trim(), time.hour, time.minute, days) },
                            enabled = valid
                        ) { Text("ذخیره") }
                    }
                }
            }
        }
    }
}
