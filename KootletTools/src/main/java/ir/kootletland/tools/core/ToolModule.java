package ir.kootletland.tools.core;
import ir.kootletland.tools.KootletTools;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.tag.resolver.*;
import org.bukkit.World;
import org.bukkit.command.*;
import org.bukkit.configuration.file.*;
import org.bukkit.event.*;
import java.io.File;
import java.util.*;
public abstract class ToolModule implements Listener {
 protected final KootletTools plugin; private final String id; protected FileConfiguration config=new YamlConfiguration(); private boolean active;
 protected ToolModule(KootletTools p,String i){plugin=p;id=i;} public final String id(){return id;} public final boolean active(){return active;}
 public List<String> commands(){return List.of();} protected abstract void onEnable(); protected void onDisable(){} public boolean handleCommand(CommandSender s,Command c,String l,String[] a){return false;} public List<String> complete(CommandSender s,Command c,String[] a){return List.of();}
 public final void start(){read();if(!config.getBoolean("enabled",true)){active=false;return;}onEnable();plugin.getServer().getPluginManager().registerEvents(this,plugin);active=true;}
 public final void stop(){if(!active)return;HandlerList.unregisterAll(this);onDisable();active=false;} public final void restart(){stop();start();}
 private void read(){File folder=new File(plugin.getDataFolder(),id),file=new File(folder,"config.yml");if(!file.exists()){folder.mkdirs();plugin.saveResource(id+"/config.yml",false);}config=YamlConfiguration.loadConfiguration(file);}
 protected Component msg(String key,TagResolver... extra){String raw=config.getString("messages."+key,"<red>Missing message: "+key);TagResolver prefix=Placeholder.parsed("prefix",config.getString("messages.prefix",""));return Text.MM.deserialize(raw,TagResolver.resolver(prefix,TagResolver.resolver(extra)));}
 protected boolean worldAllowed(World world){String mode=config.getString("worlds.mode","all").toLowerCase(Locale.ROOT);boolean listed=config.getStringList("worlds.list").stream().anyMatch(w->w.equalsIgnoreCase(world.getName()));return switch(mode){case "whitelist"->listed;case "blacklist"->!listed;default->true;};}
}