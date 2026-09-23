package ir.kootletland.tools.modules.compressor;
import io.papermc.paper.event.player.PlayerStonecutterRecipeSelectEvent;
import ir.kootletland.tools.KootletTools;
import ir.kootletland.tools.core.Text;
import ir.kootletland.tools.core.ToolModule;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import org.bukkit.*;
import org.bukkit.command.*;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.*;
import org.bukkit.event.*;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityPickupItemEvent;
import org.bukkit.event.inventory.*;
import org.bukkit.inventory.*;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataType;
import java.util.*;

public final class CompressorModule extends ToolModule {
 private final Map<String,Compressible> items=new LinkedHashMap<>(); private final NamespacedKey key;
 private record DecompressResult(int units,int total,boolean blocked){}
 public CompressorModule(KootletTools p){super(p,"compressor");key=new NamespacedKey(p,"compressor_id");}
 public List<String> commands(){return List.of("compress","decompress");}
 protected void onEnable(){items.clear();ConfigurationSection sec=config.getConfigurationSection("items");if(sec==null)return;for(String raw:sec.getKeys(false)){ConfigurationSection s=sec.getConfigurationSection(raw);if(s==null)continue;Material in=Material.matchMaterial(s.getString("input",""));if(in==null||in.isAir()||!in.isItem())continue;int amount=Math.max(2,s.getInt("amount",64));Material out=Material.matchMaterial(s.getString("output",in.name()));if(out==null||out.isAir()||!out.isItem())out=in;String pretty=pretty(in);Component name=Text.parse(fill(s.getString("name","Compressed "+pretty),amount,pretty));List<Component> lore=new ArrayList<>();for(String line:s.getStringList("lore"))lore.add(Text.parse(fill(line,amount,pretty)));List<String> legacy=s.getStringList("legacy-names").stream().map(Text::cleanName).filter(x->!x.isEmpty()).toList();items.put(raw.toLowerCase(Locale.ROOT),new Compressible(raw.toLowerCase(Locale.ROOT),in,amount,out,name,lore,s.getBoolean("glow",true),s.getString("permission",""),legacy));}}
 private static String fill(String x,int a,String in){return x.replace("<amount>",String.valueOf(a)).replace("<input>",in);}
 private static String pretty(Material m){StringBuilder b=new StringBuilder();for(String w:m.name().toLowerCase(Locale.ROOT).split("_")){if(!b.isEmpty())b.append(' ');b.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1));}return b.toString();}
 private ItemStack create(Compressible c){ItemStack i=new ItemStack(c.output());i.editMeta(m->{m.displayName(c.name());if(!c.lore().isEmpty())m.lore(c.lore());if(c.glow())m.setEnchantmentGlintOverride(true);m.getPersistentDataContainer().set(key,PersistentDataType.STRING,c.id());});return i;}
 private Compressible identify(ItemStack i){if(i==null||i.getType().isAir()||!i.hasItemMeta())return null;ItemMeta m=i.getItemMeta();String id=m.getPersistentDataContainer().get(key,PersistentDataType.STRING);if(id!=null)return items.get(id);if(m.hasDisplayName()&&m.displayName()!=null){String p=Text.plainLower(m.displayName());for(Compressible c:items.values())for(String n:c.legacyNames())if(p.contains(n))return c;}return null;}
 public boolean isCompressed(ItemStack i){return identify(i)!=null;}
 private boolean plain(ItemStack i,Material m){return i!=null&&i.getType()==m&&!i.hasItemMeta();}
 private int count(PlayerInventory inv,Material m){int n=0;for(ItemStack i:inv.getStorageContents())if(plain(i,m))n+=i.getAmount();return n;}
 private int capacity(PlayerInventory inv,Material m){int max=m.getMaxStackSize(),r=0;for(ItemStack i:inv.getStorageContents())if(i==null||i.getType().isAir())r+=max;else if(plain(i,m))r+=max-i.getAmount();return r;}
 private void give(Player p,ItemStack template,int total){int max=Math.max(1,template.getMaxStackSize());while(total>0){int n=Math.min(total,max);ItemStack part=template.clone();part.setAmount(n);total-=n;for(ItemStack rest:p.getInventory().addItem(part).values())p.getWorld().dropItemNaturally(p.getLocation(),rest);}}
 private int compress(Player p,Compressible c){int batches=count(p.getInventory(),c.input())/c.amount();if(batches<=0)return 0;int rem=batches*c.amount();for(int s=0;s<36&&rem>0;s++){ItemStack i=p.getInventory().getItem(s);if(!plain(i,c.input()))continue;int take=Math.min(rem,i.getAmount());rem-=take;if(take>=i.getAmount())p.getInventory().setItem(s,null);else{i=i.clone();i.setAmount(i.getAmount()-take);p.getInventory().setItem(s,i);}}give(p,create(c),batches);return batches;}
 private DecompressResult decompress(Player p,boolean all){int units=0,total=0;boolean blocked=false;int first=all?0:p.getInventory().getHeldItemSlot(),last=all?35:first;for(int s=first;s<=last;s++){ItemStack i=p.getInventory().getItem(s);Compressible c=identify(i);if(c==null)continue;int can=Math.min(i.getAmount(),capacity(p.getInventory(),c.input())/c.amount());if(can<=0){blocked=true;continue;}if(can>=i.getAmount())p.getInventory().setItem(s,null);else{i=i.clone();i.setAmount(i.getAmount()-can);p.getInventory().setItem(s,i);}give(p,new ItemStack(c.input()),can*c.amount());units+=can;total+=can*c.amount();}return new DecompressResult(units,total,blocked);}
 public boolean handleCommand(CommandSender s,Command c,String l,String[] a){if(!(s instanceof Player p)){s.sendMessage(msg("players-only"));return true;}if(c.getName().equalsIgnoreCase("decompress")){if(!p.hasPermission("kootlettools.decompress")){p.sendMessage(msg("no-permission"));return true;}DecompressResult r=decompress(p,a.length>0&&a[0].equalsIgnoreCase("all"));if(r.units()>0)p.sendMessage(msg("decompressed",Placeholder.unparsed("count",String.valueOf(r.units())),Placeholder.unparsed("total",String.valueOf(r.total()))));else p.sendMessage(msg(r.blocked()?"no-space":"nothing-to-decompress"));return true;}if(!p.hasPermission("kootlettools.compress")){p.sendMessage(msg("no-permission"));return true;}if(a.length==0){all(p);return true;}String arg=a[0].toLowerCase(Locale.ROOT);if(arg.equals("list")){p.sendMessage(msg("list-header"));for(Compressible x:items.values())p.sendMessage(msg("list-line",Placeholder.unparsed("id",x.id()),Placeholder.unparsed("amount",String.valueOf(x.amount())),Placeholder.unparsed("input",pretty(x.input())),Placeholder.component("item",x.name()),Placeholder.unparsed("have",String.valueOf(count(p.getInventory(),x.input())))));return true;}if(arg.equals("auto")){if(!p.hasPermission("kootlettools.compress.auto")){p.sendMessage(msg("no-permission"));return true;}boolean now=plugin.getAutoToggles().compressor().toggle(p,false);p.sendMessage(msg(now?"auto-on":"auto-off"));if(now)all(p);return true;}Compressible x=arg.equals("hand")?items.values().stream().filter(v->plain(p.getInventory().getItemInMainHand(),v.input())).findFirst().orElse(null):items.get(arg);if(x==null){p.sendMessage(msg("unknown-item"));return true;}int made=compress(p,x);p.sendMessage(msg(made>0?"compressed":"nothing-to-compress",Placeholder.unparsed("count",String.valueOf(made)),Placeholder.component("item",x.name()),Placeholder.unparsed("amount",String.valueOf(x.amount())),Placeholder.unparsed("input",pretty(x.input()))));return true;}
 private void all(Player p){boolean any=false;for(Compressible c:items.values())if(c.permission().isBlank()||p.hasPermission(c.permission()))if(compress(p,c)>0)any=true;if(!any)p.sendMessage(msg("nothing-at-all"));}
 @EventHandler(ignoreCancelled=true) public void pickup(EntityPickupItemEvent e){if(!(e.getEntity() instanceof Player p)||!plugin.getAutoToggles().compressor().isOn(p,false))return;Material m=e.getItem().getItemStack().getType();for(Compressible c:items.values())if(c.input()==m){plugin.getServer().getScheduler().runTask(plugin,()->{if(p.isOnline())compress(p,c);});}}
 private Component denied(){return Text.parse("<red>این آیتم فشرده‌ست و قابل استفاده نیست. با /decompress بازش کن.");}
 private void warn(List<HumanEntity> v){for(HumanEntity h:v)if(h instanceof Player p)p.sendActionBar(denied());}
 @EventHandler public void craft(PrepareItemCraftEvent e){for(ItemStack i:e.getInventory().getMatrix())if(isCompressed(i)){e.getInventory().setResult(null);warn(e.getViewers());return;}}
 @EventHandler(ignoreCancelled=true) public void stone(PlayerStonecutterRecipeSelectEvent e){if(isCompressed(e.getStonecutterInventory().getItem(0))){e.setCancelled(true);e.getPlayer().sendActionBar(denied());}}
 @EventHandler(ignoreCancelled=true) public void smelt(FurnaceSmeltEvent e){if(isCompressed(e.getSource()))e.setCancelled(true);}
 @EventHandler public void anvil(PrepareAnvilEvent e){if(isCompressed(e.getInventory().getItem(0))||isCompressed(e.getInventory().getItem(1))){e.setResult(null);warn(e.getViewers());}}
 @EventHandler(ignoreCancelled=true) public void place(BlockPlaceEvent e){if(isCompressed(e.getItemInHand())){e.setCancelled(true);e.getPlayer().sendActionBar(denied());}}
 public List<String> complete(CommandSender s,Command c,String[] a){if(a.length!=1)return List.of();List<String> o=new ArrayList<>();if(c.getName().equalsIgnoreCase("decompress"))o.add("all");else{o.addAll(items.keySet());o.addAll(List.of("hand","list","auto"));}String t=a[0].toLowerCase(Locale.ROOT);o.removeIf(x->!x.startsWith(t));return o;}
}