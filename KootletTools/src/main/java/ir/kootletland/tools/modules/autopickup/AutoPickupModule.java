package ir.kootletland.tools.modules.autopickup;
import ir.kootletland.tools.KootletTools;
import ir.kootletland.tools.core.ToolModule;
import org.bukkit.Material;
import org.bukkit.command.*;
import org.bukkit.entity.*;
import org.bukkit.event.EventHandler;
import org.bukkit.event.block.BlockDropItemEvent;
import org.bukkit.inventory.ItemStack;
import java.util.*;
public final class AutoPickupModule extends ToolModule {
 private boolean defaultOn,requirePermission; private final Set<Material> blacklist=EnumSet.noneOf(Material.class);
 public AutoPickupModule(KootletTools p){super(p,"autopickup");} public List<String> commands(){return List.of("autopickup");}
 protected void onEnable(){defaultOn=config.getBoolean("default-on",true);requirePermission=config.getBoolean("require-permission",false);blacklist.clear();for(String n:config.getStringList("blacklist")){Material m=Material.matchMaterial(n);if(m!=null)blacklist.add(m);}}
 private boolean on(Player p){return (!requirePermission||p.hasPermission("kootlettools.autopickup.use"))&&plugin.getAutoToggles().pickup().isOn(p,defaultOn);}
 @EventHandler(ignoreCancelled=true) public void drop(BlockDropItemEvent e){Player p=e.getPlayer();if(!worldAllowed(p.getWorld())||!on(p))return;for(Item entity:new ArrayList<>(e.getItems())){ItemStack s=entity.getItemStack();if(blacklist.contains(s.getType()))continue;Map<Integer,ItemStack> left=p.getInventory().addItem(s.clone());if(left.isEmpty()){e.getItems().remove(entity);entity.remove();}else{int leftAmt=left.values().stream().mapToInt(ItemStack::getAmount).sum();entity.getItemStack().setAmount(leftAmt);}}}
 public boolean handleCommand(CommandSender s,Command c,String l,String[] a){if(!(s instanceof Player p)){s.sendMessage(msg("players-only"));return true;}if(requirePermission&&!p.hasPermission("kootlettools.autopickup.use")){p.sendMessage(msg("no-permission"));return true;}p.sendMessage(msg(plugin.getAutoToggles().pickup().toggle(p,defaultOn)?"on":"off"));return true;}
}