package ir.kootletland.tools;
import ir.kootletland.tools.core.AutoToggles;
import ir.kootletland.tools.core.ToolModule;
import ir.kootletland.tools.modules.autopickup.AutoPickupModule;
import ir.kootletland.tools.modules.autosmelt.AutoSmeltModule;
import ir.kootletland.tools.modules.compressor.CompressorModule;
import ir.kootletland.tools.modules.guard.GuardModule;
import org.bukkit.command.*;
import org.bukkit.plugin.java.JavaPlugin;
import java.util.*;
public final class KootletTools extends JavaPlugin implements TabExecutor {
 private final Map<String,ToolModule> modules=new LinkedHashMap<>(),commandOwners=new LinkedHashMap<>(); private AutoToggles autoToggles;
 @Override public void onEnable(){autoToggles=new AutoToggles(this);register(new CompressorModule(this));register(new GuardModule(this));register(new AutoPickupModule(this));register(new AutoSmeltModule(this));for(ToolModule m:modules.values())try{m.start();}catch(Exception e){getLogger().severe("Module '"+m.id()+"' failed to start: "+e);}for(String n:List.of("kootlettools","compress","decompress","autopickup","autosmelt")){PluginCommand c=getCommand(n);if(c!=null){c.setExecutor(this);c.setTabCompleter(this);}}}
 @Override public void onDisable(){modules.values().forEach(ToolModule::stop);}
 public AutoToggles getAutoToggles(){return autoToggles;}
 private void register(ToolModule m){modules.put(m.id(),m);for(String c:m.commands())commandOwners.put(c,m);}
 private String authors(){return String.join(", ",getDescription().getAuthors());}
 private String status(){List<String> p=new ArrayList<>();for(ToolModule m:modules.values())p.add(m.id()+(m.active()?" (on)":" (off)"));return String.join(", ",p);}
 @Override public boolean onCommand(CommandSender s,Command c,String l,String[] a){String n=c.getName().toLowerCase(Locale.ROOT);if(n.equals("kootlettools")){root(s,a);return true;}ToolModule o=commandOwners.get(n);if(o==null)return false;if(!o.active()){s.sendMessage("§cاین قابلیت خاموشه.");return true;}return o.handleCommand(s,c,l,a);}
 private void root(CommandSender s,String[] a){if(a.length>0&&a[0].equalsIgnoreCase("reload")){if(!s.hasPermission("kootlettools.admin")){s.sendMessage("§cاجازه‌ی این کار رو نداری.");return;}if(a.length>1){ToolModule m=modules.get(a[1].toLowerCase(Locale.ROOT));if(m==null){s.sendMessage("§cModules: "+String.join(", ",modules.keySet()));return;}m.restart();s.sendMessage("§aReloaded "+m.id()+" ("+(m.active()?"on":"off")+")");}else{modules.values().forEach(ToolModule::restart);s.sendMessage("§aReloaded all modules: "+status());}return;}s.sendMessage("§6KootletTools §7v"+getDescription().getVersion()+" by §f"+authors());s.sendMessage("§7Modules: §f"+status());if(s.hasPermission("kootlettools.admin"))s.sendMessage("§7/kt reload [module]");}
 @Override public List<String> onTabComplete(CommandSender s,Command c,String l,String[] a){String n=c.getName().toLowerCase(Locale.ROOT);if(n.equals("kootlettools")){List<String> o=new ArrayList<>();if(a.length==1){o.add("about");if(s.hasPermission("kootlettools.admin"))o.add("reload");}else if(a.length==2&&a[0].equalsIgnoreCase("reload")&&s.hasPermission("kootlettools.admin"))o.addAll(modules.keySet());String t=a.length==0?"":a[a.length-1].toLowerCase(Locale.ROOT);o.removeIf(x->!x.startsWith(t));return o;}ToolModule o=commandOwners.get(n);return o==null||!o.active()?List.of():o.complete(s,c,a);}
}