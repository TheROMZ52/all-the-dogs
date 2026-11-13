package com.theromz52.bixbycustom

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.AlarmClock
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

private val Background = Color(0xFF080A10)
private val SurfaceDark = Color(0xFF171D29)
private val Accent = Color(0xFF8798FF)
private val SecondaryText = Color(0xFFA5AEC0)

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var recognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent { AssistantScreen(::startRecognition, ::speak) }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("fa", "IR"))
            ttsReady = result != TextToSpeech.LANG_MISSING_DATA &&
                result != TextToSpeech.LANG_NOT_SUPPORTED
        }
    }

    private fun speak(text: String) {
        if (ttsReady) tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "assistant-response")
    }

    private fun startRecognition(onText: (String) -> Unit, onFailure: (String) -> Unit) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            onFailure("سرویس تشخیص گفتار روی این گوشی پیدا نشد.")
            return
        }
        if (recognizer == null) recognizer = SpeechRecognizer.createSpeechRecognizer(this)
        recognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) = Unit
            override fun onBeginningOfSpeech() = Unit
            override fun onRmsChanged(rmsdB: Float) = Unit
            override fun onBufferReceived(buffer: ByteArray?) = Unit
            override fun onEndOfSpeech() = Unit
            override fun onPartialResults(partialResults: Bundle?) = Unit
            override fun onEvent(eventType: Int, params: Bundle?) = Unit
            override fun onError(error: Int) = onFailure("صدات رو نگرفتم؛ دوباره امتحان کن.")
            override fun onResults(results: Bundle?) {
                val result = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                if (result.isNullOrBlank()) onFailure("متوجه نشدم؛ دوباره بگو.") else onText(result)
            }
        })
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "fa-IR")
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        recognizer?.startListening(intent)
    }

    override fun onDestroy() {
        recognizer?.destroy()
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}

private data class ChatMessage(val text: String, val fromUser: Boolean)

