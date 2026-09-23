package ir.kootletland.tools.core;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.TextDecoration;
import net.kyori.adventure.text.serializer.legacy.LegacyComponentSerializer;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import net.kyori.adventure.text.serializer.minimessage.MiniMessage;
import java.util.Locale;
public final class Text {
 public static final MiniMessage MM=MiniMessage.miniMessage();
 public static final PlainTextComponentSerializer PLAIN=PlainTextComponentSerializer.plainText();
 private static final LegacyComponentSerializer LEGACY=LegacyComponentSerializer.builder().character('&').hexColors().build();
 private Text(){}
 public static Component parse(String raw){Component c=raw.indexOf('&')>=0?LEGACY.deserialize(raw):MM.deserialize(raw);return c.decorationIfAbsent(TextDecoration.ITALIC,TextDecoration.State.FALSE);}
 public static String legacy(Component c){return LEGACY.serialize(c);}
 public static String plainLower(Component c){return PLAIN.serialize(c).replaceAll("§.","").toLowerCase(Locale.ROOT);}
 public static String cleanName(String raw){return raw.replaceAll("§.","").replaceAll("&[0-9a-fk-orA-FK-OR]","").trim().toLowerCase(Locale.ROOT);}
}