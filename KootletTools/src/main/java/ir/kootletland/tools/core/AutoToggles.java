package ir.kootletland.tools.core;
import org.bukkit.plugin.Plugin;
public final class AutoToggles {
 private final PlayerToggle compressor,pickup,smelt;
 public AutoToggles(Plugin plugin){compressor=new PlayerToggle(plugin,"auto_compress");pickup=new PlayerToggle(plugin,"auto_pickup");smelt=new PlayerToggle(plugin,"auto_smelt");}
 public PlayerToggle compressor(){return compressor;} public PlayerToggle pickup(){return pickup;} public PlayerToggle smelt(){return smelt;}
}