@Composable
private fun AssistantScreen(
    listen: ((String) -> Unit, (String) -> Unit) -> Unit,
    speak: (String) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val messages = remember {
        mutableStateListOf(ChatMessage("سلام! من دستیار اختصاصی توام. چه کاری برات انجام بدم؟", false))
    }
    var input by remember { mutableStateOf("") }
    var listening by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var settingsOpen by remember { mutableStateOf(false) }
    val prefs = remember { context.getSharedPreferences("assistant_settings", Context.MODE_PRIVATE) }
    var endpoint by remember { mutableStateOf(prefs.getString("endpoint", "https://api.openai.com/v1/chat/completions") ?: "") }
    var apiKey by remember { mutableStateOf(prefs.getString("api_key", "") ?: "") }
    var model by remember { mutableStateOf(prefs.getString("model", "gpt-4o-mini") ?: "") }

    val permissionRequest = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            listening = true
            listen(
                { text ->
                    listening = false
                    input = text
                    submitMessage(context, text, endpoint, apiKey, model, messages, speak, scope) { busy = it }
                },
                { error ->
                    listening = false
                    messages.add(ChatMessage(error, false))
                }
            )
        } else {
            messages.add(ChatMessage("برای استفاده از میکروفون، مجوز ضبط صدا لازمه.", false))
        }
    }

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Accent,
            background = Background,
            surface = SurfaceDark,
            onBackground = Color.White,
            onSurface = Color.White
        )
    ) {
        Surface(modifier = Modifier.fillMaxSize(), color = Background) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.verticalGradient(listOf(Color(0xFF1A2030), Background, Color(0xFF07080C))))
                    .padding(horizontal = 18.dp, vertical = 16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("BIXBY CUSTOM", color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                        Text("دستیار شخصی تو", color = SecondaryText, fontSize = 12.sp)
                    }
                    IconButton(onClick = { settingsOpen = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "تنظیمات", tint = SecondaryText)
                    }
                }

                Spacer(Modifier.height(10.dp))
                VoiceOrb(listening)
                Spacer(Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(9.dp)
                ) {
                    items(messages) { message -> MessageBubble(message) }
                    if (busy) item { Text("دارم فکر می‌کنم…", color = SecondaryText, modifier = Modifier.padding(8.dp)) }
                }

                Spacer(Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceDark, RoundedCornerShape(28.dp))
                        .padding(start = 16.dp, end = 5.dp, top = 5.dp, bottom = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    BasicTextField(
                        value = input,
                        onValueChange = { input = it },
                        modifier = Modifier.weight(1f).padding(vertical = 11.dp),
                        textStyle = MaterialTheme.typography.bodyLarge.copy(color = Color.White),
                        singleLine = true,
                        decorationBox = { inner ->
                            Box {
                                if (input.isEmpty()) Text("پیامت رو بنویس…", color = SecondaryText)
                                inner()
                            }
                        }
                    )
                    IconButton(onClick = {
                        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            listening = true
                            listen(
                                { text ->
                                    listening = false
                                    input = text
                                    submitMessage(context, text, endpoint, apiKey, model, messages, speak, scope) { busy = it }
                                },
                                { error ->
                                    listening = false
                                    messages.add(ChatMessage(error, false))
                                }
                            )
                        } else permissionRequest.launch(Manifest.permission.RECORD_AUDIO)
                    }) {
                        Icon(Icons.Default.Mic, contentDescription = "میکروفون", tint = if (listening) Accent else Color.White)
                    }
                    IconButton(onClick = {
                        val text = input.trim()
                        if (text.isNotEmpty() && !busy) {
                            input = ""
                            submitMessage(context, text, endpoint, apiKey, model, messages, speak, scope) { busy = it }
                        }
                    }) {
                        Icon(Icons.Default.Send, contentDescription = "ارسال", tint = Accent)
                    }
                }
                Text(
                    "فرمان‌های گوشی محلی اجرا می‌شن؛ مکالمه هوشمند به اینترنت و API نیاز داره.",
                    color = SecondaryText,
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(top = 9.dp)
                )
            }
        }
    }

    if (settingsOpen) {
        AlertDialog(
            onDismissRequest = { settingsOpen = false },
            title = { Text("اتصال هوش مصنوعی") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = endpoint, onValueChange = { endpoint = it }, label = { Text("آدرس Chat Completions") }, singleLine = true)
                    OutlinedTextField(value = apiKey, onValueChange = { apiKey = it }, label = { Text("API Key") }, singleLine = true)
                    OutlinedTextField(value = model, onValueChange = { model = it }, label = { Text("مدل") }, singleLine = true)
                    Text("کلید در حافظه خصوصی اپ ذخیره می‌شه؛ داخل مخزن قرار نمی‌گیره.", color = SecondaryText, fontSize = 11.sp)
                }
            },
            confirmButton = {
                Button(onClick = {
                    prefs.edit().putString("endpoint", endpoint.trim())
                        .putString("api_key", apiKey.trim())
                        .putString("model", model.trim()).apply()
                    settingsOpen = false
                }) { Text("ذخیره") }
            },
            dismissButton = {
                Button(onClick = { settingsOpen = false }) { Text("بستن") }
            }
        )
    }
}

@Composable
private fun VoiceOrb(active: Boolean) {
    val transition = rememberInfiniteTransition(label = "voice-orb")
    val pulse by transition.animateFloat(
        initialValue = 1f,
        targetValue = if (active) 1.15f else 1.035f,
        animationSpec = infiniteRepeatable(tween(850), RepeatMode.Reverse),
        label = "pulse"
    )
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier.padding(top = 8.dp).size(112.dp).scale(pulse)
                .background(
                    Brush.radialGradient(listOf(Color(0xFF9CAEFF), Color(0xFF465AAB), Color(0xFF202943))),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.GraphicEq, contentDescription = null, tint = Color.White, modifier = Modifier.size(48.dp))
        }
        Spacer(Modifier.height(10.dp))
        Text(if (active) "دارم گوش می‌دم…" else "آماده‌ام", color = SecondaryText, fontSize = 12.sp)
    }
}

@Composable
private fun MessageBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.fromUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(0.88f),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (message.fromUser) Color(0xFF303D69) else SurfaceDark
            )
        ) {
            Text(
                text = message.text,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 11.dp),
                color = Color.White,
                fontSize = 14.sp
            )
        }
    }
}

