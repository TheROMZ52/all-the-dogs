package ir.kootletland.tools.core;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.Plugin;
public final class PlayerToggle {
 private final NamespacedKey key;
 public PlayerToggle(Plugin plugin,String name){this.key=new NamespacedKey(plugin,name);}
 public boolean isOn(Player player,boolean defaultValue){Byte stored=player.getPersistentDataContainer().get(key,PersistentDataType.BYTE);return stored==null?defaultValue:stored==1;}
 public boolean toggle(Player player,boolean defaultValue){boolean now=!isOn(player,defaultValue);player.getPersistentDataContainer().set(key,PersistentDataType.BYTE,(byte)(now?1:0));return now;}
}