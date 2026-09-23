package ir.kootletland.tools.modules.compressor;
import net.kyori.adventure.text.Component;
import org.bukkit.Material;
import java.util.List;
public record Compressible(String id,Material input,int amount,Material output,Component name,List<Component> lore,boolean glow,String permission,List<String> legacyNames) {}