private fun submitMessage(
    context: Context,
    text: String,
    endpoint: String,
    apiKey: String,
    model: String,
    messages: MutableList<ChatMessage>,
    speak: (String) -> Unit,
    scope: CoroutineScope,
    setBusy: (Boolean) -> Unit
) {
    messages.add(ChatMessage(text, true))
    val normalized = text.lowercase(Locale("fa", "IR")).replace("ي", "ی").replace("ك", "ک")
    val localReply = when {
        listOf("تنظیمات گوشی", "تنظیمات رو باز", "تنظیمات را باز").any(normalized::contains) -> {
            context.startActivity(Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            "تنظیمات گوشی رو باز کردم."
        }
        listOf("وای فای", "وای‌فای", "wifi", "wi-fi").any(normalized::contains) -> {
            context.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            "صفحه تنظیمات وای‌فای رو باز کردم."
        }
        listOf("بلوتوث", "bluetooth").any(normalized::contains) -> {
            context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            "صفحه تنظیمات بلوتوث رو باز کردم."
        }
        listOf("آلارم", "زنگ بیدارباش", "ساعت رو باز").any(normalized::contains) -> {
            try {
                context.startActivity(Intent(AlarmClock.ACTION_SHOW_ALARMS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                "برنامه ساعت رو باز کردم."
            } catch (_: ActivityNotFoundException) {
                "برنامه ساعت روی گوشی پیدا نشد."
            }
        }
        normalized.contains("ماشین حساب") || normalized.contains("calculator") -> {
            val intent = Intent(Intent.ACTION_MAIN).addCategory("android.intent.category.APP_CALCULATOR")
            try {
                context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                "ماشین حساب رو باز کردم."
            } catch (_: ActivityNotFoundException) {
                "ماشین حساب روی گوشی پیدا نشد."
            }
        }
        else -> null
    }

    if (localReply != null) {
        messages.add(ChatMessage(localReply, false))
        speak(localReply)
        return
    }

    if (apiKey.isBlank()) {
        val reply = "برای این درخواست هنوز فرمان محلی ندارم. از تنظیمات، یک API سازگار با OpenAI وصل کن تا مکالمه هوشمند فعال بشه."
        messages.add(ChatMessage(reply, false))
        speak(reply)
        return
    }

    scope.launch {
        setBusy(true)
        val answer = withContext(Dispatchers.IO) { askAi(endpoint, apiKey, model, text) }
        setBusy(false)
        messages.add(ChatMessage(answer, false))
        speak(answer)
    }
}

private fun askAi(endpoint: String, apiKey: String, model: String, prompt: String): String {
    var connection: HttpURLConnection? = null
    return try {
        connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15000
            readTimeout = 30000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Authorization", "Bearer $apiKey")
        }
        val messages = JSONArray()
            .put(JSONObject().put("role", "system").put("content", "تو یک دستیار صوتی فارسی، دقیق و دوستانه برای اندروید هستی. پاسخ‌ها را کوتاه و کاربردی بده. ادعا نکن کاری روی گوشی انجام داده‌ای مگر اینکه خود اپ آن را انجام داده باشد."))
            .put(JSONObject().put("role", "user").put("content", prompt))
        val payload = JSONObject()
            .put("model", model.ifBlank { "gpt-4o-mini" })
            .put("messages", messages)
            .put("temperature", 0.7)
        connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val body = stream.bufferedReader().use { it.readText() }
        if (code !in 200..299) {
            val detail = runCatching { JSONObject(body).optJSONObject("error")?.optString("message") }.getOrNull()
            "سرویس هوش مصنوعی خطا داد: ${detail?.takeIf { it.isNotBlank() } ?: "HTTP $code"}"
        } else {
            JSONObject(body).getJSONArray("choices").getJSONObject(0)
                .getJSONObject("message").getString("content")
        }
    } catch (error: Exception) {
        "ارتباط با هوش مصنوعی برقرار نشد: ${error.localizedMessage ?: "خطای نامشخص"}"
    } finally {
        connection?.disconnect()
    }
}
